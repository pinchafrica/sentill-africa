import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const genHistory = (base: number, volatility: number = 0.8) =>
  JSON.stringify(Array.from({ length: 36 }, (_, i) => +(base + Math.sin(i / 4) * volatility * 0.5 + (Math.random() - 0.5) * volatility * 0.5).toFixed(2)));

const j = (v: any) => JSON.stringify(v);

const providers = [
  // ─── MONEY MARKET FUNDS ────────────────────────────────────────────────────
  {
    name: "Etica Wealth Fund",
    slug: "etica-wealth-fund",
    type: "MMF",
    currentYield: 18.20,
    aum: "KES 15B+",
    paybill: "511116",
    isHalal: false,
    riskLevel: "Low",
    minimumInvest: "KES 1,000",
    liquidity: "T+1 (Next Business Day)",
    managementFee: 2.0,
    inceptionDate: "2018",
    regulatedBy: "CMA Kenya",
    email: "info@etica.co.ke",
    phone: "+254 711 000 111",
    website: "https://etica.co.ke",
    description: "Etica Wealth Fund is Kenya's highest-yielding CMA-regulated Money Market Fund. Delivering consistent daily compound interest since 2018, with over KES 15B in assets under management and a portfolio heavily weighted in government securities and top-tier commercial paper.",
    history3Year: genHistory(16.5, 1.2),
    taxNotes: "Subject to 15% Withholding Tax (WHT) on interest. Net yield after WHT ≈ 15.47%. WHT is deducted automatically by the fund manager before distributions. No additional tax filing required for resident Kenyans.",
    highlights: j([
      "Kenya's top-ranked MMF yield at 18.20% gross p.a.",
      "Daily interest compounded — money works 24/7",
      "CMA License No. IFM/MMF/001/2018 — fully regulated",
      "Accessible via M-Pesa Paybill 511116 instantly",
      "Withdrawal processed within 1 business day",
      "Portfolio: 60% Government Securities, 30% Commercial Paper, 10% Bank Fixed Deposits"
    ]),
    applySteps: j([
      { step: 1, title: "Download the Etica App or visit etica.co.ke", detail: "Available on iOS App Store and Google Play. Alternatively open etica.co.ke on your browser. The entire onboarding takes under 10 minutes." },
      { step: 2, title: "Complete KYC Verification", detail: "Upload your National ID or Passport (front & back), a clear selfie, and your KRA PIN certificate. KYC is reviewed within 2 business hours." },
      { step: 3, title: "Fund Your Account via M-Pesa", detail: "Go to M-Pesa > Lipa Na M-Pesa > Paybill > Business No: 511116 > Account No: Your registered phone number > Enter amount (min KES 1,000)." },
      { step: 4, title: "Confirm Investment Allocation", detail: "Log into your Etica dashboard and confirm your funds have been allocated to the Etica Wealth Fund. You will see your projected daily interest immediately." },
      { step: 5, title: "Earn Daily Interest", detail: "Interest accrues every calendar day including weekends and public holidays. Watch your balance grow in real time on the Etica dashboard." }
    ]),
    faqs: j([
      { q: "What is the minimum I can invest?", a: "The minimum initial investment is KES 1,000. There is no maximum cap. Additional top-ups can be made from as little as KES 100." },
      { q: "How quickly can I withdraw my money?", a: "Withdrawal requests submitted before 2:00 PM on any business day are processed by the next business day (T+1). Amounts above KES 500,000 may take up to T+3 due to fund settlement rules." },
      { q: "Is my money safe?", a: "Etica Wealth Fund is licensed and regulated by the Capital Markets Authority (CMA) of Kenya under License No. IFM/MMF/001/2018. Your investment is held in a segregated custodial account at a reputable Kenyan bank, separate from Etica's own balance sheet." },
      { q: "Is interest paid daily?", a: "Yes. Interest accrues every calendar day (365 days a year, including weekends and holidays). It is compounded and reflected in your unit price daily. Monthly statements are sent automatically." },
      { q: "What is the effective net yield after tax?", a: "The published yield of 18.20% is the gross yield. After 15% Withholding Tax (WHT), your effective net yield is approximately 15.47%. WHT is automatically remitted to KRA by Etica — you don't need to do anything." },
      { q: "Can I set up a standing order or recurring investment?", a: "Yes. You can set up a monthly standing order from your bank account or use Etica's M-Pesa recurring payment feature. This automates dollar-cost averaging into your fund." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ", address: "Delta Towers, Westlands, Nairobi, Kenya", phone: "+254 711 000 111", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Mombasa Branch", address: "Nyali Centre, Nyali, Mombasa", phone: "+254 711 000 222", hours: "Mon–Fri: 8:30 AM – 4:30 PM" }
    ]),
    accountTypes: j([
      { name: "Individual Account", min: "KES 1,000", features: ["Daily interest", "M-Pesa access", "T+1 withdrawal", "Online dashboard"] },
      { name: "Joint Account", min: "KES 5,000", features: ["Two-signatory access", "Shared portfolio view", "Dual authorization for withdrawals"] },
      { name: "Minor Account (Junior Saver)", min: "KES 500", features: ["Managed by parent/guardian", "Locked until age 18 or goal", "Competitive daily interest"] }
    ]),
  },
  {
    name: "Cytonn Money Market Fund",
    slug: "cytonn-mmf",
    type: "MMF",
    currentYield: 16.80,
    aum: "KES 8B+",
    paybill: "525200",
    isHalal: false,
    riskLevel: "Moderate",
    minimumInvest: "KES 1,000",
    liquidity: "T+2 (48 Hours)",
    managementFee: 2.5,
    inceptionDate: "2014",
    regulatedBy: "CMA Kenya",
    email: "invest@cytonn.com",
    phone: "+254 709 100 000",
    website: "https://cytonn.com",
    description: "Cytonn MMF is a high-return money market fund focused on short-term, liquid fixed income instruments. Backed by Cytonn Investments Management, one of Kenya's most aggressive yield-seeking alternative asset managers with a track record since 2014.",
    history3Year: genHistory(15.8, 1.5),
    taxNotes: "Subject to 15% WHT. Net yield after tax ≈ 14.28%. Cytonn remits WHT directly to KRA on your behalf. Annual tax certificate provided for your records.",
    highlights: j([
      "16.80% gross yield — top 3 in Kenya",
      "Highly liquid portfolio: 70%+ in government paper",
      "9+ years of uninterrupted operations since 2014",
      "CMA regulated with quarterly published accounts",
      "USSD access: *229# for feature phone investors",
      "Corporate treasury solutions available from KES 1M"
    ]),
    applySteps: j([
      { step: 1, title: "Register at cytonn.com or via *229#", detail: "Cytonn supports both smartphone (web/app) and feature phone (USSD *229#) registration — making it accessible to all Kenyans regardless of device." },
      { step: 2, title: "Submit KYC Documents", detail: "Upload National ID (both sides), KRA PIN, and a recent passport photo. For corporate accounts, include Certificate of Incorporation and Directors' IDs." },
      { step: 3, title: "Invest via M-Pesa Paybill 525200", detail: "M-Pesa > Lipa Na M-Pesa > Paybill > 525200 > Account: Your ID number > Minimum KES 1,000." },
      { step: 4, title: "Track on Cytonn Dashboard", detail: "Log in at cytonn.com to monitor your daily accrued interest, total portfolio value, and request withdrawals." },
      { step: 5, title: "Withdraw in 48 Hours", detail: "Submit withdrawal request online. Funds arrive in your M-Pesa or bank account within 2 business days (T+2)." }
    ]),
    faqs: j([
      { q: "What is Cytonn's investment philosophy?", a: "Cytonn targets higher yields by allocating a portion of the MMF to higher-yielding corporate paper alongside government securities. This generates above-average returns but carries slightly more credit risk than pure government-only MMFs." },
      { q: "Can I invest using a feature phone?", a: "Yes! Dial *229# on any Safaricom number to access Cytonn's USSD investment platform. No smartphone or internet required." },
      { q: "What is the T+2 settlement?", a: "T+2 means your withdrawal is processed within 2 business days. If you submit before noon Monday, funds arrive by end of Wednesday. This is standard for MMFs investing in commercial paper." },
      { q: "Are corporate investments supported?", a: "Yes. Cytonn has a dedicated corporate and institutional desk for investments above KES 1M. Contact corporatedesk@cytonn.com for bespoke solutions." },
      { q: "How is the fund's risk managed?", a: "The fund maintains a maximum credit concentration of 15% per issuer, invests only in investment-grade paper, and maintains a weighted average maturity (WAM) of under 90 days for liquidity." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — The Chancery", address: "Valley Road, Upper Hill, Nairobi", phone: "+254 709 100 000", hours: "Mon–Fri: 8:00 AM – 6:00 PM, Sat: 9:00 AM – 1:00 PM" },
      { city: "Kisumu Branch", address: "Mega Plaza, Oginga Odinga Street, Kisumu", phone: "+254 709 100 100", hours: "Mon–Fri: 8:30 AM – 5:00 PM" },
      { city: "Mombasa Branch", address: "Jubilee House, Moi Avenue, Mombasa", phone: "+254 709 100 200", hours: "Mon–Fri: 8:30 AM – 5:00 PM" }
    ]),
    accountTypes: j([
      { name: "Individual MMF", min: "KES 1,000", features: ["Daily interest accrual", "M-Pesa & Bank funding", "T+2 withdrawal", "USSD *229# access"] },
      { name: "Corporate Treasury", min: "KES 1,000,000", features: ["Dedicated relationship manager", "Customised reporting", "Same-day settlement options", "Board resolution required"] }
    ]),
  },
  {
    name: "Lofty Corban MMF",
    slug: "lofty-corban-mmf",
    type: "MMF",
    currentYield: 16.20,
    aum: "KES 3B+",
    paybill: "512600",
    isHalal: false,
    riskLevel: "Low",
    minimumInvest: "KES 500",
    liquidity: "Instant (M-Pesa up to KES 300K/day)",
    managementFee: 1.8,
    inceptionDate: "2019",
    regulatedBy: "CMA Kenya",
    email: "info@loftycorban.com",
    phone: "+254 724 000 300",
    website: "https://loftycorban.com",
    description: "Lofty Corban MMF is the most accessible regulated MMF in Kenya, accepting as little as KES 500. Its flagship feature is instant M-Pesa withdrawals for amounts up to KES 300,000 per day — making it the preferred fund for Kenyans who need liquidity without compromising on returns.",
    history3Year: genHistory(15.5, 1.0),
    taxNotes: "15% WHT applies. Net yield ≈ 13.77% after tax. Lofty issues monthly WHT statements for your personal KRA filing records.",
    highlights: j([
      "Lowest entry in Kenya: start with just KES 500",
      "INSTANT M-Pesa withdrawals up to KES 300,000/day",
      "Daily compound interest — works every day of the year",
      "No withdrawal fees or penalties",
      "CMA regulated — funds held in custodial accounts at KCB",
      "Over 150,000 active investors as of 2025"
    ]),
    applySteps: j([
      { step: 1, title: "Download Lofty Corban App", detail: "Available on Google Play and App Store. Search 'Lofty Corban'. The app supports English and Kiswahili." },
      { step: 2, title: "Register with your Safaricom Number", detail: "Enter your M-Pesa registered phone number. You will receive a one-time OTP for verification." },
      { step: 3, title: "Upload ID & KRA PIN", detail: "Take a photo of your National ID (front and back) and enter your KRA PIN number. Approval is automated and instant for most accounts." },
      { step: 4, title: "Fund with as little as KES 500", detail: "M-Pesa > Lipa Na M-Pesa > Paybill 512600 > Your phone number as account. Minimum KES 500." },
      { step: 5, title: "Withdraw Instantly Anytime", detail: "Tap 'Withdraw' in the app. Enter amount (max KES 300,000/day for instant M-Pesa). Money arrives in your M-Pesa wallet in under 60 seconds." }
    ]),
    faqs: j([
      { q: "What makes Lofty Corban different from other MMFs?", a: "Two things: (1) The lowest minimum investment in Kenya at KES 500, and (2) Instant M-Pesa withdrawals. Most MMFs take 1–3 days to pay out; Lofty pays within 60 seconds for amounts up to KES 300K." },
      { q: "Why is the yield lower than some other MMFs?", a: "The premium for instant liquidity comes at a small cost. To maintain instant withdrawals, Lofty keeps a higher proportion of the portfolio in lower-yielding but instantly liquid instruments like overnight repos and short T-bills." },
      { q: "Is the KES 300K daily withdrawal limit absolute?", a: "For instant M-Pesa withdrawals, yes. For amounts above KES 300K, you can request a bank transfer which settles in 1–2 business days (T+1 or T+2) with no upper limit." },
      { q: "Can I invest on behalf of my child?", a: "Yes. The Lofty Junior Saver account allows parents/guardians to invest from as little as KES 100 on behalf of a minor, with funds locked until a goal date or the child turns 18." }
    ]),
    officeLocations: j([
      { city: "Nairobi — Hurlingham", address: "Hurlingham Shopping Centre, Argwings Kodhek Rd, Nairobi", phone: "+254 724 000 300", hours: "Mon–Fri: 8:00 AM – 5:30 PM" }
    ]),
    accountTypes: j([
      { name: "Personal Saver", min: "KES 500", features: ["Instant M-Pesa withdrawal", "Daily interest", "No lock-up period"] },
      { name: "Junior Saver", min: "KES 100", features: ["Goal-based lock-up", "Parent/guardian managed", "Birthday/school-fee scheduling"] },
      { name: "Business Account", min: "KES 10,000", features: ["Multiple signatories", "Weekly reporting", "T+1 settlement"] }
    ]),
  },
  {
    name: "Sanlam Investments MMF",
    slug: "sanlam-investments",
    type: "MMF",
    currentYield: 14.20,
    aum: "KES 50B+",
    paybill: "880100",
    isHalal: false,
    riskLevel: "Low",
    minimumInvest: "KES 1,000",
    liquidity: "T+2 (48 Hours)",
    managementFee: 1.5,
    inceptionDate: "2002",
    regulatedBy: "CMA Kenya",
    email: "invest@sanlam.co.ke",
    phone: "+254 020 286 0000",
    website: "https://sanlam.co.ke",
    description: "Sanlam Investments East Africa is part of the 107-year-old pan-African financial giant Sanlam Group, headquartered in Johannesburg. With KES 50B+ in assets under management in Kenya alone, their MMF benefits from institutional-grade portfolio management, conservative low-risk strategy, and the backing of one of Africa's largest financial services groups.",
    history3Year: genHistory(13.8, 0.6),
    taxNotes: "15% WHT on interest income. Net yield ≈ 12.07%. Sanlam provides annual tax certificates and reports directly to KRA under the exchange of information framework.",
    highlights: j([
      "Backed by Sanlam Group — 107-year-old African financial institution",
      "KES 50B+ AUM — one of Kenya's largest fund managers",
      "CMA License No. IFM/MMF/005/2002 — operating for 22+ years",
      "Consistent top-quartile performance with low volatility",
      "Access to Sanlam's broader wealth management services",
      "Dedicated institutional and HNW client desk"
    ]),
    applySteps: j([
      { step: 1, title: "Visit sanlam.co.ke or call +254 020 286 0000", detail: "You can apply online through the Sanlam Kenya portal or walk into any of their 12 Nairobi offices and branches nationwide." },
      { step: 2, title: "Complete the Application Form", detail: "Download the Sanlam MMF Application Form from their website or collect at a branch. Fill in personal details, investment amount, and banking details for withdrawals." },
      { step: 3, title: "Submit KYC Documents", detail: "Certified copy of National ID or Passport, KRA PIN Certificate, and recent utility bill or bank statement (less than 3 months old) as proof of address." },
      { step: 4, title: "Fund via EFT/RTGS or Cheque", detail: "For amounts above KES 100K, Sanlam recommends bank transfer (EFT or RTGS) to their designated custodial account. Paybill 880100 is for amounts up to KES 500K." },
      { step: 5, title: "Receive Confirmation & Login Details", detail: "Within 2 business days, you'll receive your client portal login details and investment confirmation note with allocated units." }
    ]),
    faqs: j([
      { q: "Why is Sanlam's yield lower than newer MMFs?", a: "Sanlam's conservative mandate prioritises capital preservation over maximum yield. Their portfolio is weighted 80%+ in government securities (T-Bills and Bonds), resulting in more stable but slightly lower yields versus funds that include corporate commercial paper." },
      { q: "Can I access Sanlam's other investment products?", a: "Yes. Sanlam Kenya offers unit trust funds, retirement annuities, life assurance, and direct stock market access through a single client relationship. The MMF serves as an entry point to the full Sanlam wealth ecosystem." },
      { q: "Is there a minimum for HNW (High Net Worth) accounts?", a: "Sanlam's Private Wealth desk serves clients with investments above KES 5M. This unlocks bespoke asset allocation, dedicated portfolio managers, and access to offshore investment products." },
      { q: "How long has Sanlam been in Kenya?", a: "Sanlam has operated in Kenya since 2002, making it one of the longest-operating licensed fund managers in the country with over 22 years of documented performance history." }
    ]),
    officeLocations: j([
      { city: "Nairobi — Upper Hill HQ", address: "Sanlam House, Hospital Road, Upper Hill, Nairobi", phone: "+254 020 286 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Westlands Office", address: "Westpark Suites, Chiromo Lane, Westlands", phone: "+254 020 374 0000", hours: "Mon–Fri: 8:30 AM – 5:00 PM" },
      { city: "Mombasa Branch", address: "Ambalal House, Nkrumah Road, Mombasa CBD", phone: "+254 041 222 5000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Kisumu Branch", address: "Swan Centre, Oginga Odinga Street, Kisumu", phone: "+254 057 202 5000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" }
    ]),
    accountTypes: j([
      { name: "Retail MMF", min: "KES 1,000", features: ["Online portal access", "T+2 withdrawal", "Monthly statements"] },
      { name: "Private Wealth MMF", min: "KES 5,000,000", features: ["Dedicated portfolio manager", "Bespoke allocation", "Weekly reporting", "Offshore investment access"] }
    ]),
  },
  {
    name: "NCBA Money Market Fund",
    slug: "ncba-mmf",
    type: "MMF",
    currentYield: 13.90,
    aum: "KES 35B+",
    paybill: "800000",
    isHalal: false,
    riskLevel: "Low",
    minimumInvest: "KES 1,000",
    liquidity: "T+1 (Next Business Day)",
    managementFee: 1.75,
    inceptionDate: "2010",
    regulatedBy: "CMA Kenya",
    email: "invest@ncba.com",
    phone: "+254 711 056 000",
    website: "https://ncba.group",
    description: "NCBA Money Market Fund is managed by NCBA Investment Bank, the investment arm of NCBA Group — formed from the merger of NIC Bank and Commercial Bank of Africa. With over KES 35B in assets, NCBA MMF leverages its parent bank's massive institutional fixed income desk to deliver consistent, low-risk daily yields.",
    history3Year: genHistory(13.5, 0.7),
    taxNotes: "15% WHT deducted at source. Net yield ≈ 11.82%. As NCBA is a bank-affiliated fund, WHT is reported automatically through the bank's KRA data sharing obligations — simplifying your tax records.",
    highlights: j([
      "Backed by NCBA Group — Kenya's 3rd largest bank by assets",
      "Seamless integration with NCBA Loop M-Pesa super app",
      "T+1 next-day settlement — faster than most bank-linked funds",
      "KES 35B+ AUM — institutional-grade portfolio management",
      "150+ NCBA branch network for in-person assistance",
      "Corporate MMF desk for businesses and NGOs"
    ]),
    applySteps: j([
      { step: 1, title: "Open via NCBA Now App or Loop", detail: "Download NCBA Now or NCBA Loop (M-Pesa super app) from your app store. Existing NCBA bank customers can directly invest without additional KYC." },
      { step: 2, title: "Complete Digital KYC", detail: "New customers complete KYC within the app: National ID scan, selfie verification, and KRA PIN. Approved within 30 minutes during business hours." },
      { step: 3, title: "Fund from M-Pesa or Bank Account", detail: "Transfer from your NCBA bank account instantly, or use M-Pesa Paybill 800000 with your phone number as the account number. Minimum KES 1,000." },
      { step: 4, title: "Monitor on the NCBA Investment Portal", detail: "View your MMF balance, accrued interest, and transaction history on the NCBA Now app or portal.ncba.group." },
      { step: 5, title: "Withdraw Next Business Day (T+1)", detail: "Submit withdrawal requests before 3:00 PM. Funds credited to your M-Pesa or NCBA bank account by the next business day." }
    ]),
    faqs: j([
      { q: "Do I need an NCBA bank account to invest?", a: "No. You can invest in the NCBA MMF without an NCBA bank account. However, having one speeds up KYC, enables instant transfers, and allows same-day redemptions for existing account holders." },
      { q: "What is NCBA Loop?", a: "NCBA Loop is a mobile money super-app that integrates M-Pesa, savings, loans, and investment products in one place. The NCBA MMF is accessible directly within Loop — ideal for Safaricom subscribers." },
      { q: "Can my NGO or Company invest in the NCBA MMF?", a: "Yes. NCBA has a dedicated Corporate Treasury desk. Required documents include Certificate of Incorporation, KRA PIN, Board Resolution, and Directors' IDs." },
      { q: "What is the maximum I can invest?", a: "There is no maximum for individual accounts. Corporate accounts can invest up to KES 2B in the fund, with larger amounts handled through the institutional desk." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Upper Hill", address: "NCBA Centre, Mara/Ragati Road Junction, Upper Hill, Nairobi", phone: "+254 711 056 000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Westlands Branch", address: "NCBA Westlands, Westlands Road, Nairobi", phone: "+254 711 056 100", hours: "Mon–Fri: 8:30 AM – 4:00 PM" },
      { city: "Mombasa — Treasury Square", address: "Treasury Square, Moi Avenue, Mombasa", phone: "+254 711 056 200", hours: "Mon–Fri: 8:30 AM – 3:30 PM" },
      { city: "Kisumu Branch", address: "NCBA Kisumu, Oginga Odinga Street", phone: "+254 711 056 300", hours: "Mon–Fri: 8:30 AM – 3:30 PM" }
    ]),
    accountTypes: j([
      { name: "Personal MMF", min: "KES 1,000", features: ["Linked to NCBA Bank/Loop", "T+1 settlement", "App access"] },
      { name: "Corporate Treasury MMF", min: "KES 100,000", features: ["Named signatories", "Board resolution", "Customised reporting", "Dedicated RM"] }
    ]),
  },
  {
    name: "Old Mutual Money Market Fund",
    slug: "old-mutual-mmf",
    type: "MMF",
    currentYield: 13.50,
    aum: "KES 45B+",
    paybill: "303030",
    isHalal: false,
    riskLevel: "Low",
    minimumInvest: "KES 1,000",
    liquidity: "T+2 (48 Hours)",
    managementFee: 1.5,
    inceptionDate: "2001",
    regulatedBy: "CMA Kenya",
    email: "service@oldmutual.co.ke",
    phone: "+254 020 286 2000",
    website: "https://oldmutual.co.ke",
    description: "Old Mutual Kenya is part of the 180-year-old Old Mutual Limited Group, one of Africa's largest and most trusted financial services companies. Their Kenyan MMF has operated continuously since 2001 — one of the longest track records in the country — with KES 45B+ in assets and an unbroken 23-year history of consistent returns.",
    history3Year: genHistory(13.2, 0.5),
    taxNotes: "15% WHT applies. Net effective yield ≈ 11.48%. Old Mutual issues annual P9 forms for your personal tax records. Institutional investors may apply for WHT exemptions where applicable.",
    highlights: j([
      "180-year-old institution with 23-year Kenya track record",
      "KES 45B+ AUM — institutional scale and stability",
      "Rated AA by Global Credit Ratings (GCR) South Africa",
      "Nationwide footprint: 35+ Old Mutual branches across Kenya",
      "Integrated with Old Mutual Life, Pension and Unit Trust products",
      "Zero fund administrator insolvency risk — separate custodial structure"
    ]),
    applySteps: j([
      { step: 1, title: "Visit any Old Mutual Branch or portal at oldmutual.co.ke", detail: "Old Mutual has 35+ branches across Kenya. Walk in with your documents or apply online through the portal. Dedicated investment advisors available at no charge." },
      { step: 2, title: "Meet an Investment Advisor (Optional but Recommended)", detail: "Old Mutual offers free 30-minute financial planning sessions. An advisor will assess your goals and recommend the most suitable product across their full suite including MMF, Unit Trusts, and Pension." },
      { step: 3, title: "Complete KYC & Application", detail: "National ID or Passport, KRA PIN, and proof of address. For joint/corporate accounts, additional documents apply. KYC typically processed same day in branch." },
      { step: 4, title: "Fund via M-Pesa or Bank Transfer", detail: "M-Pesa Paybill 303030 > Account: Your ID number. For EFT: Old Mutual investment account details provided upon approval. Minimum KES 1,000." },
      { step: 5, title: "Access the Old Mutual Portal", detail: "Track your MMF balance, interest accrual, and request withdrawals through the secure Old Mutual client portal at om.co.ke or the Old Mutual app." }
    ]),
    faqs: j([
      { q: "Is Old Mutual in Kenya the same as the South African parent?", a: "Old Mutual Kenya Limited is a subsidiary of Old Mutual Limited, listed on the Johannesburg Stock Exchange (JSE) and Nairobi Stock Exchange (NSE). It operates independently under Kenyan CMA and IRA regulation, but benefits from group-wide risk management and capital backing." },
      { q: "What other products can I access through Old Mutual?", a: "Old Mutual Kenya offers life insurance, group pension schemes, unit trust funds, education savings plans, and direct NSE equity access. Clients with MMF investments get preferential rates on their insurance and pension products." },
      { q: "How does Old Mutual compare to bank-linked MMFs?", a: "Old Mutual is a standalone asset manager — not affiliated with a specific bank. This means your MMF investment is managed purely for performance, not cross-sold to a bank's loan book. Funds are held by a separate custodian (Stanbic Bank)." },
      { q: "Can I switch between Old Mutual funds without withdrawing?", a: "Yes. Clients can switch between Old Mutual's MMF, equity fund, balanced fund, and bond fund through internal switches at no cost. This is tax-efficient as no WHT is triggered on switches." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Westlands", address: "Geminia Insurance Plaza, Kilimanjaro Ave, Upper Hill, Nairobi", phone: "+254 020 286 2000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "CBD Branch — Kenyatta Ave", address: "Old Mutual House, Kenyatta Avenue, Nairobi CBD", phone: "+254 020 286 2100", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Mombasa Branch", address: "Ambalal House, Nkrumah Road, Mombasa", phone: "+254 041 222 0000", hours: "Mon–Fri: 8:30 AM – 4:00 PM" },
      { city: "Nakuru Office", address: "Leon House, Kenyatta Avenue, Nakuru", phone: "+254 051 221 4000", hours: "Mon–Fri: 8:30 AM – 4:00 PM" },
      { city: "Eldoret Branch", address: "Rupa's Mall Ground Floor, Uganda Road, Eldoret", phone: "+254 053 206 3000", hours: "Mon–Fri: 8:30 AM – 4:00 PM" }
    ]),
    accountTypes: j([
      { name: "Individual MMF", min: "KES 1,000", features: ["Daily compounding", "T+2 settlement", "Portal & app access", "Free financial advisor"] },
      { name: "Corporate MMF", min: "KES 50,000", features: ["Multiple signatories", "Board resolution", "Quarterly review meetings", "Custom reporting"] },
      { name: "Education Savings Plan", min: "KES 2,000/mo", features: ["Goal-based investment", "Life cover included", "Tax-efficient structure", "School fee payout scheduling"] }
    ]),
  },
  {
    name: "Britam Money Market Fund",
    slug: "britam-mmf",
    type: "MMF",
    currentYield: 13.10,
    aum: "KES 30B+",
    paybill: "272727",
    isHalal: false,
    riskLevel: "Low",
    minimumInvest: "KES 1,000",
    liquidity: "T+2 (48 Hours)",
    managementFee: 1.6,
    inceptionDate: "2005",
    regulatedBy: "CMA Kenya",
    email: "invest@britam.com",
    phone: "+254 020 271 6000",
    website: "https://britam.com",
    description: "Britam Asset Managers is Kenya's second-largest domestically-owned asset manager with KES 30B+ under management. Founded in 2005 and listed on the NSE, Britam's MMF focuses exclusively on treasury bills and investment-grade commercial paper — creating one of the most transparent and conservative MMF mandates in Kenya.",
    history3Year: genHistory(12.8, 0.6),
    taxNotes: "15% WHT deducted at source. Net yield ≈ 11.14%. As an NSE-listed entity, Britam's fund operations are subject to enhanced audit disclosure requirements.",
    highlights: j([
      "NSE-listed parent company — maximum transparency and disclosure",
      "Portfolio restricted to T-Bills and investment-grade paper only",
      "20-year operating history — one of Kenya's oldest fund managers",
      "Britam has over 1.5 million total clients across all products",
      "Integrated with Britam Life Insurance for holistic wealth planning",
      "Digital onboarding in under 5 minutes via Britam app"
    ]),
    applySteps: j([
      { step: 1, title: "Download the Britam App or visit britam.com", detail: "Available on iOS and Android. Britam's app supports end-to-end digital onboarding including KYC, investment, and withdrawal — no branch visit required." },
      { step: 2, title: "Create Your Account", detail: "Register with your Safaricom number, email, and National ID. The app uses Smile Identity for instant biometric KYC — approved in under 3 minutes." },
      { step: 3, title: "Invest via M-Pesa Paybill 272727", detail: "M-Pesa > Lipa Na M-Pesa > Paybill 272727 > Account: Your phone number. Minimum KES 1,000. Funds reflect in your Britam portfolio within 30 minutes." },
      { step: 4, title: "Monitor on Britam Portal", detail: "Log in at britam.com/invest to view your unit balance, total value, daily interest accrual, and historical statements." },
      { step: 5, title: "Withdraw in 48 Hours", detail: "Request withdrawal via app or portal. Britam processes to your registered bank account or M-Pesa within 2 business days (T+2)." }
    ]),
    faqs: j([
      { q: "Is Britam MMF suitable for first-time investors?", a: "Absolutely. Britam's MMF is considered the safest entry point for Kenyan MMF investors due to its pure government paper mandate. The Britam app is designed for non-financial users and includes an investment calculator and educational content." },
      { q: "How is Britam's MMF different from other funds?", a: "Britam's mandate restricts the MMF to T-Bills and investment-grade paper only — no real estate, no equities, no offshore assets. This makes it the most transparent and liquid MMF in Kenya, suitable for ultra-conservative investors." },
      { q: "Does Britam report to CMA publicly?", a: "Yes. As an NSE-listed company, Britam files quarterly and annual reports publicly available on the NSE and CMA websites. This level of disclosure is unmatched by private fund managers." },
      { q: "Can I combine the MMF with Britam life insurance?", a: "Yes. Britam's 'Faida Plus' product bundles MMF-style savings with life insurance coverage. You earn market-linked returns while your family is protected in case of death or disability." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Upper Hill", address: "Britam Centre, Hospital Road, Upper Hill, Nairobi", phone: "+254 020 271 6000", hours: "Mon–Fri: 7:30 AM – 5:30 PM" },
      { city: "Westlands Branch", address: "ABC Place, Waiyaki Way, Westlands", phone: "+254 020 271 6200", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Mombasa CBD", address: "Treasury House, Moi Avenue, Mombasa", phone: "+254 041 231 4500", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Kisumu Branch", address: "Mega Plaza, Oginga Odinga Street, Kisumu", phone: "+254 057 202 4500", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Eldoret Office", address: "Zion Mall, Uganda Road, Eldoret", phone: "+254 053 206 1500", hours: "Mon–Fri: 8:30 AM – 4:30 PM" }
    ]),
    accountTypes: j([
      { name: "Personal MMF", min: "KES 1,000", features: ["100% digital onboarding", "T+2 withdrawal", "App & portal access"] },
      { name: "Faida Plus (MMF + Life Cover)", min: "KES 3,000/mo", features: ["Market-linked returns", "Life insurance cover", "Critical illness benefit", "Goal-based saving"] }
    ]),
  },
  {
    name: "First Community Bank Shariah MMF",
    slug: "first-community-shariah",
    type: "MMF",
    currentYield: 11.50,
    aum: "KES 5B+",
    paybill: "754388",
    isHalal: true,
    riskLevel: "Low",
    minimumInvest: "KES 1,000",
    liquidity: "T+2 (48 Hours)",
    managementFee: 2.0,
    inceptionDate: "2016",
    regulatedBy: "CMA Kenya",
    email: "invest@firstcommunity.co.ke",
    phone: "+254 020 327 7000",
    website: "https://firstcommunitybank.co.ke",
    description: "Kenya's only fully Shariah-compliant Money Market Fund. Managed by First Community Bank (FCB), the fund is rigorously screened by an independent Shariah Advisory Board to ensure all investments are 100% halal — excluding riba (interest), gharar (uncertainty), and haram business sectors. Ideal for Muslim investors and ethical finance advocates.",
    history3Year: genHistory(11.0, 0.5),
    taxNotes: "The fund generates 'profit' (not 'interest') under Islamic finance principles. However, KRA currently treats Shariah MMF returns under the same 15% WHT framework. FCB is actively engaging KRA for a Shariah-specific tax ruling. Net yield after WHT ≈ 9.78%.",
    highlights: j([
      "Kenya's ONLY 100% Shariah-certified Money Market Fund",
      "Overseen by an independent Shariah Advisory Board",
      "No involvement in haram sectors: alcohol, tobacco, conventional banking, weapons",
      "Returns are 'profit-sharing' (mudarabah) — not interest",
      "CMA-licensed since 2016 — consistent 5+ year track record",
      "Backed by First Community Bank — Kenya's oldest Islamic bank (est. 2007)"
    ]),
    applySteps: j([
      { step: 1, title: "Visit any FCB Branch or call +254 020 327 7000", detail: "First Community Bank has 17 branches across Kenya. The Shariah MMF is available to all Kenyans — Muslim and non-Muslim — who wish to invest ethically." },
      { step: 2, title: "Receive Shariah Compliance Briefing", detail: "FCB advisors provide a brief explanation of the fund's Islamic finance principles, the Shariah screening process, and how profit-sharing works vs. conventional interest." },
      { step: 3, title: "Complete KYC Documentation", detail: "National ID or Passport, KRA PIN, and recent utility bill or bank statement. For corporate accounts, the Certificate of Incorporation and Muslim Business Owner Declaration (optional) are required." },
      { step: 4, title: "Fund via M-Pesa Paybill 754388", detail: "M-Pesa > Lipa Na M-Pesa > Paybill 754388 > Account: Your FCB account number or ID number. Minimum KES 1,000." },
      { step: 5, title: "Receive Shariah-Compliant Profit Distributions", detail: "Profit accrues daily and is distributed monthly. FCB issues a monthly Shariah Compliance Certificate with each statement confirming the halal nature of all returns." }
    ]),
    faqs: j([
      { q: "Can non-Muslims invest in this fund?", a: "Absolutely yes. The Shariah MMF is open to all Kenyan residents. Many non-Muslims invest for ethical reasons — they prefer that their money not fund alcohol, tobacco, or arms industries. The fund label 'Shariah' refers to the investment screening, not a religious requirement for investors." },
      { q: "What is the Shariah Advisory Board?", a: "FCB's Shariah Advisory Board (SAB) consists of 4 independent Islamic finance scholars including Sheikh Dr. Mohammed Swalihu Alhassan (Ghana) and Sheikh Dr. Abdul Kadir Omar (Kenya). The SAB reviews every investment in the fund quarterly and can veto any instrument that does not meet Shariah standards." },
      { q: "What instruments does the fund invest in?", a: "The fund invests in: (1) Sukuk (Islamic bonds issued by the Kenyan government and corporates), (2) Murabaha (cost-plus financing) with halal businesses, (3) Wakala (agency-based fixed deposits with Islamic banks). No conventional interest-bearing T-Bills or commercial paper are held." },
      { q: "Why is the yield lower than non-Shariah MMFs?", a: "The Shariah screening eliminates some of the highest-yielding instruments (conventional T-Bills, commercial bank deposits, corporate bonds) in favour of sukuk and murabaha products. This narrows the investable universe slightly but ensures full compliance." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Westlands", address: "FCB Centre, Waiyaki Way, Westlands, Nairobi", phone: "+254 020 327 7000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Eastleigh Branch", address: "Eastleigh 1st Avenue, Nairobi", phone: "+254 020 327 7100", hours: "Mon–Fri: 8:00 AM – 5:00 PM, Sat: 9:00 AM – 1:00 PM" },
      { city: "Mombasa — Old Town", address: "Nkrumah Road, Old Town, Mombasa", phone: "+254 041 222 7000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Garissa Branch", address: "Garissa Town, Garissa", phone: "+254 046 202 7000", hours: "Mon–Fri: 8:30 AM – 4:00 PM" }
    ]),
    accountTypes: j([
      { name: "Individual Shariah MMF", min: "KES 1,000", features: ["Halal profit-sharing", "Daily accrual", "Monthly Shariah certificate", "T+2 settlement"] },
      { name: "Corporate Ethical Fund", min: "KES 50,000", features: ["Full Shariah audit trail", "Annual compliance report", "Custom allocation", "Ideal for Islamic banks and NGOs"] }
    ]),
  },
];

export async function GET() {
  try {
    for (const p of providers) {
      await prisma.provider.upsert({
        where: { slug: p.slug },
        update: p,
        create: p,
      });
    }

    await prisma.user.upsert({
      where: { email: "pilot@sentill.africa" },
      update: {},
      create: { id: "pilot-jd-001", name: "Executive Pilot JD-001", email: "pilot@sentill.africa", isPremium: true, role: "USER" },
    });
    await prisma.user.upsert({
      where: { email: "admin@sentill.africa" },
      update: {},
      create: { id: "admin-user", name: "Sentill Admin", email: "admin@sentill.africa", isPremium: true, role: "ADMIN" },
    });

    return NextResponse.json({ success: true, message: `Seeded ${providers.length} providers (Part 1 — MMFs). Run /api/seed2 for Bonds, T-Bills, SACCOs & Pensions.`, count: providers.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
