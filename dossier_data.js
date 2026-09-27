/**
 * PackCheck — Centralized 8-Point Hackathon MVP Inspection Dossier
 * 8 Prioritized Statutory Sections:
 * 1. Product Information
 * 2. Inspection Summary
 * 3. Detected Declarations
 * 4. Legal Metrology Checks
 * 5. FSSAI Checks
 * 6. Issues & Alerts
 * 7. Evidence + Rule Reference
 * 8. Inspector Verification + Report
 */

const DOSSIER_DATA = {
  // ==========================================================================
  // PRODUCT 1: VOLT SURGE ENERGY DRINK 250ML
  // ==========================================================================
  "consumer-1": {
    productInfo: {
      consumer: [
        { label: "Product Name", value: "Volt Surge Energy Drink" },
        { label: "Category", value: "Carbonated Energy Beverage" },
        { label: "Net Quantity", value: "250 ml (Single Serve Slim Can)" },
        { label: "MRP & Unit Price", value: "₹110.00 (₹44.00 per 100ml)" },
        { label: "Batch & Expiry", value: "Batch #VS-2026-09A · Best Before 12 Months" },
        { label: "Packer / Brand", value: "Volt Beverages Ltd, Sec-62 Noida UP - 201301" }
      ],
      industry: [
        { label: "SKU / EAN-13", value: "SKU-ENG-250-001 / 8901234567890" },
        { label: "Registered Trade Name", value: "Volt Surge Energy Drink 250ml Slim Can" },
        { label: "Packaging Substrate", value: "250ml Tinplate Lacquered Aluminum Slim Can" },
        { label: "Net Content / Tolerance", value: "Declared: 250ml | Measured: 251.2ml (MTD: ±3%) [PASS]" },
        { label: "MRP & Unit Sale Price", value: "MRP ₹110.00 (incl. all taxes) | USP ₹0.44/ml per Rule 6(1)(f)" },
        { label: "Mfg / Lot & Expiry", value: "Lot: VS-2026-09A | Mfg: 15-Aug-2026 | Exp: 14-Aug-2027" },
        { label: "Premises & Geo-Location", value: "Volt Beverages Ltd, Plot 42, Sec-62 Noida UP (FOSCOS ID: 10019022008421)" }
      ]
    },

    inspectionSummary: {
      consumer: {
        score: 38,
        grade: "Grade D (Caution)",
        verdictText: "Caution: Contains 27.4g added sugar (108% daily WHO limit) and high caffeine. Best kept as an occasional treat.",
        stats: [
          { label: "CleanScore", value: "38 / 100", status: "harm" },
          { label: "Harmful Substances", value: "2 Exceed Limits", status: "harm" },
          { label: "Safe Ingredients", value: "5 Standard Food Grade", status: "safe" },
          { label: "Good Nutrients", value: "4 B-Vitamins & Taurine", status: "good" }
        ],
        auditBadge: "FLAGGED BY INSPECTION CELL",
        badgeClass: "status-harm"
      },
      industry: {
        score: 38,
        classification: "NON-COMPLIANT",
        auditLevel: "L3 Regulatory Forensic Audit",
        coaNumber: "COA-2026-ND-9921",
        auditAuthority: "National Food Audit Cell (NFAC) / Delhi-NCR",
        sampleDate: "01-Sep-2026",
        riskIndex: "HIGH RISK (Excessive Free Sugars + Typography Deficit)",
        keyFindings: [
          "Free sucrose exceeds WHO Recommended Free Sugar ceiling by +8% (27.4g vs 25g).",
          "HPLC analysis confirms 78mg anhydrous caffeine (312 mg/L).",
          "FSSR Clause 2.4.4 caffeine cautionary statement font is sub-standard (1.8mm vs 2.0mm minimum)."
        ]
      }
    },

    detectedDeclarations: {
      consumer: [
        { claim: "Front Label Claim", text: "⚡ 'Instant Natural Focus & Vitalizing Energy'" },
        { claim: "Laboratory Reality", text: "⚠️ Contains 27.4g refined cane sugar + 78mg synthetic anhydrous caffeine" },
        { claim: "Hidden Sweetener", text: "Liquid glucose syrup (3.5g) added for syrupy mouthfeel and faster glycemic spike" },
        { claim: "Daily Budget Impact", text: "1 Can delivers 108% of your entire daily recommended free sugar" }
      ],
      industry: [
        { ingredient: "Added Sucrose (Sugar)", declared: "27.0 g / can", detected: "27.4 g / can", variance: "+1.5%", status: "over", ref: "WHO Limit 25g/day (108%)" },
        { ingredient: "Liquid Glucose Syrup", declared: "3.2 g / can", detected: "3.5 g / can", variance: "+9.4%", status: "warn", ref: "Combined Simple Sugars" },
        { ingredient: "Anhydrous Caffeine", declared: "75 mg", detected: "78 mg", variance: "+4.0%", status: "ok", ref: "FSSAI Cap 400 mg/day" },
        { ingredient: "Taurine", declared: "500 mg", detected: "488 mg", variance: "-2.4%", status: "ok", ref: "Permissible Ceiling 3000mg" },
        { ingredient: "Niacinamide (Vit B3)", declared: "10.0 mg", detected: "9.8 mg", variance: "-2.0%", status: "ok", ref: "ICMR RDA 14mg (70%)" },
        { ingredient: "Sodium Citrate", declared: "42 mg", detected: "40 mg", variance: "-4.7%", status: "ok", ref: "ICMR Sodium Guideline 2000mg" }
      ]
    },

    legalMetrology: {
      consumer: [
        { check: "Font Size & Legibility", status: "pass", detail: "Letters and numerals are printed at 3.20 mm height (compliant and easy to read)." },
        { check: "MRP & All Taxes", status: "pass", detail: "MRP ₹110.00 is printed with 'inclusive of all taxes' statement." },
        { check: "Unit Sale Price", status: "pass", detail: "Price per ml (₹0.44/ml) clearly shown adjacent to MRP." },
        { check: "Consumer Care Details", status: "pass", detail: "Toll-free customer care number (1800-200-9922) and grievance email clearly listed." }
      ],
      industry: [
        { rule: "Rule 6(1)(e)", requirement: "Numeral & letter height for 200–500ml net volume", standard: "≥ 3.00 mm", measured: "3.20 mm", status: "PASS", citation: "PCR 2011 Sched II Table 1" },
        { rule: "Rule 6(1)(d)", requirement: "Retail sale price format", standard: "'MRP ₹xx.xx (incl. of all taxes)'", measured: "'MRP ₹110.00 INCL. OF ALL TAXES'", status: "PASS", citation: "PCR 2011 Rule 6(1)(d) Notification 2022" },
        { rule: "Rule 6(1)(f)", requirement: "Unit Sale Price (USP) declaration", standard: "Mandatory per ml/g adjacent to MRP", measured: "USP ₹0.44 / ml prominently displayed", status: "PASS", citation: "PCR 2011 Notification G.S.R. 779(E)" },
        { rule: "Rule 6(1)(c)", requirement: "Net quantity & Tolerable Deficiency (MTD)", standard: "250 ml ± 3% (242.5ml – 257.5ml)", measured: "251.2 ml (Within legal MTD bounds)", status: "PASS", citation: "PCR 2011 Second Schedule (Tolerances)" },
        { rule: "Rule 6(1)(a)", requirement: "Name & address of manufacturer and helpline", standard: "Full physical address, phone & email", measured: "Volt Beverages Ltd, Sec-62 Noida + 1800-200-9922", status: "PASS", citation: "PCR 2011 Rule 6(1)(a)" }
      ]
    },

    fssaiChecks: {
      consumer: [
        { check: "14-Digit FSSAI License", status: "pass", detail: "License #10019022008421 is active and registered on central food portal." },
        { check: "Green Veg Food Dot", status: "pass", detail: "Vegetarian food emblem correctly displayed on front." },
        { check: "Caffeine Advisory Notice", status: "warn", detail: "Warning present but printed slightly smaller than required by food rules." },
        { check: "Food Additive Class Codes", status: "pass", detail: "Acidity regulators declared with INS codes (INS 330, INS 331)." }
      ],
      industry: [
        { section: "FSS Act Sec 31", check: "Central FoSCoS License Validation", requirement: "14-digit active registration", result: "Lic #10019022008421 · Category 14.1.4 (Carbonated Beverage) · Valid thru Dec 2027", status: "PASS" },
        { section: "FSSR Clause 2.2.2", check: "Vegetarian Logo Geometry", requirement: "Square box min 3.0mm, green circle min 1.5mm diameter", result: "Measured: 3.1mm box, 1.6mm circle · Hex #2B8A3E verified", status: "PASS" },
        { section: "FSSR Clause 2.4.4", check: "Caffeinated Beverage Advisory Statement", requirement: "'Not recommended for children, pregnant or lactating women' in min 2.0mm font", result: "Measured font height: 1.8mm (-0.2mm non-conformance flag)", status: "FLAG" },
        { section: "FSSR Clause 2.4.4(2)", check: "Caffeine Ceiling Limit", requirement: "Max 300 mg/L (75mg / 250ml)", result: "HPLC detected: 312 mg/L (78mg / 250ml) — Borderline excursion (+4%)", status: "WARN" },
        { section: "FSSR Schedule I", check: "Functional Class Identification", requirement: "Specific INS class name prefix (Acidity Regulator INS 330)", result: "Correctly classified under Acidity Regulators and Buffering Agents", status: "PASS" }
      ]
    },

    issuesAndAlerts: {
      consumer: [
        { type: "critical", title: "Sugar Overload (108% WHO Daily Limit)", text: "A single 250ml can has 27.4g added sugar, exceeding an adult's entire recommended daily sugar budget." },
        { type: "warning", title: "High Caffeine Notice", text: "78mg caffeine equals a strong shot of espresso. Not recommended before bed, or for children/pregnant individuals." },
        { type: "safe", title: "No Harmful Synthetic Dyes", text: "Free from artificial coal-tar dyes like Tartrazine or Allura Red." }
      ],
      industry: [
        { severity: "CRITICAL", code: "NC-SUG-01", title: "Exceeds WHO Free Sugar Benchmark", detail: "27.4g added sucrose represents 108% of daily 25g threshold; causes rapid glycemic excursion and increases cardiovascular risk.", action: "Mandatory Front-of-Pack Warning Tag" },
        { severity: "NON-CONFORMANCE", code: "NC-LBL-02", title: "FSSR Clause 2.4.4 Typography Deficit", detail: "Caffeinated beverage warning font measured at 1.8mm against statutory 2.0mm floor.", action: "Rectify printing plate in next packaging run" },
        { severity: "OBSERVATION", code: "OB-CAF-03", title: "Caffeine Analytical Upper Bound", detail: "Detected caffeine 312 mg/L slightly exceeds nominal 300 mg/L declared threshold (+4%).", action: "Calibrate liquid metering pump at batch filling" }
      ]
    },

    evidenceAndRules: {
      consumer: [
        { authority: "World Health Organization (WHO)", rule: "Guideline on Sugars Intake (2024)", text: "Recommends limiting free sugars to less than 10% (ideally 5% / 25g) of total daily energy intake." },
        { authority: "ICMR - National Institute of Nutrition (NIN)", rule: "Dietary Guidelines for Indians (2024)", text: "Warns against high consumption of ultra-processed carbonated energy drinks with liquid sugars." },
        { authority: "Ministry of Consumer Affairs", rule: "Legal Metrology Rules, 2011", text: "Requires all packaged commodities to declare readable pricing, weight, and manufacturer details." }
      ],
      industry: [
        { authority: "WHO / JECFA", clause: "WHO Free Sugars Technical Guideline 2024", text: "Strong recommendation to reduce free sugar intake <25g/day. Energy drinks identified as primary vector of excessive intake.", link: "WHO-NHD-15.2" },
        { authority: "FSSAI Statutory Clause", clause: "FSS (Packaging and Labelling) Regulations 2020, Sec 2.4.4", text: "Mandates specific font size, bold lettering, and prominent placement of caffeine warning on caffeinated beverages.", link: "FSSAI-FSSR-2020" },
        { authority: "Legal Metrology Act, 2009", clause: "Section 18 read with PCR 2011 Rule 6 & Sched II", text: "Statutory penal liability for non-conforming numeral heights and improper Unit Sale Price formulations.", link: "LMA-2009-SEC18" },
        { authority: "Forensic Cryptographic Hash", clause: "SHA-256 Audit Fingerprint", text: "7f8a91c2b5d4e3f10928a64c51920384756192847501928374659182736409e1", link: "VERIFIED" }
      ]
    },

    inspectorVerification: {
      consumer: {
        inspectorId: "INSP-DEL-8492",
        authority: "National Food Safety Inspection Unit",
        date: "01-Sep-2026",
        status: "FLAGGED",
        notes: "Product flagged for high added sugar (108% daily limit) and undersized cautionary warning font.",
        reportId: "REP-PC-2026-08492",
        certifiedSeal: "OFFICIALLY AUDITED · PACKCHECK VERIFIED"
      },
      industry: {
        inspectorId: "INSP-DEL-8492",
        jurisdiction: "Delhi-NCR Central Enforcement Division",
        verificationStatus: "FLAGGED",
        verdictAction: "FLAG",
        enforcementOrder: "Notice under FSS Act Section 32 issued: 30 days to rectify caffeine advisory typography.",
        timestamp: "2026-09-01T14:32:00+05:30",
        inspectorNotes: "Sample batch VS-2026-09A audited. Sugar levels exceed WHO ceilings. Advisory font height requires 0.2mm increase. Improvement notice dispatched to Noida facility.",
        reportNumber: "PACKCHECK-REP-2026-08492",
        digitalSignature: "R. Sharma, Senior Quality Assurance Inspector (Cryptographically Signed)"
      }
    }
  },

  // ==========================================================================
  // PRODUCT 2: SPARK ZERO COLA 330ML
  // ==========================================================================
  "consumer-2": {
    productInfo: {
      consumer: [
        { label: "Product Name", value: "Spark Zero Cola" },
        { label: "Category", value: "Zero Sugar Carbonated Beverage" },
        { label: "Net Quantity", value: "330 ml (Single Serve Can)" },
        { label: "MRP & Unit Price", value: "₹40.00 (₹12.12 per 100ml)" },
        { label: "Batch & Expiry", value: "Batch #SZ-2026-08B · Best Before 6 Months" },
        { label: "Packer / Brand", value: "Spark Global Bottling Co., Andheri East, Mumbai MH" }
      ],
      industry: [
        { label: "SKU / EAN-13", value: "SKU-COL-330-002 / 8901234567891" },
        { label: "Registered Trade Name", value: "Spark Zero Cola 330ml Aluminum Can" },
        { label: "Packaging Substrate", value: "330ml Aluminum Can with Food-Grade Epoxy Liner" },
        { label: "Net Content / Tolerance", value: "Declared: 330ml | Measured: 330.8ml (MTD: ±3%) [PASS]" },
        { label: "MRP & Unit Sale Price", value: "MRP ₹40.00 (incl. all taxes) | USP ₹0.12/ml per Rule 6(1)(f)" },
        { label: "Mfg / Lot & Expiry", value: "Lot: SZ-2026-08B | Mfg: 10-Aug-2026 | Exp: 09-Feb-2027" },
        { label: "Premises & Geo-Location", value: "Spark Global Bottling Co., MIDC Andheri MH (FOSCOS ID: 10014011000244)" }
      ]
    },

    inspectionSummary: {
      consumer: {
        score: 78,
        grade: "Grade B (Safe Formulation)",
        verdictText: "Compliant zero-calorie beverage. Sweetened with approved non-nutritive sweeteners well below toxicological safety limits.",
        stats: [
          { label: "CleanScore", value: "78 / 100", status: "good" },
          { label: "Harmful Substances", value: "0 Detected", status: "good" },
          { label: "Safe Ingredients", value: "5 Compliant Additives", status: "safe" },
          { label: "Good Nutrients", value: "1 Pure Water Base", status: "safe" }
        ],
        auditBadge: "PASSED STATUTORY AUDIT",
        badgeClass: "status-safe"
      },
      industry: {
        score: 78,
        classification: "COMPLIANT",
        auditLevel: "L3 Regulatory Forensic Audit",
        coaNumber: "COA-2026-MUM-4410",
        auditAuthority: "Western Regional Food Safety Authority / Mumbai",
        sampleDate: "10-Sep-2026",
        riskIndex: "LOW RISK (Compliant with JECFA & FSSAI Sweetener Limits)",
        keyFindings: [
          "Zero detected simple saccharides (0.0g Sucrose, 0.0g Fructose).",
          "Sucralose detected at 31mg (JECFA ADI utilization <5%).",
          "Phosphoric acid measured at 148mg, within EFSA dental erosion safety ceilings."
        ]
      }
    },

    detectedDeclarations: {
      consumer: [
        { claim: "Front Label Claim", text: "✨ 'Zero Sugar · Zero Calories · Guilt-Free Refreshment'" },
        { claim: "Laboratory Reality", text: "✅ Lab test confirms 0.0g free sugars. Uses Sucralose & Acesulfame-K." },
        { claim: "Artificial Sweetener", text: "Sucralose (31mg) & Acesulfame-K (15mg) declared clearly and within safety limits." },
        { claim: "Dental Consideration", text: "Contains Phosphoric Acid (INS 338); rinse with water after drinking." }
      ],
      industry: [
        { ingredient: "Sucralose (INS 955)", declared: "32 mg", detected: "31 mg", variance: "-3.1%", status: "ok", ref: "JECFA ADI 15 mg/kg bw/day (5% ADI)" },
        { ingredient: "Acesulfame K (INS 950)", declared: "16 mg", detected: "15 mg", variance: "-6.2%", status: "ok", ref: "JECFA ADI 9 mg/kg bw/day (3% ADI)" },
        { ingredient: "Phosphoric Acid", declared: "150 mg", detected: "148 mg", variance: "-1.3%", status: "ok", ref: "EFSA Phosphate Ceiling (22%)" },
        { ingredient: "Caramel IV (INS 150d)", declared: "40 mg", detected: "39 mg", variance: "-2.5%", status: "ok", ref: "FSSAI Color Limit (14%)" },
        { ingredient: "Caffeine", declared: "32 mg", detected: "33 mg", variance: "+3.1%", status: "ok", ref: "FSSAI Max 400 mg/day (8%)" }
      ]
    },

    legalMetrology: {
      consumer: [
        { check: "Font Size & Legibility", status: "pass", detail: "Letters and numerals are printed at 3.50 mm height (compliant and clearly legible)." },
        { check: "MRP & Tax Statement", status: "pass", detail: "MRP ₹40.00 is printed with 'inclusive of all taxes'." },
        { check: "Unit Sale Price", status: "pass", detail: "Price per ml (₹0.12/ml) displayed clearly next to MRP." },
        { check: "Consumer Care Support", status: "pass", detail: "Full contact details, WhatsApp helpdesk, and email provided." }
      ],
      industry: [
        { rule: "Rule 6(1)(e)", requirement: "Numeral & letter height for 200–500ml net volume", standard: "≥ 3.00 mm", measured: "3.50 mm", status: "PASS", citation: "PCR 2011 Schedule II Table 1" },
        { rule: "Rule 6(1)(d)", requirement: "Retail sale price format", standard: "'MRP ₹xx.xx (incl. of all taxes)'", measured: "'MRP ₹40.00 INCL. OF ALL TAXES'", status: "PASS", citation: "PCR 2011 Rule 6(1)(d)" },
        { rule: "Rule 6(1)(f)", requirement: "Unit Sale Price (USP) declaration", standard: "Mandatory per ml/g adjacent to MRP", measured: "USP ₹0.12 / ml clearly displayed", status: "PASS", citation: "PCR 2011 Notification G.S.R. 779(E)" },
        { rule: "Rule 6(1)(c)", requirement: "Net quantity & Tolerable Deficiency (MTD)", standard: "330 ml ± 3% (320.1ml – 339.9ml)", measured: "330.8 ml (Within legal MTD bounds)", status: "PASS", citation: "PCR 2011 Second Schedule (Tolerances)" },
        { rule: "Rule 6(1)(a)", requirement: "Manufacturer and packer details", standard: "Complete address with PIN and helpline", measured: "Spark Global Bottling Co., Andheri East Mumbai - 400069", status: "PASS", citation: "PCR 2011 Rule 6(1)(a)" }
      ]
    },

    fssaiChecks: {
      consumer: [
        { check: "14-Digit FSSAI License", status: "pass", detail: "License #10014011000244 verified active on FoSCoS portal." },
        { check: "Green Veg Food Dot", status: "pass", detail: "Standard vegetarian food symbol displayed on front." },
        { check: "Non-Caloric Sweetener Notice", status: "pass", detail: "Mandatory statement 'CONTAINS NON-CALORIC SWEETENERS' prominently printed." },
        { check: "Preservative Class Declaration", status: "pass", detail: "INS 211 (Sodium Benzoate) declared within permissible limits." }
      ],
      industry: [
        { section: "FSS Act Sec 31", check: "Central FoSCoS License Validation", requirement: "14-digit active registration", result: "Lic #10014011000244 · Category 14.1.4.1 · Valid thru Aug 2028", status: "PASS" },
        { section: "FSSR Clause 2.4.5", check: "Artificial Sweetener Mandatory Notice", requirement: "'CONTAINS ARTIFICIAL SWEETENER AND FOR CALORIE CONSCIOUS'", result: "Prominently printed in upper case bold font (3.2mm height)", status: "PASS" },
        { section: "FSSR Clause 2.2.2", check: "Vegetarian Logo Specification", requirement: "Square box min 3.0mm, green circle min 1.5mm diameter", result: "Measured: 3.2mm box, 1.6mm green dot · Verified", status: "PASS" },
        { section: "FSSR Regulation 3.1.2", check: "Permitted Sweetener Combination", requirement: "Sucralose + Acesulfame K combination compliance", result: "Both within individual and combined ADI ceilings", status: "PASS" },
        { section: "FSSR Schedule I", check: "Food Color Ceiling", requirement: "Caramel IV max 4000 mg/kg", result: "Measured: 120 mg/kg (Compliant)", status: "PASS" }
      ]
    },

    issuesAndAlerts: {
      consumer: [
        { type: "safe", title: "Zero Glycemic Spike", text: "Will not elevate blood sugar levels; suitable for low-carb and ketogenic diets." },
        { type: "warning", title: "Phosphoric Acid Notice", text: "Mild acidic beverage (pH ~3.2); habitual consumption may soften tooth enamel over time." },
        { type: "safe", title: "Aspartame-Free", text: "Does not contain Aspartame; safe for individuals with Phenylketonuria (PKU)." }
      ],
      industry: [
        { severity: "COMPLIANT", code: "CMP-SWT-01", title: "Sweetener Tolerances Met", detail: "Sucralose and Acesulfame-K levels conform strictly with JECFA ADI standards.", action: "Routine quarterly testing recommended" },
        { severity: "OBSERVATION", code: "OB-ACD-02", title: "Titratable Acidity Verification", detail: "pH measured at 3.18. Compatible with food-grade epoxy aluminum can lining.", action: "Maintain packaging liner integrity QC" }
      ]
    },

    evidenceAndRules: {
      consumer: [
        { authority: "World Health Organization (WHO) & JECFA", rule: "Non-Sugar Sweeteners Toxicological Safety", text: "Sucralose and Acesulfame-K are thoroughly assessed by JECFA and cleared as safe food additives." },
        { authority: "Food Safety and Standards Authority of India (FSSAI)", rule: "Regulation 3.1.2 on Intense Sweeteners", text: "Permits blending of sucralose and acesulfame potassium in carbonated beverages with appropriate labeling." },
        { authority: "Ministry of Consumer Affairs", rule: "Legal Metrology Packaged Commodities Rules 2011", text: "Standardized net volume and unit sale pricing requirements." }
      ],
      industry: [
        { authority: "JECFA Technical Report", clause: "Toxicological Evaluation of Certain Food Additives (TRS 956)", text: "Established Acceptable Daily Intake (ADI) of 0-15 mg/kg bw for sucralose. Zero genotoxicity or carcinogenicity.", link: "JECFA-TRS-956" },
        { authority: "FSSAI Food Additives Regulations", clause: "FSSR 2011 Appendix A Table 14", text: "Prescribes maximum usage levels for non-nutritive intense sweeteners in carbonated water.", link: "FSSAI-APP-A-14" },
        { authority: "Legal Metrology Act, 2009", clause: "Section 18 read with PCR 2011 Rule 6", text: "Statutory labeling format compliance certificate issued.", link: "LMA-2009" },
        { authority: "Forensic Cryptographic Hash", clause: "SHA-256 Audit Fingerprint", text: "4e912b7a8c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f", link: "VERIFIED" }
      ]
    },

    inspectorVerification: {
      consumer: {
        inspectorId: "INSP-MUM-3120",
        authority: "Western Division Food Safety Cell",
        date: "10-Sep-2026",
        status: "PASSED",
        notes: "Formulation and packaging comply with all legal metrology and FSSAI standards.",
        reportId: "REP-PC-2026-03120",
        certifiedSeal: "OFFICIALLY AUDITED · PACKCHECK VERIFIED"
      },
      industry: {
        inspectorId: "INSP-MUM-3120",
        jurisdiction: "Western Regional Enforcement Division / Mumbai",
        verificationStatus: "PASSED",
        verdictAction: "PASS",
        enforcementOrder: "Certificate of Compliance granted under FSS Act Section 31.",
        timestamp: "2026-09-10T11:15:00+05:30",
        inspectorNotes: "Sample batch SZ-2026-08B tested. All non-nutritive sweeteners within 5% of declaration. No corrective action required.",
        reportNumber: "PACKCHECK-REP-2026-03120",
        digitalSignature: "Anita K., Regional Food Safety Officer (Cryptographically Signed)"
      }
    }
  },

  // ==========================================================================
  // PRODUCT 3: NATURESIP MANGO NECTAR 200ML
  // ==========================================================================
  "consumer-3": {
    productInfo: {
      consumer: [
        { label: "Product Name", value: "NatureSip Mango Nectar" },
        { label: "Category", value: "Fruit Nectar Beverage" },
        { label: "Net Quantity", value: "200 ml (Aseptic Tetra Pak)" },
        { label: "MRP & Unit Price", value: "₹20.00 (₹10.00 per 100ml)" },
        { label: "Batch & Expiry", value: "Batch #NM-2026-09C · Best Before 6 Months" },
        { label: "Packer / Brand", value: "NatureSip Agro Foods Ltd, Whitefield, Bengaluru KA" }
      ],
      industry: [
        { label: "SKU / EAN-13", value: "SKU-JUC-200-003 / 8901234567892" },
        { label: "Registered Trade Name", value: "NatureSip Mango Nectar 200ml Tetra Brik Aseptic" },
        { label: "Packaging Substrate", value: "6-Layer Aseptic Composite Carton (Paper/PE/Foil)" },
        { label: "Net Content / Tolerance", value: "Declared: 200ml | Measured: 198.5ml (MTD: ±3%) [PASS]" },
        { label: "MRP & Unit Sale Price", value: "MRP ₹20.00 (incl. all taxes) | USP ₹0.10/ml per Rule 6(1)(f)" },
        { label: "Mfg / Lot & Expiry", value: "Lot: NM-2026-09C | Mfg: 01-Sep-2026 | Exp: 28-Feb-2027" },
        { label: "Premises & Geo-Location", value: "NatureSip Agro Foods Ltd, EPIP Whitefield KA (FOSCOS ID: 10017042003112)" }
      ]
    },

    inspectionSummary: {
      consumer: {
        score: 52,
        grade: "Grade C (Moderate Caution)",
        verdictText: "Caution: Marketed as natural fruit goodness but contains 31.2g added sugar (124% WHO limit) and chemical sulphite preservative.",
        stats: [
          { label: "CleanScore", value: "52 / 100", status: "warn" },
          { label: "Harmful Ingredients", value: "2 Detected", status: "harm" },
          { label: "Safe Ingredients", value: "2 Permitted Additives", status: "safe" },
          { label: "Good Nutrients", value: "2 Real Mango Pulp & Vit C", status: "good" }
        ],
        auditBadge: "FLAGGED: MISBRANDING NOTICE",
        badgeClass: "status-warn"
      },
      industry: {
        score: 52,
        classification: "CAUTION",
        auditLevel: "L3 Regulatory Forensic Audit",
        coaNumber: "COA-2026-BLR-1188",
        auditAuthority: "Karnataka State Food Safety Commission / Bengaluru",
        sampleDate: "12-Sep-2026",
        riskIndex: "MODERATE RISK (Pulp Deficit vs FSSR Standard + High Added Sugar)",
        keyFindings: [
          "Mango pulp content measured at 19.2% (falls below statutory minimum 20% for Fruit Nectar under FSSR 2.3.10).",
          "Added cane sugar detected at 31.2g (124% of WHO daily free sugar budget).",
          "Numeral print height is 2.80mm (0.20mm under Legal Metrology Schedule II standard of 3.00mm)."
        ]
      }
    },

    detectedDeclarations: {
      consumer: [
        { claim: "Front Label Claim", text: "🥭 '100% Real Alphonso Mango Goodness · Naturally Nourishing'" },
        { claim: "Laboratory Reality", text: "⚠️ Lab found only 19.2% mango pulp. The remaining 80% is sugar syrup and water." },
        { claim: "Sugar Reality", text: "Contains 31.2g added sugar — more sugar than 7 sugar cubes in 1 small pack!" },
        { claim: "Chemical Preservative", text: "Contains Potassium Metabisulphite (38 ppm) for artificial shelf life." }
      ],
      industry: [
        { ingredient: "Added Cane Sugar", declared: "30.0 g", detected: "31.2 g", variance: "+4.0%", status: "over", ref: "WHO Limit 25g/day (124%)" },
        { ingredient: "Alphonso Mango Pulp", declared: "20.0%", detected: "19.2%", variance: "-4.0%", status: "warn", ref: "FSSR Min 20% Nectar Floor" },
        { ingredient: "K-Metabisulphite (INS 224)", declared: "35 ppm", detected: "38 ppm", variance: "+8.5%", status: "warn", ref: "FSSAI Sulphite Limit 50 ppm (76%)" },
        { ingredient: "Ascorbic Acid (Vit C)", declared: "30.0 mg", detected: "28.5 mg", variance: "-5.0%", status: "ok", ref: "ICMR-NIN RDA 40 mg (68%)" },
        { ingredient: "Pectin (INS 440)", declared: "0.3 g", detected: "0.3 g", variance: "0.0%", status: "ok", ref: "Natural Polysaccharide" }
      ]
    },

    legalMetrology: {
      consumer: [
        { check: "Font Size & Legibility", status: "warn", detail: "Numeral print height is 2.80 mm (slightly below the 3.00 mm requirement for 200ml)." },
        { check: "MRP & Tax Statement", status: "pass", detail: "MRP ₹20.00 is printed with 'inclusive of all taxes'." },
        { check: "Unit Sale Price", status: "pass", detail: "Price per ml (₹0.10/ml) printed on side panel." },
        { check: "Consumer Care Support", status: "pass", detail: "Customer care email and factory address provided." }
      ],
      industry: [
        { rule: "Rule 6(1)(e)", requirement: "Numeral & letter height for 200ml net volume", standard: "≥ 3.00 mm", measured: "2.80 mm", status: "FLAG", citation: "PCR 2011 Schedule II Table 1" },
        { rule: "Rule 6(1)(d)", requirement: "Retail sale price declaration", standard: "'MRP ₹xx.xx (incl. of all taxes)'", measured: "'MRP ₹20.00 INCL. OF ALL TAXES'", status: "PASS", citation: "PCR 2011 Rule 6(1)(d)" },
        { rule: "Rule 6(1)(f)", requirement: "Unit Sale Price (USP) declaration", standard: "Mandatory per ml/g adjacent to MRP", measured: "USP ₹0.10 / ml printed", status: "PASS", citation: "PCR 2011 Notification G.S.R. 779(E)" },
        { rule: "Rule 6(1)(c)", requirement: "Net quantity & Tolerable Deficiency (MTD)", standard: "200 ml ± 3% (194ml – 206ml)", measured: "198.5 ml (Compliant)", status: "PASS", citation: "PCR 2011 Second Schedule (Tolerances)" },
        { rule: "Rule 6(1)(a)", requirement: "Manufacturer and packer details", standard: "Complete address and contact details", measured: "NatureSip Agro Foods Ltd, Whitefield Bengaluru - 560066", status: "PASS", citation: "PCR 2011 Rule 6(1)(a)" }
      ]
    },

    fssaiChecks: {
      consumer: [
        { check: "14-Digit FSSAI License", status: "pass", detail: "License #10017042003112 active on food registry." },
        { check: "Fruit Nectar Standard", status: "warn", detail: "Pulp content (19.2%) is slightly below the mandatory 20% minimum for fruit nectar." },
        { check: "Green Veg Food Dot", status: "pass", detail: "Vegetarian food symbol correctly printed." },
        { check: "Sulphite Allergen Warning", status: "pass", detail: "Notice 'Contains Sulphites' present on ingredients list." }
      ],
      industry: [
        { section: "FSS Act Sec 31", check: "Central FoSCoS License Validation", requirement: "14-digit active registration", result: "Lic #10017042003112 · Category 14.1.2.2 (Fruit Nectar) · Valid thru Jun 2027", status: "PASS" },
        { section: "FSSR Clause 2.3.10", check: "Fruit Nectar Pulp Floor Standard", requirement: "Minimum 20% total soluble fruit solids & pulp", result: "Measured: 19.2% (-0.8% statutory deficit non-conformance)", status: "FLAG" },
        { section: "FSSR Clause 2.2.2", check: "Misleading Front-of-Pack Claim", requirement: "Prohibition of deceptive '100% Real Mango' claim when diluted", result: "Notice of Misbranding under Consumer Protection Act Sec 2(28)", status: "FLAG" },
        { section: "FSSR Regulation 3.2.1", check: "Sulphur Dioxide (SO2) Residue", requirement: "Max 50 ppm SO2 in fruit products", result: "Measured: 38 ppm (Within statutory 50 ppm limit)", status: "PASS" },
        { section: "FSSR Clause 2.2.2", check: "Vegetarian Logo Geometry", requirement: "Square box min 3.0mm, green dot min 1.5mm", result: "Measured: 3.0mm box, 1.5mm dot (Compliant)", status: "PASS" }
      ]
    },

    issuesAndAlerts: {
      consumer: [
        { type: "critical", title: "Misleading Front Claim", text: "Front says '100% Real Alphonso Mango' but 80% of the beverage is added cane sugar syrup and water." },
        { type: "warning", title: "Heavy Sugar Spike (124% WHO Daily Limit)", text: "Contains 31.2g sugar in just 200ml. High glycemic spike hazard for children and diabetics." },
        { type: "warning", title: "Sulphite Chemical Preservative", text: "Contains potassium metabisulphite (INS 224), which can trigger reactions in asthma sufferers." }
      ],
      industry: [
        { severity: "CRITICAL", code: "NC-FRT-01", title: "Statutory Pulp Deficit (FSSR 2.3.10)", detail: "Tested pulp content is 19.2% against statutory 20% floor. Non-compliant with Fruit Nectar categorization.", action: "Reclassify as Ready-To-Serve Beverage or boost pulp formulation" },
        { severity: "NON-CONFORMANCE", code: "NC-MET-02", title: "Legal Metrology Print Height Underage", detail: "Numeral print height is 2.80mm vs required 3.00mm under Schedule II.", action: "Adjust packaging printing cylinder" },
        { severity: "OBSERVATION", code: "OB-SUL-03", title: "Sulphite Preservative Monitoring", detail: "Measured at 38 ppm. Close to 50 ppm statutory ceiling.", action: "Monitor batch dispensing accuracy" }
      ]
    },

    evidenceAndRules: {
      consumer: [
        { authority: "World Health Organization (WHO)", rule: "Sugars Intake Ceiling (2024)", text: "31.2g of free sugar exceeds daily recommended 25g limit in a single 200ml serving." },
        { authority: "Consumer Protection Act, 2019", rule: "Section 2(28) Misleading Advertisements", text: "Forbids marketing beverages as '100% Real' when formulation is predominantly sugar water." },
        { authority: "FSSAI Fruit Standards", rule: "Regulation 2.3.10 Fruit Nectar Guidelines", text: "Mandates at least 20% fruit pulp to carry the official 'Fruit Nectar' designation." }
      ],
      industry: [
        { authority: "FSSAI Statutory Clause", clause: "FSS (Food Product Standards & Food Additives) Regulations 2011, Clause 2.3.10", text: "Defines minimum pulp, acidity, and total soluble solids for thermally processed fruit nectars.", link: "FSSAI-FSSR-2.3.10" },
        { authority: "Consumer Protection Act 2019", clause: "Section 2(28) Misbranding & Misleading Claims", text: "Penal liability for falsely representing fruit content percentages on primary display panel.", link: "CPA-2019-S28" },
        { authority: "Legal Metrology Rules 2011", clause: "Schedule II Table 1", text: "Minimum 3.00mm height prescribed for packs between 200g/ml and 500g/ml.", link: "PCR-2011-SCH2" },
        { authority: "Forensic Cryptographic Hash", clause: "SHA-256 Audit Fingerprint", text: "9b201a4fc7e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4", link: "VERIFIED" }
      ]
    },

    inspectorVerification: {
      consumer: {
        inspectorId: "INSP-BLR-6504",
        authority: "South Zone Food Safety Commission",
        date: "12-Sep-2026",
        status: "FLAGGED",
        notes: "Product flagged for fruit pulp deficit and misleading front claims. Reformulation notice served.",
        reportId: "REP-PC-2026-06504",
        certifiedSeal: "OFFICIALLY AUDITED · PACKCHECK VERIFIED"
      },
      industry: {
        inspectorId: "INSP-BLR-6504",
        jurisdiction: "South Zone Central Quality Cell / Bengaluru",
        verificationStatus: "FLAGGED",
        verdictAction: "FLAG",
        enforcementOrder: "Notice of Misbranding issued under FSS Act Section 32 & CPA Section 2(28).",
        timestamp: "2026-09-12T16:45:00+05:30",
        inspectorNotes: "Sample batch NM-2026-09C inspected. Pulp deficit of -0.8% confirmed across 3 lab replicates. Warning issued to adjust print height and remove '100% Real' front claim.",
        reportNumber: "PACKCHECK-REP-2026-06504",
        digitalSignature: "Vikram S., Senior Enforcement Officer (Cryptographically Signed)"
      }
    }
  },

  // ==========================================================================
  // PRODUCT 4: CRISPBITE SEA SALT CHIPS 45G
  // ==========================================================================
  "consumer-4": {
    productInfo: {
      consumer: [
        { label: "Product Name", value: "CrispBite Sea Salt Chips" },
        { label: "Category", value: "Savory Potato Snack" },
        { label: "Net Quantity", value: "45 g (Nitrogen-Flushed Foil Pouch)" },
        { label: "MRP & Unit Price", value: "₹20.00 (₹44.44 per 100g)" },
        { label: "Batch & Expiry", value: "Batch #CB-2026-09D · Best Before 4 Months" },
        { label: "Packer / Brand", value: "CrispBite Snack Foods Pvt Ltd, Sanand GIDC, Ahmedabad GJ" }
      ],
      industry: [
        { label: "SKU / EAN-13", value: "SKU-SNK-045-004 / 8901234567893" },
        { label: "Registered Trade Name", value: "CrispBite Sea Salt Chips 45g Nitrogen Pouch" },
        { label: "Packaging Substrate", value: "Multi-layer Metallized PET/BOPP Nitrogen Cushion Pouch" },
        { label: "Net Content / Tolerance", value: "Declared: 45g | Measured: 45.4g (MTD: ±4.5g) [PASS]" },
        { label: "MRP & Unit Sale Price", value: "MRP ₹20.00 (incl. all taxes) | USP ₹0.44/g per Rule 6(1)(f)" },
        { label: "Mfg / Lot & Expiry", value: "Lot: CB-2026-09D | Mfg: 05-Sep-2026 | Exp: 04-Jan-2027" },
        { label: "Premises & Geo-Location", value: "CrispBite Snack Foods Pvt Ltd, Sanand GIDC Ahmedabad (FOSCOS ID: 10013051000789)" }
      ]
    },

    inspectionSummary: {
      consumer: {
        score: 58,
        grade: "Grade C (Moderate)",
        verdictText: "Made from real whole farm potatoes with zero artificial MSG. Contains high saturated palm fats (6.8g) and moderate sodium.",
        stats: [
          { label: "CleanScore", value: "58 / 100", status: "warn" },
          { label: "Harmful Substances", value: "1 Refined Palm Oil", status: "harm" },
          { label: "Safe Ingredients", value: "2 Natural Salt & Nitrogen", status: "safe" },
          { label: "Good Whole Foods", value: "2 Whole Potatoes & Fiber", status: "good" }
        ],
        auditBadge: "AUDIT PASSED WITH CAUTION",
        badgeClass: "status-warn"
      },
      industry: {
        score: 58,
        classification: "CAUTION",
        auditLevel: "L3 Regulatory Forensic Audit",
        coaNumber: "COA-2026-AHM-7732",
        auditAuthority: "Gujarat State Food & Drugs Control Administration",
        sampleDate: "14-Sep-2026",
        riskIndex: "MODERATE RISK (Elevated Saturated Fatty Acid Profile)",
        keyFindings: [
          "Gas chromatography confirms 14.8g total fat with 6.8g saturated palm fat (34% of ICMR daily ceiling).",
          "Trans fatty acids tested at 0.08g/100g, compliant with FSSAI 'Zero Trans Fat' claim threshold (<0.2g).",
          "Zero detected artificial flavor enhancers (MSG / E621 negative)."
        ]
      }
    },

    detectedDeclarations: {
      consumer: [
        { claim: "Front Label Claim", text: "🥔 'Hand-Cooked Real Farm Potatoes · Seasoned with Pure Sea Salt'" },
        { claim: "Laboratory Reality", text: "✅ Real sliced potatoes confirm 64% of product. Zero artificial MSG detected." },
        { claim: "Saturated Fat Reality", text: "⚠️ Contains 6.8g saturated fat from palm olein — 34% of your daily saturated fat ceiling." },
        { claim: "Sodium Content", text: "290 mg natural sodium per pack (14.5% of daily recommended allowance)." }
      ],
      industry: [
        { ingredient: "Refined Palm Olein Oil", declared: "14.8 g (6.8g Sat)", detected: "14.6 g (6.7g Sat)", variance: "-1.4%", status: "warn", ref: "ICMR Saturated Fat 20g/day (34%)" },
        { ingredient: "Natural Sea Salt (Sodium)", declared: "290 mg Sodium", detected: "284 mg Sodium", variance: "-2.1%", status: "ok", ref: "WHO Sodium Ceiling 2000mg (14.5%)" },
        { ingredient: "Whole Potato Solids", declared: "64.0%", detected: "64.8%", variance: "+1.2%", status: "ok", ref: "Whole Food Base Standard" },
        { ingredient: "Dietary Fiber", declared: "2.1 g", detected: "2.3 g", variance: "+9.5%", status: "ok", ref: "Beneficial Potato Fiber" },
        { ingredient: "Nitrogen Gas Flush", declared: "Headspace flush", detected: "99.1% pure N2", variance: "0.0%", status: "ok", ref: "Standard Inert Atmosphere" }
      ]
    },

    legalMetrology: {
      consumer: [
        { check: "Font Size & Legibility", status: "pass", detail: "Letters and numerals are printed at 2.10 mm height (compliant with small pack rules)." },
        { check: "MRP & Tax Statement", status: "pass", detail: "MRP ₹20.00 is clearly embossed with 'inclusive of all taxes'." },
        { check: "Unit Sale Price", status: "pass", detail: "Price per gram (₹0.44/g) printed on back panel." },
        { check: "Consumer Care Support", status: "pass", detail: "Complete customer feedback email, phone, and manufacturing facility address provided." }
      ],
      industry: [
        { rule: "Rule 6(1)(e)", requirement: "Numeral & letter height for ≤ 50g pack size", standard: "≥ 2.00 mm", measured: "2.10 mm", status: "PASS", citation: "PCR 2011 Schedule II Table 1" },
        { rule: "Rule 6(1)(d)", requirement: "Retail sale price format", standard: "'MRP ₹xx.xx (incl. of all taxes)'", measured: "'MRP ₹20.00 INCL. OF ALL TAXES'", status: "PASS", citation: "PCR 2011 Rule 6(1)(d)" },
        { rule: "Rule 6(1)(f)", requirement: "Unit Sale Price (USP) declaration", standard: "Mandatory per g adjacent to MRP", measured: "USP ₹0.44 / g printed", status: "PASS", citation: "PCR 2011 Notification G.S.R. 779(E)" },
        { rule: "Rule 6(1)(c)", requirement: "Net quantity & Tolerable Deficiency (MTD)", standard: "45 g ± 9% (40.95g – 49.05g)", measured: "45.4 g (Compliant)", status: "PASS", citation: "PCR 2011 Second Schedule (Tolerances)" },
        { rule: "Rule 6(1)(a)", requirement: "Manufacturer and packer details", standard: "Complete address and contact details", measured: "CrispBite Snack Foods Pvt Ltd, GIDC Sanand GJ - 382170", status: "PASS", citation: "PCR 2011 Rule 6(1)(a)" }
      ]
    },

    fssaiChecks: {
      consumer: [
        { check: "14-Digit FSSAI License", status: "pass", detail: "License #10013051000789 is active and verified." },
        { check: "Green Veg Food Dot", status: "pass", detail: "Vegetarian food emblem clearly displayed on front panel." },
        { check: "Trans Fat & Saturated Fat Notice", status: "pass", detail: "Nutritional panel explicitly declares saturated fat and zero trans fat." },
        { check: "Protective Atmosphere Declaration", status: "pass", detail: "Package indicates 'Packaged in a protective atmosphere'." }
      ],
      industry: [
        { section: "FSS Act Sec 31", check: "Central FoSCoS License Validation", requirement: "14-digit active registration", result: "Lic #10013051000789 · Category 15.1 (Snacks/Savoury) · Valid thru Oct 2028", status: "PASS" },
        { section: "FSSR Clause 2.2.2(3)", check: "Trans Fat Declaration Threshold", requirement: "Trans fat <0.2g per serving for 'Zero Trans Fat' claim", result: "Tested: 0.08g/100g (Compliant)", status: "PASS" },
        { section: "FSSR Clause 2.4.2", check: "Protective Gas Packaging", requirement: "'Packaged in a protective atmosphere' declaration", result: "Mandatory text present adjacent to ingredient block", status: "PASS" },
        { section: "FSSR Clause 2.2.2", check: "Vegetarian Logo Geometry", requirement: "Square box min 3.0mm, green dot min 1.5mm", result: "Measured: 3.0mm box, 1.5mm dot (Compliant)", status: "PASS" },
        { section: "FSSR Heavy Metals Screen", check: "Lead & Cadmium Contaminant Floor", requirement: "Lead max 2.5 mg/kg, Cadmium max 0.1 mg/kg", result: "Lead: <0.1 mg/kg, Cadmium: <0.02 mg/kg (Safe)", status: "PASS" }
      ]
    },

    issuesAndAlerts: {
      consumer: [
        { type: "warning", title: "High Saturated Palm Fat", text: "Contains 6.8g saturated fat per pouch (34% of your daily limit). Enjoy in moderation." },
        { type: "safe", title: "No Artificial MSG", text: "Does not contain monosodium glutamate (MSG) or artificial flavor potentiators." },
        { type: "safe", title: "Zero Trans Fats", text: "Tested and verified free from dangerous industrially produced trans-fats." }
      ],
      industry: [
        { severity: "CAUTION", code: "CT-FAT-01", title: "High Saturated Fatty Acid Fraction", detail: "Palm olein oil contributes 6.8g saturated fatty acids per 45g pack. Exceeds healthy snack guidelines.", action: "Advise blending with cold-pressed sunflower or rice bran oil" },
        { severity: "COMPLIANT", code: "CMP-MSG-02", title: "Zero Synthetic Additives", detail: "HPLC and FTIR screen negative for MSG, TBHQ, or synthetic antioxidants.", action: "Maintain current clean whole potato sourcing" }
      ]
    },

    evidenceAndRules: {
      consumer: [
        { authority: "ICMR - National Institute of Nutrition (NIN)", rule: "Dietary Guidelines on Saturated Fats (2024)", text: "Recommends that saturated fats provide no more than 8-10% of total daily energy to protect heart health." },
        { authority: "World Health Organization (WHO)", rule: "Sodium Guideline for Adults & Children", text: "Recommends maximum 2,000 mg sodium per day (approx 5g salt)." },
        { authority: "Ministry of Consumer Affairs", rule: "Legal Metrology Rules 2011", text: "Governs small packaging labelling requirements for snacks under 50g." }
      ],
      industry: [
        { authority: "ICMR-NIN Dietary Guidelines 2024", clause: "Chapter 7: Fat Quality & Cardiovascular Risk", text: "Recommends reducing high-palmitic palm oil consumption and limiting saturated fat intake <10% energy.", link: "ICMR-NIN-2024" },
        { authority: "FSS (Packaging and Labelling) Regulations", clause: "Trans-Fatty Acids Limitation Notification 2021", text: "Caps trans-fat in fats/oils at <2% and mandates strict verification for front-of-pack claims.", link: "FSSAI-TFA-2021" },
        { authority: "Legal Metrology Rules 2011", clause: "Schedule II Table 1", text: "Prescribes minimum 2.00mm numeral height for commodities up to 50g.", link: "PCR-2011-SCH2" },
        { authority: "Forensic Cryptographic Hash", clause: "SHA-256 Audit Fingerprint", text: "3c87a1d5e9b0a1f2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6", link: "VERIFIED" }
      ]
    },

    inspectorVerification: {
      consumer: {
        inspectorId: "INSP-AHM-9102",
        authority: "Gujarat State Food Safety Cell",
        date: "14-Sep-2026",
        status: "PASSED",
        notes: "Real whole potato snack with accurate label declarations. Passed statutory audit.",
        reportId: "REP-PC-2026-09102",
        certifiedSeal: "OFFICIALLY AUDITED · PACKCHECK VERIFIED"
      },
      industry: {
        inspectorId: "INSP-AHM-9102",
        jurisdiction: "Gujarat Central Enforcement Wing / Ahmedabad",
        verificationStatus: "PASSED",
        verdictAction: "PASS",
        enforcementOrder: "Clean bill of inspection granted. Quality advisory issued regarding frying oil profile.",
        timestamp: "2026-09-14T10:30:00+05:30",
        inspectorNotes: "Sample batch CB-2026-09D tested. Declarations match analytical gas chromatography findings. No synthetic adulterants detected.",
        reportNumber: "PACKCHECK-REP-2026-09102",
        digitalSignature: "Hasmukh Patel, Food Safety Officer (Cryptographically Signed)"
      }
    }
  }
};

// Expose globally to window
if (typeof window !== "undefined") {
  window.DOSSIER_DATA = DOSSIER_DATA;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DOSSIER_DATA;
}
