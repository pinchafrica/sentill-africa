import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
const g = (base: number, v = 0.6) => JSON.stringify(Array.from({ length: 36 }, (_, i) => +(base + Math.sin(i / 4) * v * 0.4 + (Math.random() - 0.5) * v).toFixed(2)));
const j = (v: any) => JSON.stringify(v);

const providers = [
  {
    name: "IFB1/2024 Infrastructure Bond (8.5yr)", slug: "ifb1-2024-bond", type: "Bond",
    currentYield: 18.46, aum: "KES 70B", paybill: "N/A", isHalal: false,
    riskLevel: "Very Low", minimumInvest: "KES 50,000", liquidity: "Semi-Annual Coupon + NSE Tradeable",
    managementFee: 0, inceptionDate: "2024", regulatedBy: "CBK & NSE",
    email: "bonds@centralbank.go.ke", phone: "+254 020 286 0000", website: "https://centralbank.go.ke",
    description: "The IFB1/2024 is the single highest-yielding investment available in Kenya in 2024. Infrastructure Bonds are 100% TAX FREE under the Income Tax Act — your gross yield of 18.46% IS your net take-home yield. Zero withholding tax. Zero credit risk. Backed by the sovereign guarantee of the Republic of Kenya. Proceeds fund critical national infrastructure: roads, ports, energy grids, and water systems.",
    history3Year: g(18.0, 0.3),
    taxNotes: "100% TAX FREE. Infrastructure Bonds are exempt from Withholding Tax and Capital Gains Tax under Kenya's Income Tax Act (Cap 470). The 18.46% yield is your complete net return — no deductions. This is the primary reason IFBs are considered the premier yield instrument in Kenya.",
    highlights: j([
      "18.46% yield — 100% TAX FREE. What you see is what you get.",
      "Zero credit risk: backed by the Republic of Kenya's sovereign guarantee",
      "Tradeable on NSE secondary market — exit before maturity if needed",
      "Semi-annual coupon payments every 6 months for predictable cash flow",
      "8.5 year tenor: ideal for building a long-term income ladder",
      "Preferred by pension funds, HNW investors, and corporate treasuries"
    ]),
    applySteps: j([
      { step: 1, title: "Open a CDS Account at CDSC", detail: "You need a Central Depository & Settlement Corporation (CDSC) account to hold bonds. Apply at any licensed stockbroker or CBK. Present National ID, KRA PIN, and a bank account. Account opened within 3 business days. Free of charge." },
      { step: 2, title: "Open a DhowCSD Account (for direct CBK bidding)", detail: "Register at dhowcsd.centralbank.go.ke — CBK's free online bond auction platform. Link your CDS account and bank account. This allows you to bid directly at each government bond auction without a stockbroker fee." },
      { step: 3, title: "Monitor Bond Auction Calendar", detail: "CBK auctions bonds every 2 weeks. Check the upcoming auction calendar at centralbank.go.ke/securities/treasury-bonds. Each auction lists the bond series, tenor, and prospective yield. IFBs are auctioned 2–4 times per year." },
      { step: 4, title: "Submit Your Competitive or Non-Competitive Bid", detail: "Non-competitive bid: you accept the weighted average auction yield (safest, guaranteed allocation, KES 50K–KES 20M). Competitive bid: you name your price (higher potential yield, risk of rejection). Submit via DhowCSD or your stockbroker before the auction deadline." },
      { step: 5, title: "Receive Your Bond Certificate & First Coupon", detail: "Successful bids are settled within 3 business days. Your bond is credited to your CDS account. Your first coupon (semi-annual interest payment) arrives 6 months after the bond issue date directly to your registered bank account." }
    ]),
    faqs: j([
      { q: "What does TAX FREE really mean for IFBs?", a: "Under Kenya's Income Tax Act, interest earned from Infrastructure Bonds is specifically exempted from the 15% Withholding Tax that applies to all other fixed income instruments. This means if you invest KES 1,000,000 at 18.46%, you receive KES 184,600 per year — no deductions. Compare this to an MMF at 17% — after 15% WHT you net only 14.45%, which equals KES 144,500. The IFB advantage is approximately KES 40,000 extra per year per million invested." },
      { q: "What happens if I need money before the 8.5 years?", a: "Infrastructure Bonds are tradeable on the NSE secondary market through any licensed stockbroker. You can sell your bond at the prevailing market price anytime during trading hours. Bond prices fluctuate with interest rates — if rates rise, your bond price falls (and vice versa). For KES amounts above KES 500K, secondary market liquidity is generally strong." },
      { q: "What is the minimum investment?", a: "KES 50,000 for direct CBK auction bidding. Through some fund managers, you can access IFB exposure from as low as KES 10,000 via pooled bond funds." },
      { q: "Is there any risk of losing my principal?", a: "For investors who hold to maturity, there is zero risk of principal loss — the Government of Kenya guarantees 100% repayment at the bond's face value on maturity date. The only caveat: if Kenya were to default on its sovereign debt (which has never happened), there would be risk. Kenya maintains an unblemished record of bond repayment." },
      { q: "Can I use the bond as collateral for a bank loan?", a: "Yes. Most Kenyan banks accept government bonds as collateral for loans, typically at 80–90% of the bond's market value. This allows you to earn 18.46% on your bond while borrowing against it at the bank's lending rate." }
    ]),
    officeLocations: j([
      { city: "Central Bank of Kenya HQ", address: "Haile Selassie Avenue, Nairobi CBD", phone: "+254 020 286 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "CBK Mombasa Branch", address: "Treasury Square, Nkrumah Road, Mombasa", phone: "+254 041 222 0000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "CBK Kisumu Branch", address: "Oginga Odinga Street, Kisumu", phone: "+254 057 202 0000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Online — DhowCSD Platform", address: "dhowcsd.centralbank.go.ke", phone: "+254 020 286 1000", hours: "24/7 online access" }
    ]),
    accountTypes: j([
      { name: "Individual Direct Bidding (DhowCSD)", min: "KES 50,000", features: ["No broker fees", "Direct auction access", "Free CDS account", "Semi-annual coupon to bank"] },
      { name: "Via Stockbroker / Fund Manager", min: "KES 10,000 (pooled)", features: ["Lower minimum through pools", "Professional advice", "Brokerage fee: 0.1%–0.2%", "NSE secondary market access"] }
    ]),
  },
  {
    name: "IFB2/2023 Infrastructure Bond (6yr)", slug: "ifb2-2023-bond", type: "Bond",
    currentYield: 17.20, aum: "KES 55B", paybill: "N/A", isHalal: false,
    riskLevel: "Very Low", minimumInvest: "KES 50,000", liquidity: "Semi-Annual Coupon + NSE Tradeable",
    managementFee: 0, inceptionDate: "2023", regulatedBy: "CBK & NSE",
    email: "bonds@centralbank.go.ke", phone: "+254 020 286 0000", website: "https://centralbank.go.ke",
    description: "IFB2/2023 is a 6-year tax-exempt Infrastructure Bond offering 17.20% net yield with zero withholding tax. The shorter 6-year tenor vs. IFB1/2024 reduces duration risk while maintaining full tax exemption — making it ideal for investors seeking tax-free income without locking in for 8.5 years.",
    history3Year: g(17.0, 0.3),
    taxNotes: "100% TAX FREE. Same exemption as all IFBs under Kenya's Income Tax Act. 17.20% gross = 17.20% net. Compare to equivalent taxable yield: 20.24% gross (pre-WHT) would be needed to match this after tax.",
    highlights: j(["17.20% yield — 100% TAX FREE", "6-year tenor: shorter duration than IFB1/2024", "Already 2 years into its 6-year life — 4 years remaining", "NSE-tradeable for early exit liquidity", "Zero credit risk — sovereign guarantee", "KES 55B outstanding — high liquidity on NSE secondary market"]),
    applySteps: j([
      { step: 1, title: "Buy on NSE Secondary Market (Easiest)", detail: "IFB2/2023 is already issued and trading on the NSE. Contact any licensed stockbroker (Dyer & Blair, Faida Securities, AIB-AXYS Africa, Sterling Capital, Kestrel Capital) to purchase on the secondary market. No auction waiting. Minimum KES 50,000." },
      { step: 2, title: "Open CDS Account if You Don't Have One", detail: "You need a CDSC account to hold the bond. Any licensed broker can open one for you in one business day. Present National ID, KRA PIN, and bank account details. Free of charge." },
      { step: 3, title: "Place a Buy Order", detail: "Instruct your broker the face value amount you want. They execute on the NSE bond market. Settlement is T+3. Price may be above or below par depending on current market rates." },
      { step: 4, title: "Receive Bond in CDS & Collect Coupons", detail: "Bond credited to your CDS account within 3 days. Coupons (17.20% ÷ 2 = 8.60% semi-annually) paid directly to your bank account every 6 months." }
    ]),
    faqs: j([
      { q: "Should I buy IFB1/2024 or IFB2/2023?", a: "IFB1/2024 offers a higher yield (18.46% vs 17.20%) but locks you in for 8.5 years. IFB2/2023 has only 4 years remaining and a slightly lower yield. Choose IFB2 if you want shorter duration; choose IFB1 for maximum tax-free income over a longer horizon." },
      { q: "What price will I pay on the secondary market?", a: "Bond prices vary daily based on interest rate movements. Ask your broker for the current clean price and accrued interest. When rates are high (as in 2024), you may buy below par (at a discount) — boosting your effective yield above the coupon rate." },
      { q: "How do I receive my coupon payments?", a: "Coupon payments are processed by CBK and paid directly to the bank account linked to your CDS account. Payments arrive every 6 months on the bond's coupon dates." }
    ]),
    officeLocations: j([
      { city: "CBK HQ — Nairobi", address: "Haile Selassie Avenue, Nairobi CBD", phone: "+254 020 286 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "NSE Secondary Market", address: "The Exchange, 55 Westlands Road, Nairobi", phone: "+254 020 283 1000", hours: "Mon–Fri: 9:00 AM – 3:00 PM (Market Hours)" }
    ]),
    accountTypes: j([{ name: "NSE Secondary Market Purchase", min: "KES 50,000", features: ["Immediate purchase", "Existing bond trading", "Via any licensed broker", "T+3 settlement"] }]),
  },
  {
    name: "FXD1/2024 Treasury Bond (10yr)", slug: "fxd1-2024-bond", type: "Bond",
    currentYield: 16.10, aum: "KES 120B", paybill: "N/A", isHalal: false,
    riskLevel: "Very Low", minimumInvest: "KES 50,000", liquidity: "Semi-Annual Coupon + NSE Tradeable",
    managementFee: 0, inceptionDate: "2024", regulatedBy: "CBK & NSE",
    email: "bonds@centralbank.go.ke", phone: "+254 020 286 0000", website: "https://centralbank.go.ke",
    description: "FXD1/2024 is a 10-year Fixed Rate Treasury Bond — the most heavily subscribed bond in Kenya's 2024 auction calendar with KES 120B outstanding. While interest is subject to 15% WHT (unlike IFBs), the net yield of 13.69% still significantly outperforms any bank savings product for investors seeking long-term fixed income certainty.",
    history3Year: g(15.8, 0.4),
    taxNotes: "Subject to 15% WHT. Net yield after tax ≈ 13.69%. WHT deducted by CBK before coupon payments. Annual tax certificate issued by CBK for your KRA records.",
    highlights: j(["16.10% gross / 13.69% net — sovereign security", "KES 120B outstanding — highest NSE bond liquidity", "10-year fixed rate: interest rate certainty for a decade", "Semi-annual coupon payments for predictable income", "Sovereign guarantee — zero credit risk", "Ideal for pension funds, insurance companies, and conservative HNW investors"]),
    applySteps: j([
      { step: 1, title: "Bid at CBK Auction via DhowCSD", detail: "Sign up at dhowcsd.centralbank.go.ke. CBK reopens this series regularly. Non-competitive bids (KES 50K–20M) guaranteed allocation at the weighted average yield." },
      { step: 2, title: "Or Buy on NSE Secondary Market", detail: "FXD1/2024 trades daily on the NSE bond market. Contact stockbrokers: Dyer & Blair (+254 020 316 0000), AIB-AXYS Africa (+254 020 251 0000), or Faida Securities (+254 020 241 4000)." },
      { step: 3, title: "Collect Semi-Annual Coupons", detail: "CBK pays 16.10% ÷ 2 = 8.05% every 6 months to your registered bank account, less 15% WHT (net: 6.84% semi-annual)." }
    ]),
    faqs: j([
      { q: "Why is this taxable when IFBs are not?", a: "Fixed Rate Development Bonds (FXDs) fund general government expenditure, while Infrastructure Bonds (IFBs) fund specific infrastructure projects. The tax exemption is a government incentive specifically for infrastructure financing — it does not apply to general-purpose bonds." },
      { q: "What happens to my bond if interest rates change?", a: "Your coupon rate is FIXED at 16.10% for 10 years regardless of market movements. However, the market price of your bond will fluctuate — if rates fall, your bond price rises (capital gain); if rates rise, your bond price falls. If you hold to maturity, you receive exactly 16.10% regardless." },
      { q: "Who are the best stockbrokers for bond trading in Kenya?", a: "Licensed NSE bond brokers include: Dyer & Blair, AIB-AXYS Africa, Faida Securities, Kestrel Capital, Sterling Capital, and ABC Capital. Brokerage fees range from 0.1% to 0.2% of transaction value." }
    ]),
    officeLocations: j([
      { city: "CBK HQ", address: "Haile Selassie Avenue, Nairobi CBD", phone: "+254 020 286 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "NSE Bond Market", address: "55 Westlands Road, Nairobi", phone: "+254 020 283 1000", hours: "Mon–Fri: 9:00 AM – 3:00 PM" }
    ]),
    accountTypes: j([{ name: "Direct CBK / NSE Purchase", min: "KES 50,000", features: ["Fixed 16.10% for 10yrs", "Semi-annual coupons", "NSE tradeable", "No management fee"] }]),
  },
  {
    name: "FXD2/2023 Treasury Bond (5yr)", slug: "fxd2-2023-bond", type: "Bond",
    currentYield: 15.50, aum: "KES 80B", paybill: "N/A", isHalal: false,
    riskLevel: "Very Low", minimumInvest: "KES 50,000", liquidity: "Semi-Annual Coupon + NSE Tradeable",
    managementFee: 0, inceptionDate: "2023", regulatedBy: "CBK & NSE",
    email: "bonds@centralbank.go.ke", phone: "+254 020 286 0000", website: "https://centralbank.go.ke",
    description: "FXD2/2023 is a 5-year Fixed Rate Treasury Bond with approximately 3 years remaining on its tenor. It offers an ideal medium-term holding for investors seeking fixed government income without committing to a 10-year horizon. With KES 80B outstanding, secondary market liquidity is strong.",
    history3Year: g(15.0, 0.4),
    taxNotes: "15% WHT applies. Net yield ≈ 13.18%. Taxable annually at source by CBK.",
    highlights: j(["15.50% gross / 13.18% net", "Only ~3 years remaining — shorter remaining duration", "Medium-term fixed income planning tool", "Ideal for 'bond laddering' strategies", "Strong NSE secondary market: KES 80B outstanding", "Pair with IFBs for a tax-optimised bond portfolio"]),
    applySteps: j([
      { step: 1, title: "Purchase on NSE Secondary Market", detail: "Already issued and trading. Contact any NSE-licensed stockbroker with your CDS account details. Specify face value needed (min KES 50,000). T+3 settlement." },
      { step: 2, title: "Or Wait for CBK Reopening Auction", detail: "CBK periodically reopens existing bond series for additional issuance. Check centralbank.go.ke for upcoming reopening dates for FXD2/2023." }
    ]),
    faqs: j([
      { q: "What is 'bond laddering' and why use FXD2/2023 for it?", a: "Bond laddering is a strategy of holding bonds with different maturity dates so you always have income maturing soon. FXD2/2023 (maturing in ~3 years), IFB2/2023 (4 years) and FXD1/2024 (10 years) together create a ladder: short, medium, and long-term income." },
      { q: "Can I reinvest the coupons?", a: "Coupons are paid to your bank account. You can manually reinvest them into a new bond auction, an MMF, or another instrument. Unlike unit trusts, bonds do not automatically reinvest coupons." }
    ]),
    officeLocations: j([{ city: "CBK HQ / NSE", address: "Haile Selassie Ave, Nairobi / 55 Westlands Rd, Nairobi", phone: "+254 020 286 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" }]),
    accountTypes: j([{ name: "NSE Secondary Purchase", min: "KES 50,000", features: ["~3 years to maturity", "Fixed 15.50% coupon", "NSE tradeable", "Semi-annual coupons"] }]),
  },
  {
    name: "91-Day Treasury Bill", slug: "tbill-91-day", type: "T-Bill",
    currentYield: 15.80, aum: "KES 250B (Rolling Weekly)", paybill: "N/A", isHalal: false,
    riskLevel: "Zero Risk", minimumInvest: "KES 100,000", liquidity: "91 Days to Maturity",
    managementFee: 0, inceptionDate: "Perpetual", regulatedBy: "CBK",
    email: "tbills@centralbank.go.ke", phone: "+254 020 286 0000", website: "https://centralbank.go.ke",
    description: "The 91-Day Treasury Bill is Kenya's benchmark short-term money market instrument — auctioned every Monday by the Central Bank of Kenya. Investors buy at a discount and receive the full face value at the end of 91 days. The difference is your return. With zero credit risk and the highest yield among government short-term instruments, it is the cornerstone of institutional cash management in Kenya.",
    history3Year: g(15.5, 0.5),
    taxNotes: "15% WHT applies on the discount (the profit). Net yield ≈ 13.43%. Unlike bonds, WHT on T-Bills is calculated on the discount amount at time of maturity. For repeat investors who roll over their T-Bills every 91 days, this amounts to approximately 4 WHT deductions per year.",
    highlights: j(["15.80% annualised yield — auctioned EVERY Monday", "Zero credit risk — issued by the Central Bank of Kenya", "Ideal for rolling 3-month cash management cycles", "No management fees, no broker fees for DhowCSD users", "Results announced every Tuesday with same-week settlement", "Most liquid government instrument: KES 250B+ rolling weekly"]),
    applySteps: j([
      { step: 1, title: "Register on DhowCSD Platform", detail: "Visit dhowcsd.centralbank.go.ke. Click 'Register'. You need: National ID/Passport, KRA PIN, a Kenyan bank account (for settlement), and an email address. Registration takes 10–15 minutes. Your account is activated within 2 business days." },
      { step: 2, title: "Fund Your DhowCSD Settlement Account", detail: "Before bidding, transfer your investment amount + 0.1% to your linked bank account. CBK debits your account automatically when your bid is accepted. Minimum: KES 100,000. No maximum." },
      { step: 3, title: "Submit Your Bid Before Monday 2:00 PM", detail: "Log in to DhowCSD > T-Bills > 91-Day > Bid Amount. Choose 'Non-Competitive' to accept the prevailing average yield (recommended for individuals). Submit before Monday 2:00 PM for that week's auction." },
      { step: 4, title: "Auction Results Announced Tuesday", detail: "CBK publishes results every Tuesday. Non-competitive bids are always successful. You'll see your discount amount, settlement amount to pay, and maturity date." },
      { step: 5, title: "Receive Face Value at Maturity", detail: "On day 91, CBK credits the FULL face value (principal + profit) to your registered bank account. Your net profit after 15% WHT is automatically calculated and remitted to KRA." }
    ]),
    faqs: j([
      { q: "What is the difference between a competitive and non-competitive bid?", a: "Non-competitive bid: you accept whatever yield the auction determines (weighted average of all accepted competitive bids). You are guaranteed 100% allocation. Maximum KES 20M. Best for individual investors. Competitive bid: you specify the exact yield (discount rate) you want. If your bid is too high (you want too much), CBK may reject it. Used by banks and institutional investors." },
      { q: "Can I roll over my T-Bill automatically?", a: "DhowCSD allows you to set 'automatic rollover' — when your T-Bill matures, the proceeds are automatically reinvested in the next Monday auction at the new prevailing rate. You don't need to login each week." },
      { q: "What is the effective annualised yield formula?", a: "T-Bills are quoted as discount rates. For 15.80% at 91 days: Discount = Face Value × (15.80% × 91/365). If you invest KES 100,000 face value, you actually pay KES 96,064 upfront, and receive KES 100,000 at maturity. Your return of KES 3,936 represents 4.095% in 91 days, or 15.80% annualised." },
      { q: "Do I need a stockbroker?", a: "No. DhowCSD is CBK's free direct-access platform that eliminates the need for a broker. However, some banks (KCB, Equity, NCBA) also offer T-Bill investment through their platforms for existing customers." }
    ]),
    officeLocations: j([
      { city: "CBK HQ — Nairobi", address: "Haile Selassie Avenue, Nairobi CBD", phone: "+254 020 286 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "CBK Mombasa", address: "Treasury Square, Nkrumah Road, Mombasa", phone: "+254 041 222 0000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "CBK Kisumu", address: "Oginga Odinga Street, Kisumu", phone: "+254 057 202 0000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "DhowCSD Online", address: "dhowcsd.centralbank.go.ke", phone: "Online Only", hours: "Bids accepted Mon 8:00 AM – 2:00 PM" }
    ]),
    accountTypes: j([
      { name: "Individual (DhowCSD)", min: "KES 100,000", features: ["Free direct access", "No broker fee", "Non-competitive bid guaranteed", "Auto-rollover option"] },
      { name: "Corporate / Institutional", min: "KES 1,000,000", features: ["Competitive bidding", "Repo access", "Dedicated CBK account manager", "Custom settlement"] }
    ]),
  },
  {
    name: "182-Day Treasury Bill", slug: "tbill-182-day", type: "T-Bill",
    currentYield: 15.40, aum: "KES 180B (Rolling)", paybill: "N/A", isHalal: false,
    riskLevel: "Zero Risk", minimumInvest: "KES 100,000", liquidity: "182 Days to Maturity",
    managementFee: 0, inceptionDate: "Perpetual", regulatedBy: "CBK",
    email: "tbills@centralbank.go.ke", phone: "+254 020 286 0000", website: "https://centralbank.go.ke",
    description: "The 182-Day (6-month) Treasury Bill provides double the investment horizon of the 91-day bill at a slightly higher annualised yield profile. Favoured by corporate treasury teams for semi-annual cash planning and by individuals who want a predictable 6-month saving cycle. Auctioned weekly alongside the 91-day and 364-day bills.",
    history3Year: g(15.1, 0.45),
    taxNotes: "15% WHT on discount profit at maturity. Net yield ≈ 13.09%. Two WHT events per year for investors who roll over twice annually.",
    highlights: j(["15.40% annualised — 6-month commitment", "Auctioned weekly — flexible entry timing", "Zero credit risk: CBK sovereign instrument", "Popular with salaried workers for mid-year bonus cycles", "No management fees via DhowCSD", "Pairs well with 91-day for a T-Bill ladder strategy"]),
    applySteps: j([
      { step: 1, title: "Register at DhowCSD", detail: "Same process as 91-day. If already registered, simply select 182-Day T-Bill in your DhowCSD dashboard." },
      { step: 2, title: "Submit Non-Competitive Bid Before Monday 2PM", detail: "DhowCSD > T-Bills > 182-Day > Enter face value (min KES 100,000). Non-competitive bid accepts the auction's weighted average yield." },
      { step: 3, title: "Collect Full Face Value at Day 182", detail: "CBK credits your bank account with the full face value on day 182. Net profit (after 15% WHT) transferred simultaneously." }
    ]),
    faqs: j([
      { q: "Should I choose 91-day or 182-day T-Bills?", a: "The 91-day bill currently yields more (15.80% vs 15.40%) and gives you more flexibility to re-invest at new rates every 3 months. The 182-day bill locks in today's rate for 6 months — useful if you believe rates are about to fall." },
      { q: "Can I invest in both the 91-day and 182-day simultaneously?", a: "Yes. Many investors build a 'T-Bill ladder' by investing in both — giving them maturity events every 3 months while capturing different points on the yield curve." }
    ]),
    officeLocations: j([{ city: "CBK HQ / DhowCSD Online", address: "Haile Selassie Avenue, Nairobi / dhowcsd.centralbank.go.ke", phone: "+254 020 286 0000", hours: "Bids: Mon 8AM–2PM" }]),
    accountTypes: j([{ name: "Individual (DhowCSD)", min: "KES 100,000", features: ["6-month fixed return", "Weekly auction entry", "Auto-rollover available", "Zero fees"] }]),
  },
  {
    name: "364-Day Treasury Bill", slug: "tbill-364-day", type: "T-Bill",
    currentYield: 15.10, aum: "KES 150B (Rolling)", paybill: "N/A", isHalal: false,
    riskLevel: "Zero Risk", minimumInvest: "KES 100,000", liquidity: "364 Days to Maturity",
    managementFee: 0, inceptionDate: "Perpetual", regulatedBy: "CBK",
    email: "tbills@centralbank.go.ke", phone: "+254 020 286 0000", website: "https://centralbank.go.ke",
    description: "The 364-Day Treasury Bill is a one-year zero-coupon government instrument. You invest a discount amount today and receive the full face value exactly one year later in a single lump-sum payment. It is the simplest, most predictable fixed-income instrument in Kenya — perfect for annual savings goals, school fee planning, and working capital management.",
    history3Year: g(14.8, 0.4),
    taxNotes: "15% WHT deducted on the discount profit at maturity (one event per year). Net yield ≈ 12.84%. Annual WHT tax certificate issued.",
    highlights: j(["15.10% annualised — one clean annual return", "Single lump-sum payment at maturity — simple and predictable", "Zero credit risk: Republic of Kenya sovereign instrument", "Excellent for annual school fees, insurance premiums, or planned expenditure", "Auctioned weekly — flexible entry timing throughout the year", "Often used as an alternative to a 1-year bank fixed deposit (which pays 8–10%)"]),
    applySteps: j([
      { step: 1, title: "Set Up DhowCSD Account", detail: "Register free at dhowcsd.centralbank.go.ke. Link your National ID, KRA PIN, and bank account." },
      { step: 2, title: "Bid in the Monday Weekly Auction", detail: "Select 364-Day T-Bill. Submit your face value amount (minimum KES 100,000) as a non-competitive bid. CBK automatically calculates the discount amount you pay." },
      { step: 3, title: "Pay the Discounted Purchase Price", detail: "You pay less than face value upfront. Example: For KES 1,000,000 face value at 15.10%, you pay ≈ KES 869,565 today and receive the full KES 1,000,000 in 364 days." },
      { step: 4, title: "Receive Full Lump Sum at Maturity", detail: "On day 364, KES 1,000,000 arrives in your bank account. The KES 130,435 profit less 15% WHT (KES 19,565) means your net gain is KES 110,870." }
    ]),
    faqs: j([
      { q: "How is the 364-day T-Bill different from a 1-year fixed deposit?", a: "T-Bill: Government-issued, zero credit risk, 15.10% yield. Fixed Deposit: Bank-issued, up to KES 500K KDIC guaranteed, typically 8–12% yield. The T-Bill is safer AND pays nearly double the yield of most bank fixed deposits in Kenya." },
      { q: "Is there a penalty for early exit?", a: "You cannot redeem a T-Bill before maturity. However, if you urgently need liquidity, some commercial banks will lend you money against your T-Bill as collateral (repo agreement) at the interbank rate." }
    ]),
    officeLocations: j([{ city: "CBK HQ / DhowCSD", address: "Haile Selassie Avenue, Nairobi / dhowcsd.centralbank.go.ke", phone: "+254 020 286 0000", hours: "Bids: Mon 8AM–2PM" }]),
    accountTypes: j([{ name: "Individual (DhowCSD)", min: "KES 100,000", features: ["1-year fixed return", "Single lump-sum at maturity", "Weekly auction entry", "No fees"] }]),
  },
];

export async function GET() {
  try {
    for (const p of providers) {
      await prisma.provider.upsert({ where: { slug: p.slug }, update: p, create: p });
    }
    return NextResponse.json({ success: true, message: `Seeded ${providers.length} providers (Bonds & T-Bills). Run /api/seed3 for SACCOs & Pensions.`, count: providers.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
