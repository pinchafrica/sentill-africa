import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { area, message, rating } = await req.json();

    if (!message || message.trim().length < 5) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    const session = await getSession();
    const userName = (session as any)?.name ?? "Anonymous";
    const userEmail = session?.email ?? "unknown";

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "pinchafrica@gmail.com";

    await sendEmail({
      to: adminEmail,
      subject: `[Sentill Feedback] ${area ?? "General"} — ${userName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
          <h2 style="color:#0f172a;margin-bottom:4px;">💬 New Platform Feedback</h2>
          <p style="color:#64748b;font-size:13px;margin-bottom:24px;">Submitted via Sentill Africa Dashboard</p>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <tr style="background:#f1f5f9;">
              <td style="padding:12px 16px;font-weight:700;font-size:12px;color:#475569;text-transform:uppercase;width:140px;">From</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;">${userName} (${userEmail})</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:700;font-size:12px;color:#475569;text-transform:uppercase;">Feature Area</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;">${area ?? "Not specified"}</td>
            </tr>
            <tr style="background:#f1f5f9;">
              <td style="padding:12px 16px;font-weight:700;font-size:12px;color:#475569;text-transform:uppercase;">UX Rating</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;">${rating ? `${"⭐".repeat(rating)} (${rating}/5)` : "Not rated"}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:700;font-size:12px;color:#475569;text-transform:uppercase;vertical-align:top;">Message</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;line-height:1.6;">${message.replace(/\n/g, "<br>")}</td>
            </tr>
          </table>
          <p style="color:#94a3b8;font-size:11px;margin-top:20px;text-align:center;">Sentill Africa Platform — ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Feedback API]", err);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
