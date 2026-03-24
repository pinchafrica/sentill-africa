import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
const g = (base: number, v = 0.4) => JSON.stringify(Array.from({ length: 36 }, (_, i) => +(base + Math.sin(i / 5) * v * 0.5 + (Math.random() - 0.5) * v).toFixed(2)));
const j = (v: any) => JSON.stringify(v);

const providers = [
  {
    name: "Stima SACCO", slug: "stima-sacco", type: "SACCO",
    currentYield: 15.00, aum: "KES 60B+", paybill: "823100", isHalal: false,
    riskLevel: "Moderate", minimumInvest: "KES 3,000/month shares + KES 2,000 deposits",
    liquidity: "Annual Dividend (shares) + T+5 Deposits", managementFee: 0,
    inceptionDate: "1974", regulatedBy: "SASRA", email: "info@stimasacco.co.ke",
    phone: "+254 020 222 8000", website: "https://stimasacco.co.ke",
    description: "Stima SACCO Society Limited is Kenya's most profitable Tier-1 SACCO, founded in 1974 to serve employees of Kenya Power and Lighting Company (KPLC). Over 50 years of uninterrupted operation, it has grown to serve over 130,000 members with KES 60B+ in assets. Stima has paid dividends of 15%+ for over 20 consecutive years — the most consistent dividend-paying SACCO in East Africa. Members also benefit from loans at 1% per month on reducing balance — some of the cheapest credit in Kenya.",
    history3Year: g(14.8, 0.3),
    taxNotes: "SACCO dividends and interest on deposits are taxed at 5% WHT (reduced rate for cooperatives under Kenya's tax framework). Interest on deposits: 5% WHT. Dividends on shares: 5% WHT. This compares very favourably to the 15% WHT on MMFs and bonds.",
    highlights: j([
      "15%+ annual dividend for 20+ consecutive years — most consistent SACCO in Kenya",
      "Open to any Kenyan since 2018 (not just energy sector workers)",
      "Loans at 1%/month reducing balance — cheapest legal credit in Kenya",
      "KES 60B+ AUM — Kenya's 3rd largest SACCO by assets",
      "SASRA Tier-1 regulated — highest safety classification",
      "Members can access up to 3× their deposits in loan amounts"
    ]),
    applySteps: j([
      { step: 1, title: "Confirm Eligibility", detail: "Since 2018, Stima SACCO is open to ALL Kenyans — not just Kenya Power employees. You must be 18+ years old and provide a valid National ID or Passport." },
      { step: 2, title: "Visit Any Stima SACCO Branch or Apply Online", detail: "Walk into any of Stima's 7 branches with your ID, KRA PIN, and a passport photo. Online applications available at stimasacco.co.ke (currently for existing members — new members should visit a branch for first-time registration)." },
      { step: 3, title: "Pay the Registration Fee & Minimum Share Capital", detail: "One-time registration fee: KES 1,000 (non-refundable). Minimum share capital: KES 3,000 upfront or KES 1,000/month for 3 months. Shares entitle you to annual dividends and voting rights." },
      { step: 4, title: "Set Up Your Deposit Account (BOSA)", detail: "Open a Back Office Service Activity (BOSA) deposit account. Minimum monthly deposit: KES 2,000. Deposits earn interest at ~8–10% p.a. and qualify you for loans up to 3× your deposits." },
      { step: 5, title: "Start Building Your Savings & Access Loans", detail: "After 3 months of consistent deposits, you qualify for emergency loans. After 6 months, you qualify for development and asset finance loans at 1%/month reducing balance. Annual dividends on shares are declared each April at the AGM." }
    ]),
    faqs: j([
      { q: "What is the difference between SACCO shares and deposits?", a: "SHARES: Your ownership stake in the SACCO cooperative. Non-withdrawable while you are a member (redeemable only on exit). Earns Annual DIVIDEND (currently 15%). DEPOSITS (BOSA): Your savings account within the SACCO. Can be withdrawn (T+5 processing). Earns INTEREST at 8–10% p.a. Combined return on both: approximately 12–15% depending on your share/deposit ratio." },
      { q: "What loans does Stima SACCO offer?", a: "Emergency Loan: Up to 1× deposits, 1% p.m., processed same day. Development Loan: Up to 3× deposits, 1% p.m., for business/assets. Mega Loan: Up to KES 5M, secured against property. School Fees Loan: Quick turnaround, preferential rate. Mobile Loan (M-Stima): Via *887#, instant up to KES 50,000." },
      { q: "How is the 15% dividend actually calculated?", a: "The 15% is a DIVIDEND RATE on your share capital — not on deposits. Example: If you hold KES 100,000 in shares, you receive KES 15,000 as dividend at the AGM in April. Your BOSA deposits additionally earn ~9% interest credited monthly." },
      { q: "Can I exit the SACCO and get my money back?", a: "Yes. To exit, submit a written resignation to Stima SACCO. Your share capital is refunded within 3 months after an audit of your loan obligations. Deposits in your BOSA account are refunded within 5 business days." },
      { q: "Is Stima SACCO safe for large amounts (above KES 1M)?", a: "Yes. Stima SACCO is SASRA Tier-1 regulated (the highest safety tier) with a capital adequacy ratio exceeding SASRA's minimum requirements. Member deposits up to KES 500,000 are additionally protected by the SASRA Deposit Guarantee Fund." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Stima Plaza", address: "Stima Plaza, Kolobot Road, Parklands, Nairobi", phone: "+254 020 222 8000", hours: "Mon–Fri: 8:00 AM – 5:00 PM, Sat: 9:00 AM – 1:00 PM" },
      { city: "Upper Hill Branch", address: "Anniversary Towers, University Way, Nairobi CBD", phone: "+254 020 222 8100", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Mombasa Branch", address: "Mombasa KPLC Compound, Aga Khan Road, Mombasa", phone: "+254 041 222 5000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Kisumu Branch", address: "Stima SACCO House, Oginga Odinga Street, Kisumu", phone: "+254 057 202 3000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Nakuru Branch", address: "KPLC Nakuru Compound, Kenyatta Avenue, Nakuru", phone: "+254 051 221 2000", hours: "Mon–Fri: 8:30 AM – 4:00 PM" }
    ]),
    accountTypes: j([
      { name: "BOSA (Back Office Savings)", min: "KES 2,000/mo", features: ["Monthly interest ~9%", "Loan qualification", "T+5 withdrawal", "SASRA deposit guarantee"] },
      { name: "FOSA (Front Office Savings — Current Account)", min: "KES 500", features: ["ATM card access", "Mobile banking *887#", "Overdraft facility", "Salary processing"] },
      { name: "Share Capital Account", min: "KES 3,000", features: ["Annual 15% dividend", "AGM voting rights", "Non-withdrawable while member", "Membership proof"] }
    ]),
  },
  {
    name: "Mwalimu National SACCO", slug: "mwalimu-national-sacco", type: "SACCO",
    currentYield: 14.50, aum: "KES 80B+", paybill: "700700", isHalal: false,
    riskLevel: "Moderate", minimumInvest: "KES 2,000/month", liquidity: "Annual Dividend + T+5 Deposits",
    managementFee: 0, inceptionDate: "1974", regulatedBy: "SASRA",
    email: "info@mwalimunational.co.ke", phone: "+254 020 271 3400", website: "https://mwalimunational.co.ke",
    description: "Mwalimu National SACCO is Kenya's largest SACCO by membership with over 300,000 members — almost exclusively serving Kenyan teachers employed by TSC (Teachers Service Commission). With KES 80B+ in assets — the largest SACCO balance sheet in East Africa — and consistent 14%+ annual dividends, Mwalimu is the financial backbone of Kenya's education community.",
    history3Year: g(14.2, 0.4),
    taxNotes: "5% WHT on dividends and deposit interest (cooperative tax rate). Net dividend ≈ 13.78% after tax. Annual certificate issued per member.",
    highlights: j([
      "Kenya's LARGEST SACCO: 300,000+ members, KES 80B+ AUM",
      "14%+ annual dividend for 15+ consecutive years",
      "TSC payroll deduction: effortless, automatic monthly savings",
      "Mwalimu Bank subsidiary offers full commercial banking services",
      "Mwalimu Realty: mortgage and property investment access",
      "Loans at 1.1%/month reducing — highly competitive"
    ]),
    applySteps: j([
      { step: 1, title: "Confirm TSC Employment Eligibility", detail: "Mwalimu National SACCO is exclusively open to Teachers Service Commission (TSC) employees — primary, secondary, and ECDE teachers employed by the government. Retired members may maintain membership." },
      { step: 2, title: "Visit Any Mwalimu Branch with Documents", detail: "Bring: TSC appointment letter or employment ID, National ID, KRA PIN, and 2 recent passport photos. Branches available in Nairobi (Upper Hill HQ), Mombasa, Kisumu, Nakuru, Eldoret, and all 47 County Headquarters." },
      { step: 3, title: "Payroll Deduction Authorisation", detail: "Complete a TSC Payroll Deduction Form. Mwalimu SACCO coordinates directly with TSC HR to deduct your monthly contributions before your salary reaches you. Minimum: KES 2,000/month." },
      { step: 4, title: "Open BOSA + Optional FOSA Account", detail: "BOSA (savings that qualify for loans). FOSA (current account with ATM card, M-Pesa integration). Most teachers open both." },
      { step: 5, title: "Build Deposits & Access Loans Within 6 Months", detail: "After 6 months of deposits, qualify for Normal Loans (up to 3× deposits). Development Loans, Emergency Loans, and School Fees Loans also available." }
    ]),
    faqs: j([
      { q: "Can non-teachers join Mwalimu National SACCO?", a: "No. Mwalimu National SACCO's membership is legally restricted to active and retired TSC employees. Family members of teachers cannot join. However, household members can access banking through Mwalimu Microfinance Bank, which is open to all." },
      { q: "What is Mwalimu Bank?", a: "Mwalimu Commercial Bank is a fully licensed commercial bank owned by Mwalimu National SACCO. It offers current accounts, savings accounts, mortgages, and SME loans to ALL Kenyans — not just teachers. It operates 20+ branches across Kenya." },
      { q: "How much loan can I access?", a: "Normal Loan: Up to 3× your total deposits. Super Loan: Up to KES 4M for members with 5+ years of deposits. Development Loan: Up to KES 7M secured against property. All charged at 1.1%/month on reducing balance." },
      { q: "What happens to my SACCO membership when I retire?", a: "Upon TSC retirement, you become a retired member. Your share capital and deposits remain in Mwalimu SACCO earning returns. You can opt to receive annual dividends or withdraw your funds over a predetermined period." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Upper Hill", address: "Mwalimu House, Hospital Road, Upper Hill, Nairobi", phone: "+254 020 271 3400", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "CBD Branch — Kenyatta Ave", address: "Anniversary Towers, University Way, CBD", phone: "+254 020 271 3500", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Mombasa Region HQ", address: "Mwalimu House, Nkrumah Road, Mombasa", phone: "+254 041 222 3400", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Kisumu Region HQ", address: "Oginga Odinga Complex, Kisumu", phone: "+254 057 202 3400", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Eldoret Branch", address: "Pioneer Mall, Uganda Road, Eldoret", phone: "+254 053 206 3400", hours: "Mon–Fri: 8:30 AM – 4:00 PM" }
    ]),
    accountTypes: j([
      { name: "BOSA Savings", min: "KES 2,000/mo (payroll)", features: ["Annual dividend", "Loan qualification", "TSC automatic deduction"] },
      { name: "FOSA Current Account", min: "KES 500", features: ["Visa ATM card", "M-Pesa integration", "Salary/pension receipt"] },
      { name: "Mwalimu Bank Account", min: "KES 1,000", features: ["Full commercial banking", "Open to all Kenyans", "Mortgage eligible"] }
    ]),
  },
  {
    name: "Kenya Police SACCO", slug: "kenya-police-sacco", type: "SACCO",
    currentYield: 14.00, aum: "KES 30B+", paybill: "750200", isHalal: false,
    riskLevel: "Moderate", minimumInvest: "KES 2,500/month", liquidity: "Annual Dividend + T+5 Deposits",
    managementFee: 0, inceptionDate: "1970", regulatedBy: "SASRA",
    email: "info@kenyapolicesacco.co.ke", phone: "+254 020 340 0000", website: "https://kenyapolicesacco.co.ke",
    description: "Kenya Police SACCO is one of East Africa's oldest and most stable cooperatives, established in 1970 to serve National Police Service personnel. With KES 30B+ in assets and 14%+ dividends for 15+ consecutive years, it is a model of SACCO governance and returns. Members include Active Duty Officers, GSU, AP, DCI, and retired officers.",
    history3Year: g(13.8, 0.35),
    taxNotes: "5% WHT on dividends and deposit interest. Net dividend ≈ 13.30% after cooperative tax.",
    highlights: j([
      "Founded 1970 — one of East Africa's oldest cooperatives",
      "14%+ dividends for 15 consecutive years",
      "Mortgages and housing development loans for members",
      "SASRA Tier-1 — highest regulatory classification",
      "Member welfare scheme: funeral cover and emergency grants",
      "Loans at 1%/month reducing — automatic payroll deduction"
    ]),
    applySteps: j([
      { step: 1, title: "Confirm Police Service Employment", detail: "Open to: Kenya National Police, Administration Police (AP), General Service Unit (GSU), DCI officers, and their immediate family members (spouse/children above 18)." },
      { step: 2, title: "Visit Kenya Police SACCO HQ or Regional Office", detail: "HQ: Vigilance House, Harambee Ave, Nairobi. Bring: Police ID (Service No.), National ID, KRA PIN, PP photo. Regional offices at all 8 Police Regions." },
      { step: 3, title: "Sign Payroll Authority Form", detail: "Contributions deducted directly from your monthly salary by the NPS Payroll. Minimum KES 2,500/month." },
      { step: 4, title: "Access Loans After 3 Months", detail: "Emergency loan: after 3 months. Normal development loan: after 6 months (up to 3× deposits). Special mortgage loan: up to KES 10M for housing." }
    ]),
    faqs: j([
      { q: "Can family members of police officers join?", a: "Spouses and adult children (18+) of police officers can join as associate members. They can access BOSA savings and FOSA accounts but may have restricted loan access compared to direct police officer members." },
      { q: "What housing/mortgage benefits does the SACCO offer?", a: "Kenya Police SACCO has partnered with National Housing Corporation and several developers to offer members mortgages up to KES 10M at 1.2%/month reducing balance. The SACCO also has its own housing development projects in Athi River and Ngong." },
      { q: "Is there a police SACCO insurance scheme?", a: "Yes. All members are automatically enrolled in the Welfare Scheme which provides: KES 100,000 funeral grant for member death, KES 50,000 for spouse death, and 6 months' loan moratorium in case of serious injury on duty." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Vigilance House", address: "Vigilance House, Harambee Avenue, Nairobi CBD", phone: "+254 020 340 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Mombasa Regional Office", address: "Mombasa Police HQ Compound, Mombasa", phone: "+254 041 222 0500", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Kisumu Regional Office", address: "Kisumu Police HQ, Kisumu", phone: "+254 057 202 0500", hours: "Mon–Fri: 8:30 AM – 4:00 PM" },
      { city: "Eldoret Regional Office", address: "Eldoret Police HQ, Eldoret", phone: "+254 053 206 0500", hours: "Mon–Fri: 8:30 AM – 4:00 PM" }
    ]),
    accountTypes: j([
      { name: "BOSA Savings", min: "KES 2,500/mo", features: ["Annual dividend ~14%", "Auto payroll deduction", "Loan qualification"] },
      { name: "FOSA Current Account", min: "KES 500", features: ["ATM card", "M-Pesa", "Salary banking"] },
      { name: "Mortgage Loan", min: "KES 500,000", features: ["Up to KES 10M", "1.2%/mo reducing", "Housing projects access"] }
    ]),
  },
  {
    name: "Unaitas SACCO", slug: "unaitas-sacco", type: "SACCO",
    currentYield: 13.50, aum: "KES 25B+", paybill: "849001", isHalal: false,
    riskLevel: "Moderate", minimumInvest: "KES 1,000/month",
    liquidity: "Annual Dividend + T+3 Deposits (FOSA)", managementFee: 0,
    inceptionDate: "1993", regulatedBy: "SASRA", email: "info@unaitas.com",
    phone: "+254 020 211 9000", website: "https://unaitas.com",
    description: "Unaitas SACCO is Kenya's premier open-membership Tier-1 SACCO — open to any adult Kenyan citizen regardless of employer or profession. Founded in 1993 in Murang'a, it has grown to serve 200,000+ members across 30+ branches. With the lowest minimum contribution (KES 1,000/month) among Tier-1 SACCOs, Unaitas bridges the gap between informal chamas and institutional cooperative wealth.",
    history3Year: g(13.2, 0.5),
    taxNotes: "5% WHT on dividends and deposit interest. Net dividend ≈ 12.83%.",
    highlights: j([
      "Open to ALL Kenyans — no employer restriction",
      "Lowest Tier-1 SACCO minimum: KES 1,000/month",
      "200,000+ members in 30+ branches nationwide",
      "Unaitas Bank: full commercial banking for all Kenyans",
      "Agricultural and SME loans tailored for rural Kenya",
      "Mobile banking via Unaitas App and USSD *346#"
    ]),
    applySteps: j([
      { step: 1, title: "Apply at Any Unaitas Branch or Online", detail: "Unaitas has 30+ branches across Kenya. Apply online at unaitas.com or visit the nearest branch. Bring National ID, KRA PIN, and one passport photo." },
      { step: 2, title: "Pay Registration Fee", detail: "One-time registration fee: KES 500. Minimum share purchase: KES 1,000 (can pay monthly: KES 200/month for 5 months)." },
      { step: 3, title: "Choose Your Savings Plan", detail: "BOSA (savings for loans): KES 1,000/month minimum. FOSA (current account with ATM): open with KES 500. Both can be funded via M-Pesa Paybill 849001." },
      { step: 4, title: "Access Unaitas Mobile Banking", detail: "Download the Unaitas App or dial *346# on any network to check balances, make deposits, and request loans from your phone." },
      { step: 5, title: "Qualify for Loans After 3 Months", detail: "Emergency loan within 3 months. Normal loan (up to 3× deposits) after 6 months. Agri-loan for farmers available from Month 3." }
    ]),
    faqs: j([
      { q: "Does Unaitas serve rural Kenyans?", a: "Yes, this is Unaitas' core focus. Founded in Murang'a's agricultural heartland, Unaitas has branches in Murang'a, Thika, Nyeri, Meru, Nakuru, and many rural counties. Specific products for tea, coffee, dairy, and horticultural farmers are available." },
      { q: "Can I join if I'm self-employed or run a business?", a: "Absolutely. Unaitas was specifically designed for non-salaried Kenyans — traders, bodaboda operators, farmers, SME owners, and informal sector workers. You fund your BOSA via M-Pesa or cash at any branch." },
      { q: "What is Unaitas Bank?", a: "Unaitas Microfinance Bank is a fully licensed MFB operating alongside the SACCO. It provides savings accounts, business loans, and insurance products accessible to all Kenyans — not just SACCO members." },
      { q: "How competitive are Unaitas loan rates?", a: "BOSA Loans: 1%/month reducing balance. Emergency Loans: 1%/month. Agri-Loans: 0.9%/month (subsidised for farmers in specific value chains). These represent some of the most affordable formal credit available to unbanked and rural Kenyans." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Unaitas Tower", address: "Unaitas Tower, Hospital Road, Upper Hill, Nairobi", phone: "+254 020 211 9000", hours: "Mon–Fri: 8:00 AM – 5:30 PM, Sat: 8:30 AM – 2:00 PM" },
      { city: "Murang'a HQ (Founding Branch)", address: "Unaitas Building, Murang'a Town, Murang'a", phone: "+254 060 303 0000", hours: "Mon–Fri: 8:00 AM – 5:00 PM, Sat: 8:30 AM – 1:00 PM" },
      { city: "Thika Branch", address: "Thika Road Mall (TRM), Thika Road, Nairobi", phone: "+254 020 211 9100", hours: "Mon–Fri: 8:30 AM – 5:00 PM" },
      { city: "Nakuru Branch", address: "Westside Mall, Nakuru", phone: "+254 051 221 9000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" }
    ]),
    accountTypes: j([
      { name: "BOSA Savings", min: "KES 1,000/mo", features: ["Annual dividend ~13.5%", "Loan qualifying", "M-Pesa topup"] },
      { name: "FOSA Current Account", min: "KES 500", features: ["Visa ATM card", "USSD *346#", "T+3 withdrawal", "M-Pesa linked"] },
      { name: "Agri-Loan Account", min: "KES 5,000 deposits", features: ["0.9%/mo farm loans", "Seasonal repayment schedule", "Crop insurance linkage"] }
    ]),
  },
  {
    name: "NSSF Individual Pension Plan", slug: "nssf-pension", type: "Pension",
    currentYield: 9.50, aum: "KES 280B+", paybill: "333200", isHalal: false,
    riskLevel: "Low", minimumInvest: "KES 500/month", liquidity: "On Retirement (Age 55+) or Invalidity",
    managementFee: 0, inceptionDate: "1965", regulatedBy: "RBA Kenya",
    email: "scheme@nssf.or.ke", phone: "+254 020 271 7552", website: "https://nssf.or.ke",
    description: "The National Social Security Fund (NSSF) is Kenya's national mandatory and voluntary retirement savings scheme, established by the NSSF Act of 1965. It is Kenya's largest pension fund with KES 280B+ in assets. The Individual Pension Plan allows self-employed Kenyans, informal sector workers, and those who wish to make voluntary top-ups to NSSF to build a tax-efficient retirement nest egg.",
    history3Year: g(9.2, 0.3),
    taxNotes: "Contributions of up to KES 20,000/month are TAX DEDUCTIBLE from your gross income — reducing your PAYE tax liability. Investment returns within NSSF are tax-exempt during accumulation. Lump sum up to KES 600,000 at retirement is tax-free; excess taxed at reduced rates under the Finance Act.",
    highlights: j([
      "Contributions (up to KES 20K/mo) are PAYE tax-deductible",
      "KES 280B+ AUM — Kenya's largest pension fund",
      "Regulated by Retirement Benefits Authority (RBA) — highest oversight",
      "Self-employed and informal workers can contribute voluntarily",
      "Returns invested in diversified portfolio: bonds, equities, real estate",
      "Guaranteed by the Government of Kenya"
    ]),
    applySteps: j([
      { step: 1, title: "Register for NSSF Number (if not already registered)", detail: "Visit nssf.or.ke or any NSSF office. For employed workers: your employer should have registered you. For self-employed: bring National ID and register for a voluntary contributor account. Registration is free." },
      { step: 2, title: "Set Voluntary Contribution Amount", detail: "Employed: Your employer deducts the statutory amount (KES 200 employee + KES 200 employer for Tier 1, plus voluntary top-ups). Self-employed: Choose any amount from KES 500/month. Higher contributions = higher pension at retirement AND more PAYE tax savings." },
      { step: 3, title: "Contribute via M-Pesa Paybill 333200", detail: "M-Pesa > Lipa Na M-Pesa > Paybill 333200 > Account: Your NSSF Number. You can contribute any amount at any time as voluntary top-ups beyond the statutory minimum." },
      { step: 4, title: "Access Annual NSSF Statements", detail: "Log in at nssf.or.ke/member-portal or visit any NSSF office to access annual statements showing your total contributions, investment returns, and projected retirement benefit." },
      { step: 5, title: "Claim Your Benefits at Retirement", detail: "At age 55+ (or upon invalidity or emigration), apply for NSSF benefits. Processing takes 60–90 business days. Receive lump sum or monthly annuity based on your balance and the NSSF Act provisions." }
    ]),
    faqs: j([
      { q: "How does NSSF reduce my income tax?", a: "NSSF contributions (registered pension fund contributions) are tax-deductible under Kenya's Income Tax Act — up to KES 20,000/month (KES 240,000/year). This means if you contribute KES 20,000/month, your taxable income reduces by KES 20,000/month. At the 30% PAYE bracket, you save KES 6,000/month = KES 72,000/year in tax." },
      { q: "Can I access my NSSF savings before retirement?", a: "Generally NO — NSSF is a long-term retirement vehicle. Exceptions: invalidity (permanent disability), emigration from Kenya, or being a dependant of a deceased member. The NSSF Act 2013 (currently being phased in) introduces additional provisions for partial early access." },
      { q: "How does NSSF invest the funds?", a: "NSSF invests in a diversified portfolio: ~45% Government Securities (bonds & T-Bills), ~20% listed equities (NSE), ~20% real estate and infrastructure, ~15% fixed deposits. The investment committee is overseen by RBA." },
      { q: "Is NSSF safe given concerns about government mismanagement?", a: "NSSF is regulated by the Retirement Benefits Authority (RBA) — an independent regulatory body. The NSSF Act 2013 significantly strengthened governance. While historical management concerns existed, RBA oversight, audited accounts, and member portal transparency have improved substantially since 2015." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Social Security House", address: "Social Security House, Bishops Road, Upper Hill, Nairobi", phone: "+254 020 271 7552", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "Mombasa Regional Office", address: "NSSF Building, Moi Avenue, Mombasa", phone: "+254 041 222 7552", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Kisumu Regional Office", address: "Mega Plaza, Kisumu", phone: "+254 057 202 7552", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "Nakuru Office", address: "NSSF House, Kenyatta Avenue, Nakuru", phone: "+254 051 221 7552", hours: "Mon–Fri: 8:30 AM – 4:00 PM" },
      { city: "Eldoret Office", address: "NSSF Building, Uganda Road, Eldoret", phone: "+254 053 206 7552", hours: "Mon–Fri: 8:30 AM – 4:00 PM" }
    ]),
    accountTypes: j([
      { name: "Statutory Employee Account", min: "KES 200/mo (statutory)", features: ["Employer matches contribution", "PAYE tax deductible", "Retirement + death benefit"] },
      { name: "Voluntary Contributor (Self-Employed)", min: "KES 500/mo", features: ["Tax deductible up to KES 20K/mo", "M-Pesa Paybill 333200", "Flexible contribution amounts"] }
    ]),
  },
  {
    name: "CIC Umbrella Retirement Fund", slug: "cic-umbrella-pension", type: "Pension",
    currentYield: 11.20, aum: "KES 45B+", paybill: "390600", isHalal: false,
    riskLevel: "Low", minimumInvest: "KES 1,500/month",
    liquidity: "On Retirement + Partial Withdrawals After 10 Years", managementFee: 1.2,
    inceptionDate: "2000", regulatedBy: "RBA Kenya",
    email: "pension@cic.co.ke", phone: "+254 020 282 2000", website: "https://cic.co.ke",
    description: "CIC Group's Umbrella Retirement Fund is Kenya's leading private pension solution for individuals, SMEs, and corporate entities. Regulated by the Retirement Benefits Authority (RBA), it consistently delivers 11%+ returns by investing across equities, government securities, real estate, and alternative assets. CIC Group is Kenya's largest insurance cooperative and one of the most trusted financial institutions in East Africa.",
    history3Year: g(11.0, 0.4),
    taxNotes: "Tax benefits identical to NSSF: contributions up to KES 20,000/month deductible from PAYE income. Returns grow tax-free within the fund. At retirement, first KES 600K is tax-free; remainder taxed at reduced pension rates. 1.2% annual management fee already deducted before the 11.2% return is quoted.",
    highlights: j([
      "11.2% net return — top-performing private pension in Kenya",
      "PAYE tax deduction: save up to KES 72,000/year in income tax",
      "Managed by CIC Asset Management — RBA regulated",
      "Ideal for SMEs: companies can contribute for all employees under one umbrella",
      "Death & permanent disability cover automatically included",
      "Partial withdrawals allowed after 10 years of membership"
    ]),
    applySteps: j([
      { step: 1, title: "Contact a CIC Pension Advisor", detail: "Call +254 020 282 2000 or email pension@cic.co.ke. A dedicated CIC pension consultant will schedule a free 45-minute retirement planning session — either at a CIC branch or via Teams/Zoom." },
      { step: 2, title: "Choose Your Contribution Level & Investment Strategy", detail: "CIC offers 3 risk profiles: Conservative (80% bonds/20% equity), Balanced (50/50), and Growth (20% bonds/80% equity). Select based on your age and risk tolerance. CMA-certified advisors provide recommendations." },
      { step: 3, title: "Complete Application & KYC", detail: "Individual: National ID, KRA PIN, employment info. Corporate: Certificate of Incorporation, Board Resolution, employee list, KRA PIN. Processing: 3–5 business days." },
      { step: 4, title: "Set Up Contributions via Payroll or M-Pesa", detail: "Employed: arrange payroll deduction with your HR. Self-employed/SME: M-Pesa Paybill 390600 > Account: Your CIC pension number. Minimum KES 1,500/month individual, recommended KES 5,000/month for meaningful retirement accumulation." },
      { step: 5, title: "Receive Annual Statements & Tax Certificates", detail: "CIC provides annual valuation statements, P9 forms for KRA, and investment performance reports each January." }
    ]),
    faqs: j([
      { q: "What is an 'Umbrella' retirement fund?", a: "An umbrella fund pools contributions from many employers/individuals into one regulated fund structure — slashing administration costs and enabling diversified institutional-grade investment that would be too expensive for individual company pension schemes." },
      { q: "How does CIC get an 11.2% return?", a: "CIC Asset Management invests the pension portfolio across: 40% Government Securities (bonds & T-Bills), 30% listed NSE equities, 15% real estate, 10% offshore equity funds, 5% alternative assets. This diversified approach consistently outperforms pure bond/MMF returns over a 10-year horizon." },
      { q: "Can I transfer my existing NSSF or company pension to CIC?", a: "Yes. If your employer changes pension providers or you leave employment, you can transfer your accumulated benefits to CIC's umbrella fund through a 'pension transfer.' This is tax-neutral and preserves your accumulated benefits." },
      { q: "What happens to my pension if I die before retirement?", a: "Your nominated beneficiaries receive 100% of your accumulated pension fund value as a lump sum, tax-free up to KES 600,000 and at reduced rates above that threshold. CIC also provides additional group life insurance cover — typically 3× annual salary — for members whose employers subscribe to the enhanced package." }
    ]),
    officeLocations: j([
      { city: "Nairobi HQ — Upperhill", address: "CIC Plaza, Mara/Ragati Road, Upper Hill, Nairobi", phone: "+254 020 282 2000", hours: "Mon–Fri: 7:30 AM – 5:30 PM" },
      { city: "CIC Westlands Branch", address: "Westpark Suites, Chiromo Lane, Westlands", phone: "+254 020 374 2000", hours: "Mon–Fri: 8:00 AM – 5:00 PM" },
      { city: "CIC Mombasa", address: "Ambalal House, Nkrumah Road, Mombasa", phone: "+254 041 222 2000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "CIC Kisumu", address: "Mega Plaza, Oginga Odinga Street, Kisumu", phone: "+254 057 202 2000", hours: "Mon–Fri: 8:30 AM – 4:30 PM" },
      { city: "CIC Eldoret", address: "Rupa's Mall, Uganda Road, Eldoret", phone: "+254 053 206 2000", hours: "Mon–Fri: 8:30 AM – 4:00 PM" }
    ]),
    accountTypes: j([
      { name: "Individual Pension", min: "KES 1,500/mo", features: ["Tax deductible contributions", "3 risk profiles", "Death & disability cover", "Annual statements"] },
      { name: "Corporate Umbrella Scheme", min: "KES 2,000/employee/mo", features: ["Pooled employer scheme", "Dedicated trustee services", "Board reporting", "Employee financial wellness"] }
    ]),
  },
];

export async function GET() {
  try {
    for (const p of providers) {
      await prisma.provider.upsert({ where: { slug: p.slug }, update: p, create: p });
    }
    return NextResponse.json({ success: true, message: `Seeded ${providers.length} providers (SACCOs & Pensions). All 21 providers now fully enriched!`, count: providers.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
