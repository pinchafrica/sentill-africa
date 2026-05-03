/**
 * app/api/whatsapp/webhook/route.ts
 * Meta WhatsApp Cloud API webhook handler.
 * GET  → Verification challenge (required by Meta)
 * POST → Incoming messages router
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/whatsapp";
import { processIncomingMessage } from "@/lib/whatsapp-bot";
import { prisma } from "@/lib/prisma";

// ── GET: Meta webhook verification ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN ?? "sentil_webhook_2026";

  console.log("[WhatsApp] Webhook GET verification:", { mode, token, verifyToken, challenge: challenge?.slice(0, 20) });

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp] Webhook verified ✅");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[WhatsApp] Webhook verification FAILED — token mismatch");
  return new NextResponse("Forbidden", { status: 403 });
}

// ── POST: Incoming message handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  
  try {
    const rawBody = await req.text();
    
    // Log EVERYTHING for debugging
    console.log(`[WhatsApp][${timestamp}] POST webhook received, body length: ${rawBody.length}`);
    console.log(`[WhatsApp][${timestamp}] Raw body preview: ${rawBody.slice(0, 500)}`);

    // Save raw webhook payload to DB for debugging
    try {
      await prisma.whatsAppLog.create({
        data: {
          waId: "WEBHOOK_RAW",
          direction: "INBOUND",
          message: rawBody.slice(0, 2000),
          msgType: "webhook_debug",
          status: "RECEIVED",
        },
      });
    } catch (logErr) {
      console.error("[WhatsApp] Failed to log raw webhook:", logErr);
    }

    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
      // Soft mode: secret not yet configured — allow through but log a warning
      console.warn(`[WhatsApp][${timestamp}] ⚠️ WHATSAPP_APP_SECRET not set — skipping signature verification (INSECURE). Add secret to Vercel env vars ASAP.`);
    } else {
      const sig = req.headers.get("x-hub-signature-256");
      if (!verifyWebhookSignature(rawBody, sig)) {
        console.error(`[WhatsApp][${timestamp}] ❌ Invalid webhook signature — BLOCKED`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.log(`[WhatsApp][${timestamp}] ✅ Signature verified`);
    }

    const body = JSON.parse(rawBody);

    // Traverse the Meta webhook payload structure
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Handle status updates (delivered, read, etc.) — just ack
    if (value?.statuses) {
      console.log(`[WhatsApp][${timestamp}] Status update received (delivered/read)`);
      return NextResponse.json({ status: "ok" });
    }

    const messages = value?.messages;
    if (!messages?.length) {
      console.log(`[WhatsApp][${timestamp}] No messages in payload — might be a status update or other event`);
      return NextResponse.json({ status: "ok" });
    }

    console.log(`[WhatsApp][${timestamp}] Processing ${messages.length} message(s)`);

    // ── Return 200 immediately to Meta, then process async ──────────────
    // This prevents Meta from retrying and Vercel from timing out on long Gemini calls.
    const processingPromises: Promise<void>[] = [];

    for (const msg of messages) {
      const waId: string = msg.from;
      const msgId: string = msg.id; // Meta's unique wamid_xxx
      let text: string | undefined;
      let buttonPayload: string | undefined;

      // ── Deduplication: skip if we already processed this message ──────
      if (msgId) {
        try {
          const existing = await prisma.whatsAppLog.findFirst({
            where: {
              waId,
              direction: "INBOUND",
              message: { startsWith: msgId },
              createdAt: { gte: new Date(Date.now() - 120_000) }, // within last 2 min
            },
          });
          if (existing) {
            console.log(`[WhatsApp][${timestamp}] ⏭️ Duplicate message ${msgId} — skipping`);
            continue;
          }
        } catch { /* dedup check failed — process anyway */ }
      }

      // ── Handle unsupported message types gracefully ──────────────────
      if (msg.type === "reaction") {
        console.log(`[WhatsApp][${timestamp}] Reaction from ${waId} — ignoring`);
        continue;
      }

      if (msg.type === "audio" || msg.type === "ptt") {
        processingPromises.push(
          (async () => {
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            await sendWhatsAppMessage(waId,
              "🎤 I can't listen to voice notes yet — but type your question and I'll answer instantly! 🧠\n\n" +
              "Try: _What's the best MMF in Kenya?_"
            );
          })()
        );
        continue;
      }

      if (msg.type === "image" || msg.type === "video" || msg.type === "document" || msg.type === "sticker") {
        processingPromises.push(
          (async () => {
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            await sendWhatsAppMessage(waId,
              "📎 I can't process files yet — but describe your question in text and I'll help! 🧠\n\n" +
              "For example: _How do I invest KES 50,000?_"
            );
          })()
        );
        continue;
      }

      if (msg.type === "text") {
        text = msg.text?.body;
      } else if (msg.type === "interactive") {
        buttonPayload =
          msg.interactive?.button_reply?.id ??
          msg.interactive?.list_reply?.id;
        text = msg.interactive?.button_reply?.title ??
          msg.interactive?.list_reply?.title;
      }

      console.log(`[WhatsApp][${timestamp}] Message from ${waId}: type=${msg.type}, text="${text?.slice(0, 50)}", button="${buttonPayload}", id=${msgId}`);

      // ── Send read receipt (blue ticks) ─────────────────────────────────
      if (msgId) {
        try {
          const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
          const token = process.env.WHATSAPP_ACCESS_TOKEN;
          if (phoneNumberId && token) {
            fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                status: "read",
                message_id: msgId,
              }),
            }).catch(() => {}); // Fire-and-forget
          }
        } catch { /* non-critical */ }
      }

      // Process message
      processingPromises.push(
        (async () => {
          try {
            await processIncomingMessage(waId, text, buttonPayload);
            console.log(`[WhatsApp][${timestamp}] ✅ Processed message from ${waId}`);
          } catch (err) {
            console.error(`[WhatsApp][${timestamp}] ❌ processIncomingMessage error for ${waId}:`, err);
          }
        })()
      );
    }

    // Wait for all processing (within Vercel's function timeout)
    // On serverless, we can't truly fire-and-forget, so we await
    await Promise.allSettled(processingPromises);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(`[WhatsApp][${timestamp}] Webhook error:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
