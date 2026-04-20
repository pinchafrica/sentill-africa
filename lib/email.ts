import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS,
  },
});

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    if (!process.env.EMAIL_FROM && !process.env.SMTP_USER) {
      console.warn("[Email] No SMTP configured, skipping email send.");
      return false;
    }
    await transporter.sendMail({
      from: `"Sentill Africa" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return true;
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return false;
  }
}

export function buildWelcomeEmail(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:24px;padding:40px;margin-bottom:24px;text-align:center">
      <div style="width:64px;height:64px;background:rgba(59,130,246,0.2);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px">
        <span style="font-size:32px">🚀</span>
      </div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px">Welcome to Sentill, ${name}!</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0">Kenya's #1 WealthTech Intelligence Platform</p>
    </div>
    <div style="background:#ffffff;border-radius:24px;padding:32px;margin-bottom:24px;border:1px solid #e2e8f0">
      <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 16px">Your account is ready to go 🎉</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px">You now have access to Kenya's most powerful wealth intelligence platform. Track your assets, get AI-powered insights, and optimize your tax efficiency.</p>
      <div style="display:grid;gap:12px;margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0">
          <span style="font-size:20px">📊</span>
          <div><p style="font-weight:800;color:#0f172a;font-size:13px;margin:0">Track All Your Assets</p><p style="color:#64748b;font-size:12px;margin:0">MMFs, Bonds, Stocks, SACCOs & more</p></div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe">
          <span style="font-size:20px">🤖</span>
          <div><p style="font-weight:800;color:#0f172a;font-size:13px;margin:0">Sentill Africa Oracle Insights</p><p style="color:#64748b;font-size:12px;margin:0">Personalized recommendations 24/7</p></div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:#faf5ff;border-radius:12px;border:1px solid #e9d5ff">
          <span style="font-size:20px">💰</span>
          <div><p style="font-weight:800;color:#0f172a;font-size:13px;margin:0">Tax Alpha Optimization</p><p style="color:#64748b;font-size:12px;margin:0">Save up to 15% more through IFB shifting</p></div>
        </div>
      </div>
      <a href="https://sentill.africa/dashboard" style="display:block;padding:16px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;text-align:center;border-radius:12px;letter-spacing:0.05em">
        GO TO MY DASHBOARD →
      </a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">© 2026 Sentill Africa · <a href="https://sentill.africa" style="color:#3b82f6">sentill.africa</a> · You received this because you created an account.</p>
  </div>
</body>
</html>`;
}

export function buildAssetLoggedEmail(name: string, assetName: string, amount: number): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:linear-gradient(135deg,#0f172a,#064e3b);border-radius:24px;padding:40px;margin-bottom:24px;text-align:center">
      <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 8px">Asset Logged Successfully ✅</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0">Your portfolio has been updated</p>
    </div>
    <div style="background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0">
      <p style="color:#64748b;font-size:14px;margin:0 0 20px">Hi ${name},</p>
      <p style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 4px">${assetName}</p>
      <p style="color:#10b981;font-size:28px;font-weight:900;margin:0 0 20px">KES ${amount.toLocaleString()}</p>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 24px">Your investment has been logged and is now being tracked in your portfolio. The Sentill Africa Oracle will monitor this for yield changes and alert you when action is needed.</p>
      <a href="https://sentill.africa/dashboard/assets" style="display:block;padding:14px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;text-align:center;border-radius:12px">VIEW MY ASSETS →</a>
    </div>
  </div>
</body>
</html>`;
}

export function buildAIInsightEmail(name: string, insight: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:24px;padding:40px;margin-bottom:24px;text-align:center">
      <div style="font-size:32px;margin-bottom:12px">🧠</div>
      <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px">Sentill Africa Oracle Alert</h1>
      <p style="color:#a5b4fc;font-size:13px;margin:0">Weekly intelligence digest for ${name}</p>
    </div>
    <div style="background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0">
      <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:20px;border-radius:0 12px 12px 0;margin-bottom:24px">
        <p style="color:#1e40af;font-size:14px;font-style:italic;line-height:1.7;margin:0">"${insight}"</p>
      </div>
      <a href="https://sentill.africa/dashboard/analyze" style="display:block;padding:14px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;text-align:center;border-radius:12px">OPEN Sentill Africa Oracle →</a>
    </div>
  </div>
</body>
</html>`;
}

export function buildPremiumActivatedEmail(name: string, plan: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:linear-gradient(135deg,#78350f,#d97706);border-radius:24px;padding:40px;margin-bottom:24px;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">⚡</div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 8px">Premium Activated!</h1>
      <p style="color:#fef3c7;font-size:14px;margin:0">${plan} • Unlimited Access</p>
    </div>
    <div style="background:#ffffff;border-radius:24px;padding:32px;border:1px solid #fde68a">
      <p style="color:#64748b;font-size:14px;margin:0 0 20px">Congratulations ${name}! You now have full premium access to Sentill's institutional intelligence suite.</p>
      <a href="https://sentill.africa/dashboard" style="display:block;padding:14px;background:linear-gradient(135deg,#d97706,#dc2626);color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;text-align:center;border-radius:12px">ACCESS PREMIUM FEATURES →</a>
    </div>
  </div>
</body>
</html>`;
}

export function buildLoginCredentialsEmail(name: string, email: string, password: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:24px;padding:40px;margin-bottom:24px;text-align:center">
      <div style="width:64px;height:64px;background:rgba(16,185,129,0.2);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px">
        <span style="font-size:32px">🔐</span>
      </div>
      <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px">Your Website Login is Ready!</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0">Access the full Sentill Africa dashboard</p>
    </div>
    <div style="background:#ffffff;border-radius:24px;padding:32px;margin-bottom:24px;border:1px solid #e2e8f0">
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px">Hi ${name},</p>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px">You registered via WhatsApp — here are your website login credentials so you can access the full Sentill Africa dashboard, advanced analytics, and portfolio tools.</p>
      
      <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:2px solid #86efac;border-radius:16px;padding:24px;margin-bottom:24px">
        <p style="font-size:10px;font-weight:900;color:#059669;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px">Your Login Credentials</p>
        <div style="margin-bottom:12px">
          <p style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Email</p>
          <p style="font-size:18px;font-weight:900;color:#0f172a;margin:0;font-family:monospace;background:#ffffff;padding:10px 14px;border-radius:8px;border:1px solid #d1fae5">${email}</p>
        </div>
        <div>
          <p style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Temporary Password</p>
          <p style="font-size:22px;font-weight:900;color:#059669;margin:0;font-family:monospace;background:#ffffff;padding:10px 14px;border-radius:8px;border:1px solid #d1fae5;letter-spacing:2px">${password}</p>
        </div>
      </div>

      <a href="https://www.sentill.africa/auth/login" style="display:block;padding:16px;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;text-decoration:none;font-weight:900;font-size:14px;text-align:center;border-radius:12px;letter-spacing:0.05em;margin-bottom:16px">LOGIN TO SENTILL AFRICA →</a>

      <div style="display:flex;align-items:center;gap:8px;padding:12px;background:#fef3c7;border-radius:10px;border:1px solid #fde68a;margin-bottom:20px">
        <span style="font-size:16px">⚠️</span>
        <p style="color:#92400e;font-size:12px;font-weight:700;margin:0">Please change your password after first login for security.</p>
      </div>

      <div style="border-top:1px solid #e2e8f0;padding-top:20px">
        <p style="font-size:12px;font-weight:800;color:#0f172a;margin:0 0 8px">🌐 What you get on the website:</p>
        <div style="display:grid;gap:6px">
          <p style="color:#64748b;font-size:12px;margin:0">📊 Advanced portfolio charts & analytics</p>
          <p style="color:#64748b;font-size:12px;margin:0">🧠 Full AI Oracle with deep market analysis</p>
          <p style="color:#64748b;font-size:12px;margin:0">📈 Real-time NSE stock charts with RSI/MACD</p>
          <p style="color:#64748b;font-size:12px;margin:0">🏦 30+ MMF, Bond, SACCO comparisons</p>
          <p style="color:#64748b;font-size:12px;margin:0">📱 Portfolio sync across WhatsApp & Web</p>
        </div>
      </div>
    </div>
    <p style="color:#94a3b8;font-size:11px;text-align:center;margin:0">© 2026 Sentill Africa · <a href="https://www.sentill.africa" style="color:#10b981;font-weight:700">www.sentill.africa</a> · Need help? WhatsApp us at +254 703 469 525</p>
  </div>
</body>
</html>`;
}
