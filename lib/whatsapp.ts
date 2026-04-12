/**
 * lib/whatsapp.ts
 * Meta WhatsApp Business Cloud API client for Sentil.
 * Handles sending messages, verifying webhook signatures and logging.
 */

import crypto from "crypto";
import { prisma } from "./prisma";

const WA_API_BASE = "https://graph.facebook.com/v19.0";

function getPhoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) throw new Error("WHATSAPP_PHONE_NUMBER_ID not set");
  return id;
}

function getAccessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new Error("WHATSAPP_ACCESS_TOKEN not set");
  return token;
}

// ── Core sender ────────────────────────────────────────────────────────────────

export async function sendWhatsAppMessage(
  to: string,
  text: string,
  userId?: string
): Promise<void> {
  const phoneNumberId = getPhoneNumberId();
  const token = getAccessToken();

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: text },
  };

  const res = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[WhatsApp] Send failed:", err);
  }

  // Log outbound
  await prisma.whatsAppLog.create({
    data: {
      waId: to,
      userId: userId ?? null,
      direction: "OUTBOUND",
      message: text,
      msgType: "text",
      status: res.ok ? "SENT" : "FAILED",
    },
  });
}

// ── Typing indicator ─────────────────────────────────────────────────────────────
// Sends the "typing..." bubble to the WhatsApp chat so the AI feels alive
// Call this BEFORE starting the Gemini request for best effect

export async function sendTypingIndicator(to: string, messageId?: string): Promise<void> {
  try {
    const phoneNumberId = getPhoneNumberId();
    const token = getAccessToken();
    await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId ?? "wamid_placeholder",
      }),
    });
  } catch {
    // Non-critical — ignore failures silently
  }
}

// ── Interactive buttons ────────────────────────────────────────────────────────

export async function sendInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
  userId?: string
): Promise<void> {
  const phoneNumberId = getPhoneNumberId();
  const token = getAccessToken();

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  };

  const res = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[WhatsApp] Interactive send failed:", err);
  }

  await prisma.whatsAppLog.create({
    data: {
      waId: to,
      userId: userId ?? null,
      direction: "OUTBOUND",
      message: bodyText,
      msgType: "interactive",
      status: res.ok ? "SENT" : "FAILED",
    },
  });
}

// ── Image message (for chart PNGs) ────────────────────────────────────────────

export async function sendImageMessage(
  to: string,
  imageUrl: string,
  caption: string,
  userId?: string
): Promise<void> {
  const phoneNumberId = getPhoneNumberId();
  const token = getAccessToken();

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "image",
    image: { link: imageUrl, caption },
  };

  const res = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) console.error("[WhatsApp] Image send failed:", await res.text());

  await prisma.whatsAppLog.create({
    data: {
      waId: to, userId: userId ?? null, direction: "OUTBOUND",
      message: `[image] ${caption}`, msgType: "image", status: res.ok ? "SENT" : "FAILED",
    },
  });
}

// ── Interactive List Message (scrollable menu up to 10 rows) ───────────────────

export async function sendListMessage(
  to: string,
  headerText: string,
  bodyText: string,
  buttonLabel: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
  userId?: string
): Promise<void> {
  const phoneNumberId = getPhoneNumberId();
  const token = getAccessToken();

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      action: { button: buttonLabel, sections },
    },
  };

  const res = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) console.error("[WhatsApp] List send failed:", await res.text());

  await prisma.whatsAppLog.create({
    data: {
      waId: to, userId: userId ?? null, direction: "OUTBOUND",
      message: `[list] ${headerText}`, msgType: "interactive", status: res.ok ? "SENT" : "FAILED",
    },
  });
}

// ── Interactive CTA URL Button (deep-link to Sentill pages) ───────────────────

export async function sendCTAButton(
  to: string,
  bodyText: string,
  buttonText: string,
  url: string,
  userId?: string
): Promise<void> {
  const phoneNumberId = getPhoneNumberId();
  const token = getAccessToken();

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "cta_url",
      body: { text: bodyText },
      action: { name: "cta_url", parameters: { display_text: buttonText, url } },
    },
  };

  const res = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) console.error("[WhatsApp] CTA send failed:", await res.text());

  await prisma.whatsAppLog.create({
    data: {
      waId: to, userId: userId ?? null, direction: "OUTBOUND",
      message: `[cta] ${buttonText}: ${url}`, msgType: "interactive", status: res.ok ? "SENT" : "FAILED",
    },
  });
}

// ── Template sender ────────────────────────────────────────────────────────────

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  components: object[],
  userId?: string
): Promise<void> {
  const phoneNumberId = getPhoneNumberId();
  const token = getAccessToken();

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  const res = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[WhatsApp] Template send failed:", err);
  }

  await prisma.whatsAppLog.create({
    data: {
      waId: to,
      userId: userId ?? null,
      direction: "OUTBOUND",
      message: `[template:${templateName}]`,
      msgType: "template",
      status: res.ok ? "SENT" : "FAILED",
    },
  });
}

// ── Webhook signature validation ───────────────────────────────────────────────

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    // No secret configured — allow all (development/initial setup)
    return true;
  }
  if (!signatureHeader) return false;

  try {
    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex");

    const received = signatureHeader.replace("sha256=", "");

    // timingSafeEqual requires equal buffer length — guard this
    const expectedBuf = Buffer.from(expectedSig, "hex");
    const receivedBuf = Buffer.from(received, "hex");
    if (expectedBuf.length !== receivedBuf.length) return false;

    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

// ── OTP utilities ─────────────────────────────────────────────────────────────

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

// ── Normalize phone number ────────────────────────────────────────────────────

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
}
