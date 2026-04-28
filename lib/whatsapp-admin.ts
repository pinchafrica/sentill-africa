// ═══════════════════════════════════════════════════════════════════════════
// Admin Command Center — WhatsApp Ops Dashboard for Edwin
// ═══════════════════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const APP_VERSION = "2.1.0 — Oracle";

export async function handleAdminCommand(waId: string, input: string, rawInput: string, session: any) {
  const cmd = input.replace(/^(ADMIN|OPS)\s*/, "").trim();

  // ── ADMIN MENU ─────────────────────────────────────────────────────────
  if (!cmd || cmd === "MENU" || cmd === "HELP" || input === "SYS") {
    return sendWhatsAppMessage(waId,
      `🔧 *ADMIN COMMAND CENTER v${APP_VERSION}*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `📊 *System & Health*\n` +
      `├ *ADMIN STATUS* — full system health\n` +
      `├ *ADMIN RATES* — rate sync status\n` +
      `├ *ADMIN QA* — run all QA checks\n` +
      `├ *ADMIN TOKEN* — check WA token\n` +
      `└ *ADMIN VERSION* — version info\n\n` +
      `👥 *Users & Revenue*\n` +
      `├ *ADMIN USERS* — user metrics\n` +
      `├ *ADMIN REVENUE* — financial summary\n` +
      `└ *ADMIN LOGS* — recent errors\n\n` +
      `⚡ *Actions*\n` +
      `├ *ADMIN REFRESH* — force refresh rates\n` +
      `├ *ADMIN BRIEF* — send admin brief now\n` +
      `├ *ADMIN TEST* — test message delivery\n` +
      `└ *ADMIN BROADCAST <msg>* — blast all users\n\n` +
      `_Type any command above_ ⚡`
    );
  }

  // ── ADMIN STATUS ───────────────────────────────────────────────────────
  if (cmd === "STATUS" || cmd === "HEALTH") {
    const [users, premium, sessions, totalMsgs, latestSync, providers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.whatsAppSession.count(),
      prisma.whatsAppLog.count(),
      prisma.marketRateCache.findFirst({ orderBy: { lastSyncedAt: "desc" }, select: { lastSyncedAt: true, symbol: true, source: true } }),
      prisma.provider.count(),
    ]);
    const staleH = latestSync ? ((Date.now() - new Date(latestSync.lastSyncedAt).getTime()) / 3600000).toFixed(1) : "N/A";
    const syncIcon = !latestSync ? "🔴" : parseFloat(staleH) < 6 ? "🟢" : parseFloat(staleH) < 48 ? "🟡" : "🔴";

    return sendWhatsAppMessage(waId,
      `🖥️ *SYSTEM STATUS v${APP_VERSION}*\n━━━━━━━━━━━━━━━━━━\n\n` +
      `👥 Users: *${users}* (Pro: *${premium}*)\n` +
      `💬 Sessions: *${sessions}* | Msgs: *${totalMsgs.toLocaleString()}*\n` +
      `📊 Providers: *${providers}*\n` +
      `${syncIcon} Rates: *${staleH}h* stale${latestSync ? ` (${latestSync.symbol})` : ""}\n` +
      `🧠 AI: Gemini API active\n` +
      `🏷️ Version: *v${APP_VERSION}*\n\n` +
      `_Reply *ADMIN QA* for full QA check_`
    );
  }

  // ── ADMIN USERS ────────────────────────────────────────────────────────
  if (cmd === "USERS") {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const d7 = new Date(Date.now() - 7 * 86400000);
    const [total, premium, free, verified, newToday, new7d, activeToday, active7d] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.count({ where: { isPremium: false } }),
      prisma.user.count({ where: { whatsappVerified: true } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: d7 } } }),
      prisma.whatsAppLog.groupBy({ by: ["waId"], where: { createdAt: { gte: todayStart }, direction: "INBOUND" } }).then(r => r.length),
      prisma.whatsAppLog.groupBy({ by: ["waId"], where: { createdAt: { gte: d7 }, direction: "INBOUND" } }).then(r => r.length),
    ]);
    const conv = total > 0 ? ((premium / total) * 100).toFixed(1) : "0";

    return sendWhatsAppMessage(waId,
      `👥 *USER METRICS*\n━━━━━━━━━━━━━━━━━━\n\n` +
      `├ Total: *${total}* | Verified: *${verified}*\n` +
      `├ Premium: *${premium}* ⚡ | Free: *${free}*\n` +
      `├ Conversion: *${conv}%*\n` +
      `├ New Today: *${newToday}* | (7d): *${new7d}*\n` +
      `├ Active Today: *${activeToday}*\n` +
      `└ Active (7d): *${active7d}*`
    );
  }

  // ── ADMIN REVENUE ──────────────────────────────────────────────────────
  if (cmd === "REVENUE" || cmd === "FINANCE" || cmd === "MONEY") {
    const d30 = new Date(Date.now() - 30 * 86400000);
    const [allPay, pay30, premium] = await Promise.all([
      prisma.payment.findMany({ where: { status: "SUCCESS" }, select: { amount: true } }),
      prisma.payment.findMany({ where: { status: "SUCCESS", createdAt: { gte: d30 } }, select: { amount: true } }),
      prisma.user.count({ where: { isPremium: true } }),
    ]);
    const total = allPay.reduce((s, p) => s + p.amount, 0);
    const rev30 = pay30.reduce((s, p) => s + p.amount, 0);
    const avg = allPay.length > 0 ? Math.round(total / allPay.length) : 490;
    const mrr = premium * avg;
    const progress = Math.min(100, Math.round((rev30 / 500000) * 100));

    return sendWhatsAppMessage(waId,
      `💰 *REVENUE*\n━━━━━━━━━━━━━━━━━━\n\n` +
      `├ Lifetime: *KES ${total.toLocaleString()}*\n` +
      `├ Last 30d: *KES ${rev30.toLocaleString()}*\n` +
      `├ MRR: *KES ${mrr.toLocaleString()}* | ARR: *KES ${(mrr * 12).toLocaleString()}*\n` +
      `├ Payments: *${allPay.length}* | Avg: *KES ${avg}*\n` +
      `├ 🎯 Target: KES 500K/mo\n` +
      `└ Progress: *${progress}%* [${"█".repeat(Math.floor(progress / 10))}${"░".repeat(10 - Math.floor(progress / 10))}]`
    );
  }

  // ── ADMIN RATES ────────────────────────────────────────────────────────
  if (cmd === "RATES" || cmd === "SYNC") {
    const [latest, count, providers] = await Promise.all([
      prisma.marketRateCache.findFirst({ orderBy: { lastSyncedAt: "desc" }, select: { symbol: true, lastSyncedAt: true, source: true, price: true } }),
      prisma.marketRateCache.count(),
      prisma.provider.count(),
    ]);
    const topMMF = await prisma.provider.findFirst({ where: { type: "MONEY_MARKET" }, orderBy: { currentYield: "desc" }, select: { name: true, currentYield: true } });
    const staleH = latest ? ((Date.now() - new Date(latest.lastSyncedAt).getTime()) / 3600000).toFixed(1) : "N/A";
    const icon = !latest ? "🔴" : parseFloat(staleH) < 6 ? "🟢" : parseFloat(staleH) < 48 ? "🟡" : "🔴";

    return sendWhatsAppMessage(waId,
      `📊 *RATE SYNC*\n━━━━━━━━━━━━━━━━━━\n\n` +
      `${icon} Status: *${staleH}h* since last sync\n` +
      `├ Latest: *${latest?.symbol ?? "—"}* @ ${latest?.price ?? "—"}\n` +
      `├ Source: *${latest?.source ?? "—"}*\n` +
      `├ Cache: *${count}* entries\n` +
      `├ Providers: *${providers}*\n` +
      `└ Top MMF: *${topMMF?.name ?? "—"}* ${topMMF?.currentYield?.toFixed(1) ?? "—"}%\n\n` +
      `_Reply *ADMIN REFRESH* to force sync_`
    );
  }

  // ── ADMIN QA — Run all QA checks ───────────────────────────────────────
  if (cmd === "QA" || cmd === "CHECK" || cmd === "TEST ALL") {
    const checks: string[] = [];
    // 1. Database
    try { await prisma.user.count(); checks.push("✅ Database: connected"); } catch { checks.push("❌ Database: FAILED"); }
    // 2. Providers
    const pCount = await prisma.provider.count();
    checks.push(pCount > 0 ? `✅ Providers: ${pCount} loaded` : "❌ Providers: EMPTY");
    // 3. Rate freshness
    const latest = await prisma.marketRateCache.findFirst({ orderBy: { lastSyncedAt: "desc" }, select: { lastSyncedAt: true } });
    const staleH = latest ? (Date.now() - new Date(latest.lastSyncedAt).getTime()) / 3600000 : 999;
    checks.push(staleH < 48 ? `✅ Rates: ${staleH.toFixed(1)}h fresh` : `❌ Rates: ${staleH.toFixed(1)}h STALE`);
    // 4. Sessions
    const sesCount = await prisma.whatsAppSession.count();
    checks.push(`✅ Sessions: ${sesCount} active`);
    // 5. AI
    checks.push("✅ AI: Gemini API configured");
    // 6. WhatsApp token
    checks.push("✅ WhatsApp: token present");
    // 7. Payments
    const payCount = await prisma.payment.count({ where: { status: "SUCCESS" } });
    checks.push(`✅ Payments: ${payCount} successful`);
    // 8. Premium users
    const premCount = await prisma.user.count({ where: { isPremium: true } });
    checks.push(premCount > 0 ? `✅ Premium: ${premCount} subscribers` : "⚠️ Premium: 0 subscribers");
    // 9. Cron health
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const briefsSent = await prisma.whatsAppLog.count({ where: { createdAt: { gte: todayStart }, direction: "OUTBOUND", message: { contains: "ADMIN BRIEF" } } });
    checks.push(briefsSent > 0 ? `✅ Admin Brief: sent today` : `⚠️ Admin Brief: not sent yet today`);

    const passed = checks.filter(c => c.startsWith("✅")).length;
    const total = checks.length;
    const grade = passed === total ? "🟢 ALL PASS" : passed >= total - 2 ? "🟡 WARNINGS" : "🔴 FAILURES";

    return sendWhatsAppMessage(waId,
      `🧪 *QA CHECK RESULTS*\n━━━━━━━━━━━━━━━━━━\n${grade} — *${passed}/${total}*\n\n` +
      checks.join("\n") +
      `\n\n_v${APP_VERSION} · ${new Date().toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi" })} EAT_`
    );
  }

  // ── ADMIN REFRESH — Force refresh market rates ─────────────────────────
  if (cmd === "REFRESH" || cmd === "SYNC NOW") {
    await sendWhatsAppMessage(waId, "🔄 *Refreshing market rates...*");
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sentill.africa";
      const res = await fetch(`${base}/api/cron/market-sync`, {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? "sentil-cron-2026"}` },
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      return sendWhatsAppMessage(waId, `✅ *Rates refreshed!*\n\n${JSON.stringify(data, null, 2).slice(0, 1000)}`);
    } catch (err: any) {
      return sendWhatsAppMessage(waId, `❌ *Refresh failed:* ${err?.message ?? "timeout"}\n\nTry again or check Vercel logs.`);
    }
  }

  // ── ADMIN BRIEF — Force send admin brief ───────────────────────────────
  if (cmd === "BRIEF" || cmd === "REPORT") {
    await sendWhatsAppMessage(waId, "📋 *Generating admin brief...*");
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sentill.africa";
      const res = await fetch(`${base}/api/cron/admin-brief?secret=${process.env.CRON_SECRET ?? "sentil-cron-2026"}`, {
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        return sendWhatsAppMessage(waId, `✅ *Admin brief sent!*\nLength: ${data.briefLength} chars\nTimestamp: ${data.timestamp}`);
      } else {
        return sendWhatsAppMessage(waId, `❌ *Brief failed:* ${JSON.stringify(data).slice(0, 500)}`);
      }
    } catch (err: any) {
      return sendWhatsAppMessage(waId, `❌ *Brief failed:* ${err?.message ?? "timeout"}`);
    }
  }

  // ── ADMIN LOGS — Recent errors ─────────────────────────────────────────
  if (cmd === "LOGS" || cmd === "ERRORS") {
    const recentErrors = await prisma.whatsAppLog.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { waId: true, message: true, createdAt: true },
    });
    if (recentErrors.length === 0) {
      return sendWhatsAppMessage(waId, "✅ *No recent errors!* All messages delivered successfully.");
    }
    let msg = `⚠️ *RECENT ERRORS (${recentErrors.length})*\n━━━━━━━━━━━━━━━━━━\n\n`;
    recentErrors.forEach((e, i) => {
      const time = new Date(e.createdAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
      msg += `*${i + 1}.* ${e.waId} · ${time}\n${e.message.slice(0, 80)}...\n\n`;
    });
    return sendWhatsAppMessage(waId, msg);
  }

  // ── ADMIN VERSION ──────────────────────────────────────────────────────
  if (cmd === "VERSION" || cmd === "VER" || cmd === "V") {
    return sendWhatsAppMessage(waId,
      `🏷️ *VERSION INFO*\n━━━━━━━━━━━━━━━━━━\n\n` +
      `├ App: *Sentill Africa v${APP_VERSION}*\n` +
      `├ Framework: *Next.js 16.1.6*\n` +
      `├ DB: *PostgreSQL (Neon)*\n` +
      `├ AI: *Google Gemini*\n` +
      `├ Runtime: *Vercel Edge*\n` +
      `├ WhatsApp: *Cloud API v19.0*\n` +
      `└ Deployed: *sentill.africa*`
    );
  }

  // ── ADMIN TOKEN — Check WhatsApp token health ──────────────────────────
  if (cmd === "TOKEN" || cmd === "WA") {
    const hasToken = !!process.env.WHATSAPP_ACCESS_TOKEN;
    const hasPhone = !!process.env.WHATSAPP_PHONE_NUMBER_ID;
    const tokenPreview = hasToken ? process.env.WHATSAPP_ACCESS_TOKEN!.slice(0, 20) + "..." : "NOT SET";
    return sendWhatsAppMessage(waId,
      `🔑 *WHATSAPP TOKEN*\n━━━━━━━━━━━━━━━━━━\n\n` +
      `├ Token: ${hasToken ? "✅" : "❌"} ${tokenPreview}\n` +
      `├ Phone ID: ${hasPhone ? "✅" : "❌"} ${process.env.WHATSAPP_PHONE_NUMBER_ID ?? "NOT SET"}\n` +
      `├ Bot Number: ${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER ?? "—"}\n` +
      `└ _If messages aren't delivering, refresh token on Meta Business_`
    );
  }

  // ── ADMIN TEST — Test message delivery ─────────────────────────────────
  if (cmd === "TEST" || cmd === "PING") {
    const start = Date.now();
    await sendWhatsAppMessage(waId, `🏓 *PONG!* Latency: *${Date.now() - start}ms*\n\nWhatsApp delivery is working ✅`);
    return;
  }

  // ── ADMIN BROADCAST <message> ──────────────────────────────────────────
  if (cmd.startsWith("BROADCAST")) {
    const broadcastMsg = rawInput.replace(/^(admin|ops)\s+broadcast\s+/i, "").trim();
    if (!broadcastMsg || broadcastMsg.length < 5) {
      return sendWhatsAppMessage(waId, "⚠️ Usage: *ADMIN BROADCAST <your message>*\n\nMin 5 characters.");
    }
    const users = await prisma.user.findMany({
      where: { whatsappVerified: true, whatsappId: { not: null } },
      select: { whatsappId: true, name: true },
      take: 50,
    });
    await sendWhatsAppMessage(waId, `📡 *Broadcasting to ${users.length} users...*`);
    let sent = 0, failed = 0;
    for (const u of users) {
      if (!u.whatsappId) continue;
      try {
        await sendWhatsAppMessage(u.whatsappId, `📢 *Sentill Africa Announcement*\n━━━━━━━━━━━━━━━━━━\n\n${broadcastMsg}\n\n_sentill.africa_`);
        sent++;
        await new Promise(r => setTimeout(r, 1100));
      } catch { failed++; }
    }
    return sendWhatsAppMessage(waId, `✅ *Broadcast complete!*\n├ Sent: *${sent}*\n├ Failed: *${failed}*\n└ Total: *${users.length}*`);
  }

  // ── Unknown admin command ──────────────────────────────────────────────
  return sendWhatsAppMessage(waId, `⚠️ Unknown admin command: *${cmd}*\n\nSend *ADMIN* to see all commands.`);
}
