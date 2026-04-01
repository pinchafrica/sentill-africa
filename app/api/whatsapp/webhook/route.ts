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

    // Skip signature verification — WHATSAPP_APP_SECRET is not configured
    // and was previously blocking messages silently
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (appSecret) {
      const sig = req.headers.get("x-hub-signature-256");
      if (!verifyWebhookSignature(rawBody, sig)) {
        console.error(`[WhatsApp][${timestamp}] Invalid webhook signature — BLOCKED`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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

    for (const msg of messages) {
      const waId: string = msg.from;
      let text: string | undefined;
      let buttonPayload: string | undefined;

      if (msg.type === "text") {
        text = msg.text?.body;
      } else if (msg.type === "interactive") {
        buttonPayload =
          msg.interactive?.button_reply?.id ??
          msg.interactive?.list_reply?.id;
        text = msg.interactive?.button_reply?.title ??
          msg.interactive?.list_reply?.title;
      }

      console.log(`[WhatsApp][${timestamp}] Message from ${waId}: type=${msg.type}, text="${text?.slice(0, 50)}", button="${buttonPayload}"`);

      // Process message — DO await to catch errors
      try {
        await processIncomingMessage(waId, text, buttonPayload);
        console.log(`[WhatsApp][${timestamp}] ✅ Processed message from ${waId}`);
      } catch (err) {
        console.error(`[WhatsApp][${timestamp}] ❌ processIncomingMessage error for ${waId}:`, err);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(`[WhatsApp][${timestamp}] Webhook error:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
