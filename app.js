/**
 * PackCheck — Food Label & Ingredient Reality Engine
 * Minimalist Brutalist Architecture
 * Features: Instant Dual-Chamber Sample Switcher, Fast Modal Scanner,
 * Clean Three-Tier Ingredient Categorizer & Results Dashboard
 */

// ============================================================================
// 1. PRODUCT & SUBSTANCE DATABASE (Shape strictly preserved)
// ============================================================================
const PRODUCTS_DB = {
  "consumer-1": {
    id: "consumer-1",
    name: "Volt Surge Energy Drink 250ml",
    shortName: "Volt Surge Energy",
    category: "Carbonated Energy Beverage",
    packageType: "250ml Aluminum Slim Can",
    servingSize: "1 Can (250 ml)",
    cleanScore: 38,
    grade: "Grade D (Caution)",
    status: "harm",
    verdict: "Caution: Contains 27g added sugar (108% daily WHO limit) and high caffeine. Contains beneficial B-vitamins, but best kept as an occasional treat.",
    visualSvg: `
      <svg width="70" height="120" viewBox="0 0 50 90" fill="none">
        <rect x="8" y="10" width="34" height="74" rx="2" fill="#111110" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="25" cy="10" rx="17" ry="4" fill="#D8D0C2"/>
        <path d="M28 28L21 44H27L23 58L32 40H26L28 28Z" fill="#C92A2A"/>
      </svg>
    `,
    harmful: [
      {
        name: "Added Sucrose (Table Sugar)",
        category: "Refined Free Sugar",
        qty: "27.0 g / can",
        limit: "108% of WHO Daily Free Sugar Limit (25g)",
        status: "harm",
        whatIsIt: "High-glycemic simple carbohydrate refined from sugarcane.",
        whyInProduct: "Added in heavy quantities to mask the bitter taste of caffeine and deliver an immediate sweet kick.",
        whatItDoes: "Spikes blood glucose and triggers a sharp insulin surge. Regularly exceeding daily limits is linked to fatty liver, weight gain, and energy crashes."
      },
      {
        name: "Liquid Glucose Syrup",
        category: "Simple Sugars",
        qty: "3.2 g / can",
        limit: "Combined Sugar Total: 30.2g",
        status: "harm",
        whatIsIt: "Concentrated aqueous solution of nutritive saccharides obtained from starch.",
        whyInProduct: "Used as an inexpensive thickener and sweetener to enhance syrup mouthfeel.",
        whatItDoes: "Absorbed almost immediately into the bloodstream, compounding glycemic volatility and dental enamel demineralization."
      }
    ],
    safe: [
      {
        name: "Carbonated Purified Water",
        category: "Aqueous Base",
        qty: "Base liquid (~210ml)",
        limit: "Safe for regular hydration",
        status: "safe",
        whatIsIt: "Multi-stage filtered water charged with food-grade carbon dioxide.",
        whyInProduct: "Forms the thirst-quenching, effervescent vehicle for all dissolved nutrients.",
        whatItDoes: "Completely inert and hydrating. The effervescence provides a refreshing crisp mouthfeel."
      },
      {
        name: "Citric Acid (INS 330)",
        category: "Natural Acidulant",
        qty: "0.8 g",
        limit: "Standard food-grade buffer",
        status: "safe",
        whatIsIt: "Organic acid naturally found in citrus fruits like lemons and limes.",
        whyInProduct: "Regulates tartness, balances sweetness, and naturally protects freshness.",
        whatItDoes: "Easily metabolized through the standard Krebs energy cycle with zero toxic buildup."
      },
      {
        name: "Sodium Citrate (INS 331)",
        category: "Electrolyte Buffer",
        qty: "42 mg",
        limit: "2.1% of ICMR Sodium Guideline",
        status: "safe",
        whatIsIt: "Sodium salt of citric acid.",
        whyInProduct: "Maintains optimal pH stability and smooths out beverage acidity.",
        whatItDoes: "Acts as a benign electrolyte assisting in cellular fluid regulation."
      },
      {
        name: "Taurine",
        category: "Amino Sulfonic Acid",
        qty: "500 mg",
        limit: "Safe ceiling: 3000 mg/day",
        status: "safe",
        whatIsIt: "Naturally occurring amino sulfonic acid found abundantly in human tissues and seafood.",
        whyInProduct: "Formulated to complement caffeine in supporting cellular hydration during exertion.",
        whatItDoes: "Well within metabolic clearance capacity; supports antioxidant and muscle membrane stability."
      },
      {
        name: "Nature Identical Mixed Berry Flavor",
        category: "Aroma Compound",
        qty: "Trace (<0.1%)",
        limit: "FSSAI & FEMA GRAS Approved",
        status: "safe",
        whatIsIt: "Flavor molecules chemically identical to those found in wild berries.",
        whyInProduct: "Provides the signature fruity berry aroma profile.",
        whatItDoes: "Non-nutritive and safely metabolized without biological disruption."
      }
    ],
    good: [
      {
        name: "Niacinamide (Vitamin B3)",
        category: "Essential B-Vitamin",
        qty: "10.0 mg",
        limit: "71% Recommended Daily Allowance (RDA)",
        status: "good",
        whatIsIt: "Vital coenzyme precursor (NAD/NADP) for cellular respiration.",
        whyInProduct: "Fortified to promote real metabolic carbohydrate breakdown into energy.",
        whatItDoes: "Supports DNA repair, cardiovascular health, and clean metabolic energy release."
      },
      {
        name: "Pyridoxine HCl (Vitamin B6)",
        category: "Essential B-Vitamin",
        qty: "1.5 mg",
        limit: "75% Recommended Daily Allowance (RDA)",
        status: "good",
        whatIsIt: "Crucial cofactor for amino acid and neurotransmitter synthesis.",
        whyInProduct: "Helps the body convert dietary proteins and glycogen into usable stamina.",
        whatItDoes: "Essential for healthy cognitive focus, red blood cell production, and immune vitality."
      },
      {
        name: "Cyanocobalamin (Vitamin B12)",
        category: "Essential B-Vitamin",
        qty: "0.5 mcg",
        limit: "50% Recommended Daily Allowance (RDA)",
        status: "good",
        whatIsIt: "Complex cobalt-containing vitamin fundamental to neurological health.",
        whyInProduct: "Included to support cellular DNA synthesis and prevent fatigue.",
        whatItDoes: "Crucial for nerve myelin sheath maintenance and healthy neurological transmission."
      },
      {
        name: "Inositol",
        category: "Nutrient Compound",
        qty: "25 mg",
        limit: "Naturally present in whole grains & fruits",
        status: "good",
        whatIsIt: "Carbocyclic sugar that mediates cellular signal transduction.",
        whyInProduct: "Formulated to support cellular membrane integrity and brain neurotransmitters.",
        whatItDoes: "Promotes healthy cellular sensitivity to insulin and steady focus."
      }
    ],
    bodyImpact: [
      { label: "Blood Sugar Spike", verdict: "High Risk", val: 92, status: "harm", text: "27g free sugar causes rapid glucose surge followed by an insulin dip." },
      { label: "Heart & Nervous System", verdict: "Moderate", val: 62, status: "warn", text: "75mg caffeine stimulates heart rate; safe for active adults, avoid before sleep." },
      { label: "Teeth & Enamel Acidity", verdict: "Moderate", val: 58, status: "warn", text: "Acidic pH (3.2) can soften dental enamel if sipped continuously." },
      { label: "Nutritional Vitality", verdict: "Good (B-Complex)", val: 65, status: "good", text: "Delivers 50-75% RDA of Vitamins B3, B6, and B12." }
    ],
    swaps: [
      {
        name: "Cold-Infused Sencha Green Tea",
        reason: "Zero Added Sugar • 45mg Natural L-Theanine & Caffeine Synergy",
        score: "CleanScore: 94",
        icon: "🍵"
      },
      {
        name: "Raw Electrolyte Coconut Water",
        reason: "Rich in Natural Potassium & Magnesium • 85% Less Sugar",
        score: "CleanScore: 89",
        icon: "🥥"
      }
    ],
    metrology: {
      numeral: "3.20 mm (Compliant with Sched II)",
      mrp: "MRP ₹110.00 incl. of all taxes",
      fssai: "10019022008421"
    }
  },

  "consumer-2": {
    id: "consumer-2",
    name: "Spark Zero Cola 330ml",
    shortName: "Spark Zero Cola",
    category: "Zero Sugar Carbonated Beverage",
    packageType: "330ml Aluminum Can",
    servingSize: "1 Can (330 ml)",
    cleanScore: 78,
    grade: "Grade B (Safe Choice)",
    status: "safe",
    verdict: "Safe & Sugar-Free: Zero free sugars and 0 calories. Uses approved non-caloric sweeteners and mild caffeine. Great alternative to sugary sodas.",
    visualSvg: `
      <svg width="70" height="120" viewBox="0 0 50 90" fill="none">
        <rect x="8" y="10" width="34" height="74" rx="2" fill="#111110" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="25" cy="10" rx="17" ry="4" fill="#D8D0C2"/>
        <rect x="12" y="32" width="26" height="6" fill="#1864AB"/>
        <text x="25" y="52" font-family="Space Grotesk" font-size="8" font-weight="800" fill="#FFFFFF" text-anchor="middle">ZERO</text>
      </svg>
    `,
    harmful: [],
    safe: [
      {
        name: "Sucralose (INS 955)",
        category: "Non-Caloric Sweetener",
        qty: "32 mg",
        limit: "5% of WHO / JECFA Acceptable Daily Intake (ADI)",
        status: "safe",
        whatIsIt: "High-intensity non-nutritive sweetener derived from sucrose by selective chlorination.",
        whyInProduct: "Provides clean sweetness with zero calories and zero carbohydrate load.",
        whatItDoes: "Passes through the digestive tract largely unabsorbed, causing no blood sugar elevation."
      },
      {
        name: "Acesulfame Potassium (INS 950)",
        category: "Synergistic Sweetener",
        qty: "16 mg",
        limit: "3% of JECFA Acceptable Daily Intake",
        status: "safe",
        whatIsIt: "Organic potassium salt with intense sweetening capacity.",
        whyInProduct: "Blended with sucralose to create a rounded, sugar-like taste profile.",
        whatItDoes: "Excreted intact via the kidneys without metabolic conversion or caloric yield."
      },
      {
        name: "Carbonated Purified Water",
        category: "Base Fluid",
        qty: "~320 ml",
        limit: "Safe for regular consumption",
        status: "safe",
        whatIsIt: "Filtered sparkling spring water base.",
        whyInProduct: "Delivers crisp effervescent hydration.",
        whatItDoes: "Completely calorie-free hydration."
      },
      {
        name: "Phosphoric Acid (INS 338)",
        category: "Food Acidulant",
        qty: "150 mg",
        limit: "Well below EFSA phosphate ceilings",
        status: "safe",
        whatIsIt: "Mineral acid commonly used in dark cola beverages.",
        whyInProduct: "Imparts the distinct sharp tangy bite characteristic of cola.",
        whatItDoes: "Safe in moderate amounts; consume with a meal to preserve dental enamel."
      },
      {
        name: "Caramel IV (INS 150d)",
        category: "Class IV Food Color",
        qty: "40 mg",
        limit: "Fully complies with FSSAI limits",
        status: "safe",
        whatIsIt: "Heat-treated carbohydrate coloring agent.",
        whyInProduct: "Provides the dark amber-brown cola color.",
        whatItDoes: "Permitted additive evaluated extensively by JECFA with established safety margins."
      }
    ],
    good: [
      {
        name: "Caffeine (Mild)",
        category: "Natural Stimulant",
        qty: "32.0 mg / can",
        limit: "8% of 400mg Daily Safe Adult Ceiling",
        status: "good",
        whatIsIt: "Botanical alkaloid naturally occurring in cola nuts and tea leaves.",
        whyInProduct: "Provides mild alertness and crisp flavor synergy.",
        whatItDoes: "Equivalent to 1/3 cup of green tea; provides gentle cognitive focus without jitters."
      }
    ],
    bodyImpact: [
      { label: "Blood Sugar Spike", verdict: "Zero Impact", val: 5, status: "good", text: "0g sugar, 0 kcal. Completely flat blood glucose response." },
      { label: "Heart & Nervous System", verdict: "Very Low", val: 18, status: "safe", text: "32mg caffeine is very mild (comparable to green tea)." },
      { label: "Teeth & Enamel Acidity", verdict: "Moderate", val: 48, status: "warn", text: "Carbonation and phosphoric acid are mildly acidic; rinse mouth with water." },
      { label: "Nutritional Vitality", verdict: "Neutral Hydration", val: 40, status: "safe", text: "Pure refreshment alternative without added vitamins." }
    ],
    swaps: [
      {
        name: "Cold-Pressed Sparkling Lemon Botanicals",
        reason: "Additive-Free • Infused with Real Organic Cold-Pressed Lemon",
        score: "CleanScore: 96",
        icon: "🍋"
      }
    ],
    metrology: {
      numeral: "3.50 mm (Compliant)",
      mrp: "MRP ₹40.00 incl. of all taxes",
      fssai: "10014011000244"
    }
  },

  "consumer-3": {
    id: "consumer-3",
    name: "NatureSip Mango Nectar 200ml",
    shortName: "NatureSip Mango",
    category: "Fruit Nectar Beverage",
    packageType: "200ml Aseptic Tetra Pack",
    servingSize: "1 Pack (200 ml)",
    cleanScore: 52,
    grade: "Grade C (High Sugar)",
    status: "warn",
    verdict: "Contains Real Alphonso Mango and Vitamin C, but carries 30g of added sucrose (120% daily WHO max free sugar). Enjoy as an occasional treat.",
    visualSvg: `
      <svg width="70" height="120" viewBox="0 0 55 90" fill="none">
        <rect x="10" y="8" width="35" height="76" rx="2" fill="#D9480F" stroke="#111110" stroke-width="1.5"/>
        <circle cx="27" cy="40" r="12" fill="#FFA94D"/>
        <text x="27" y="65" font-family="Space Grotesk" font-size="7" font-weight="800" fill="#FFFFFF" text-anchor="middle">MANGO</text>
      </svg>
    `,
    harmful: [
      {
        name: "Added Cane Sugar (Sucrose)",
        category: "Free Sugar Concentrate",
        qty: "30.0 g / pack",
        limit: "120% of WHO Daily Recommended Free Sugar Budget (25g)",
        status: "harm",
        whatIsIt: "High-density refined sucrose added to amplify nectar sweetness.",
        whyInProduct: "Creates an intensely thick and sweet taste profile that mimics ripe mango.",
        whatItDoes: "Exceeds the ideal daily free sugar threshold in just one small 200ml box, raising glycemic index rapidly."
      },
      {
        name: "Potassium Metabisulphite (INS 224)",
        category: "Sulphite Preservative",
        qty: "35 ppm",
        limit: "Permitted Class II Preservative",
        status: "harm",
        whatIsIt: "Sulphite chemical agent used to preserve color and prevent oxidation in fruit purees.",
        whyInProduct: "Prevents browning of natural fruit pulp on supermarket shelves.",
        whatItDoes: "Can trigger mild respiratory irritation or allergic symptoms in sensitive asthmatic individuals."
      }
    ],
    safe: [
      {
        name: "Purified Water",
        category: "Reconstitution Base",
        qty: "~150 ml",
        limit: "Pure & safe",
        status: "safe",
        whatIsIt: "Purified drinking water used to blend the dense fruit puree.",
        whyInProduct: "Reconstitutes natural fruit solids to nectar fluidity.",
        whatItDoes: "Standard safe hydration."
      },
      {
        name: "Pectin (INS 440)",
        category: "Fruit Gelling Agent",
        qty: "0.3 g",
        limit: "Natural plant polysaccharide",
        status: "safe",
        whatIsIt: "Soluble dietary fiber extracted from citrus peels and apples.",
        whyInProduct: "Gives rich, smooth fruit nectar texture and body.",
        whatItDoes: "Acts as a gentle prebiotic fiber in the gut."
      }
    ],
    good: [
      {
        name: "Real Alphonso Mango Pulp (20%)",
        category: "Real Fruit Puree",
        qty: "40.0 g real fruit",
        limit: "Meets FSSAI statutory nectar standard",
        status: "good",
        whatIsIt: "Authentic whole crushed mango puree retaining natural fruit bioactive compounds.",
        whyInProduct: "Primary natural flavor and character of the drink.",
        whatItDoes: "Supplies natural polyphenols, mangiferin antioxidants, and botanical nutrients."
      },
      {
        name: "Ascorbic Acid (Vitamin C)",
        category: "Antioxidant Vitamin",
        qty: "30.0 mg",
        limit: "75% Recommended Daily Allowance (RDA)",
        status: "good",
        whatIsIt: "Essential water-soluble antioxidant vitamin.",
        whyInProduct: "Protects fruit freshness and boosts nutritional value.",
        whatItDoes: "Supports immune defense, collagen synthesis, and cell protection from oxidative stress."
      }
    ],
    bodyImpact: [
      { label: "Blood Sugar Spike", verdict: "High Impact", val: 96, status: "harm", text: "30g sugar in 200ml causes a rapid insulin spike; best consumed after active sports." },
      { label: "Heart & Nervous System", verdict: "Zero Stimulant", val: 5, status: "safe", text: "100% caffeine-free." },
      { label: "Teeth & Enamel Acidity", verdict: "Moderate", val: 55, status: "warn", text: "Natural fruit acids + high sugar adhere to teeth." },
      { label: "Nutritional Vitality", verdict: "Good (Real Fruit)", val: 72, status: "good", text: "20% real mango pulp and 75% RDA of Vitamin C." }
    ],
    swaps: [
      {
        name: "Cold-Pressed Alphonso Infusion & Raw Coconut",
        reason: "Zero Added Cane Sugar • 100% Raw Fruit Puree & Coconut Water",
        score: "CleanScore: 95",
        icon: "🥭"
      }
    ],
    metrology: {
      numeral: "2.80 mm (Compliant)",
      mrp: "MRP ₹20.00 incl. of all taxes",
      fssai: "10017042003112"
    }
  },

  "consumer-4": {
    id: "consumer-4",
    name: "CrispBite Sea Salt Chips 45g",
    shortName: "CrispBite Sea Salt",
    category: "Savory Potato Snack",
    packageType: "45g Nitrogen-Flushed Foil Pouch",
    servingSize: "1 Pouch (45 g)",
    cleanScore: 58,
    grade: "Grade C (Moderate)",
    status: "warn",
    verdict: "Crispy snack made with real whole farm potatoes and zero artificial preservatives. Contains high saturated palm fats and moderate sodium.",
    visualSvg: `
      <svg width="70" height="120" viewBox="0 0 60 90" fill="none">
        <path d="M10 16 L20 10 L40 10 L50 16 L48 80 L12 80 Z" fill="#1864AB" stroke="#111110" stroke-width="1.5"/>
        <circle cx="30" cy="45" r="14" fill="#339AF0"/>
        <text x="30" y="48" font-family="Space Grotesk" font-size="7" font-weight="800" fill="#FFFFFF" text-anchor="middle">CHIPS</text>
      </svg>
    `,
    harmful: [
      {
        name: "Refined Palm Olein Oil (Saturated Fats)",
        category: "Refined Cooking Oil",
        qty: "14.8 g fat (6.8g Saturated)",
        limit: "34% of Recommended Daily Saturated Fat Ceiling",
        status: "harm",
        whatIsIt: "High-heat refined tropical vegetable oil rich in palmitic acid.",
        whyInProduct: "Used for frying chips to achieve prolonged shelf crunch.",
        whatItDoes: "High regular intake of saturated palmitic fats is linked to elevated LDL cholesterol."
      }
    ],
    safe: [
      {
        name: "Natural Sea Salt",
        category: "Seasoning Mineral",
        qty: "290 mg Sodium",
        limit: "14.5% of 2000mg Daily Limit",
        status: "safe",
        whatIsIt: "Evaporated ocean mineral salt.",
        whyInProduct: "Core savory flavor enhancement.",
        whatItDoes: "Essential dietary electrolyte; safe within reasonable daily snacking."
      },
      {
        name: "Nitrogen Atmosphere Flush",
        category: "Protective Gas",
        qty: "Headspace gas",
        limit: "Completely inert",
        status: "safe",
        whatIsIt: "Pure medical-grade inert nitrogen gas.",
        whyInProduct: "Cushions chips from breaking and eliminates oxygen to prevent staleness.",
        whatItDoes: "Completely natural component of ambient air (78% of air)."
      }
    ],
    good: [
      {
        name: "Farm-Fresh Whole Potatoes (64%)",
        category: "Whole Vegetable",
        qty: "28.8 g whole potato",
        limit: "Whole food base",
        status: "good",
        whatIsIt: "Whole sliced potatoes grown on certified local farms.",
        whyInProduct: "Primary wholesome food ingredient.",
        whatItDoes: "Contains natural dietary fiber, potassium, and resistant starch."
      },
      {
        name: "Dietary Fiber",
        category: "Natural Fiber",
        qty: "2.1 g",
        limit: "Beneficial digestive fiber",
        status: "good",
        whatIsIt: "Natural potato cell wall complex carbohydrates.",
        whyInProduct: "Naturally present in whole potato slices.",
        whatItDoes: "Supports smooth gastrointestinal transit and satiety."
      }
    ],
    bodyImpact: [
      { label: "Blood Sugar Spike", verdict: "Moderate", val: 50, status: "safe", text: "Complex potato starch combined with fat slows glucose release." },
      { label: "Lipid & Saturated Fat", verdict: "High Risk", val: 82, status: "harm", text: "14.8g fat with 6.8g saturated palm fat." },
      { label: "Sodium & Blood Pressure", verdict: "Moderate", val: 42, status: "warn", text: "290mg sodium is 14.5% of daily allowance." },
      { label: "Nutritional Vitality", verdict: "Fair", val: 45, status: "safe", text: "Whole farm potatoes with zero artificial MSG." }
    ],
    swaps: [
      {
        name: "Roasted Lotus Seeds (Makhana) with Sea Salt",
        reason: "70% Less Fat • Popped, Never Fried • Zero Palm Oil",
        score: "CleanScore: 96",
        icon: "🌱"
      }
    ],
    metrology: {
      numeral: "2.10 mm (Compliant for 45g)",
      mrp: "MRP ₹20.00 incl. of all taxes",
      fssai: "10013051000789"
    }
  }
};

// ============================================================================
// 2. STATE MANAGER
// ============================================================================
let CURRENT_PRODUCT_ID = "consumer-1";
let ACTIVE_FILTER = "all";

// ============================================================================
// 3. HERO SAMPLE SWITCHER & BRUTALIST COMPARISON
// ============================================================================
let CURRENT_HERO_SAMPLE_ID = "consumer-1";

const HERO_SAMPLES_DATA = {
  "consumer-1": {
    batch: "250ML SLIM CAN",
    frontTitle: "VOLT SURGE",
    frontFlavor: "WILD BERRY / SPARKLING ENERGY",
    pills: ["NEW FORMULATION", "ENERGY BOOST"],
    claims: [
      { quote: '"ALL NATURAL ENERGY"', tag: "27g FREE SUGAR" },
      { quote: '"ZERO GUILT CRASH"', tag: "108% WHO LIMIT" },
      { quote: '"VITAMIN CHARGED"', tag: "B-COMPLEX (75% RDA)" }
    ],
    fakeScore: "96",
    fakeTag: '"CLEAN STAMINA"',
    serving: "Serving: 1 Can (250 ml)",
    calories: "116",
    sugarLabel: "Added Sugars (27g)",
    sugarSub: "6.75 TEASPOONS",
    sugarStamp: "🔴 108% WHO",
    sugarClass: "harm-row",
    caffLabel: "Caffeine (75mg)",
    caffSub: "CNS STIMULANT",
    caffStamp: "🟠 1 ESPRESSO",
    caffClass: "warn-row",
    vitLabel: "Vitamins B3, B6, B12",
    vitSub: "METABOLIC COFACTORS",
    vitStamp: "🟢 75% RDA",
    vitClass: "good-row",
    realityScore: "38",
    realityGrade: "GRADE: D",
    ticker: "27g Added Sugar breaches WHO daily ceiling (108%)"
  },
  "consumer-2": {
    batch: "330ML ZERO COLA",
    frontTitle: "SPARK ZERO",
    frontFlavor: "CRISP BOTANICAL COLA / ZERO SUGAR",
    pills: ["0 CALORIES", "MAX REFRESH"],
    claims: [
      { quote: '"100% SUGAR FREE"', tag: "VERIFIED 0g SUGAR" },
      { quote: '"CLEAN CITRUS COLA"', tag: "PHOSPHORIC ACID" },
      { quote: '"ZERO AFTERTASTE"', tag: "SUCRALOSE (5% ADI)" }
    ],
    fakeScore: "99",
    fakeTag: '"PERFECT ZERO"',
    serving: "Serving: 1 Can (330 ml)",
    calories: "0",
    sugarLabel: "Free Sugars (0g)",
    sugarSub: "ZERO GLUCOSE SPIKE",
    sugarStamp: "🟢 0% WHO",
    sugarClass: "good-row",
    caffLabel: "Non-Caloric Sweeteners",
    caffSub: "SUCRALOSE + ACE-K",
    caffStamp: "🟢 5% ADI",
    caffClass: "good-row",
    vitLabel: "Phosphoric Acid (150mg)",
    vitSub: "ACIDIC pH 2.8 (ENAMEL)",
    vitStamp: "🟠 MODERATE ACID",
    vitClass: "warn-row",
    realityScore: "78",
    realityGrade: "GRADE: B",
    ticker: "Zero Added Sugar • Approved Sweeteners Verified (CleanScore: 78)"
  },
  "consumer-3": {
    batch: "200ML TETRAPACK",
    frontTitle: "NATURESIP",
    frontFlavor: "ORCHARD PRESSED MANGO NECTAR",
    pills: ["FARM FRESH", "NO PRESERVATIVES"],
    claims: [
      { quote: '"100% PURE FRUIT NECTAR"', tag: "31g FREE SUGAR" },
      { quote: '"RICH IN VITAL GOODNESS"', tag: "0.2g FIBER (STRIPPED)" },
      { quote: '"IMMUNITY VITAMIN C"', tag: "VITAMIN C (60% RDA)" }
    ],
    fakeScore: "95",
    fakeTag: '"ORGANIC VITALITY"',
    serving: "Serving: 1 Tetrapack (200 ml)",
    calories: "134",
    sugarLabel: "Free Sugars (31.2g)",
    sugarSub: "7.8 TEASPOONS FRUCTOSE",
    sugarStamp: "🔴 124% WHO",
    sugarClass: "harm-row",
    caffLabel: "Dietary Fiber (0.2g)",
    caffSub: "WHOLE FIBER STRIPPED OUT",
    caffStamp: "🔴 STRIPPED",
    caffClass: "harm-row",
    vitLabel: "Ascorbic Acid (Vit C)",
    vitSub: "NATURAL ANTIOXIDANT",
    vitStamp: "🟢 60% RDA",
    vitClass: "good-row",
    realityScore: "42",
    realityGrade: "GRADE: D",
    ticker: "31.2g Liquid Sugar • Natural Fiber Filtered Out (124% WHO)"
  }
};

function setHeroSample(sampleId) {
  CURRENT_HERO_SAMPLE_ID = sampleId;
  const data = HERO_SAMPLES_DATA[sampleId];
  if (!data) return;

  // 1. Update Tabs
  document.querySelectorAll(".monolith-sample-tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-sample") === sampleId);
  });

  // 2. Update Batch & Headers
  const batchEl = document.getElementById("heroMonolithBatchText");
  if (batchEl) batchEl.textContent = data.batch;

  // 3. Update Front Layer
  const titleEl = document.getElementById("heroFrontTitle");
  if (titleEl) titleEl.textContent = data.frontTitle;

  const flavorEl = document.getElementById("heroFrontFlavor");
  if (flavorEl) flavorEl.textContent = data.frontFlavor;

  const pill1 = document.getElementById("heroFrontPill1");
  const pill2 = document.getElementById("heroFrontPill2");
  if (pill1 && data.pills[0]) pill1.textContent = data.pills[0];
  if (pill2 && data.pills[1]) pill2.textContent = data.pills[1];

  const c1Q = document.getElementById("heroFrontClaim1");
  const c1T = document.getElementById("heroClaimTag1");
  if (c1Q) c1Q.textContent = data.claims[0].quote;
  if (c1T) c1T.textContent = data.claims[0].tag;

  const c2Q = document.getElementById("heroFrontClaim2");
  const c2T = document.getElementById("heroClaimTag2");
  if (c2Q) c2Q.textContent = data.claims[1].quote;
  if (c2T) c2T.textContent = data.claims[1].tag;

  const c3Q = document.getElementById("heroFrontClaim3");
  const c3T = document.getElementById("heroClaimTag3");
  if (c3Q) c3Q.textContent = data.claims[2].quote;
  if (c3T) c3T.textContent = data.claims[2].tag;

  const fakeScoreEl = document.getElementById("heroFrontFakeScore");
  if (fakeScoreEl) fakeScoreEl.innerHTML = `${data.fakeScore}<span style="font-size: 0.5em; color: #888;">/100</span>`;

  const fakeTagEl = document.getElementById("heroFrontFakeTag");
  if (fakeTagEl) fakeTagEl.textContent = data.fakeTag;

  // 4. Update Back Layer
  const servEl = document.getElementById("heroBackServing");
  if (servEl) servEl.textContent = data.serving;

  const calEl = document.getElementById("heroBackCalories");
  if (calEl) calEl.textContent = data.calories;

  const rowSugar = document.getElementById("heroRowSugar");
  if (rowSugar) {
    rowSugar.className = `back-stat-row ${data.sugarClass}`;
    const l = document.getElementById("heroBackSugarLabel");
    const s = document.getElementById("heroBackSugarSub");
    const st = document.getElementById("heroBackSugarStamp");
    if (l) l.textContent = data.sugarLabel;
    if (s) s.textContent = data.sugarSub;
    if (st) st.textContent = data.sugarStamp;
  }

  const rowCaff = document.getElementById("heroRowCaffeine");
  if (rowCaff) {
    rowCaff.className = `back-stat-row ${data.caffClass}`;
    const l = document.getElementById("heroBackCaffLabel");
    const s = document.getElementById("heroBackCaffSub");
    const st = document.getElementById("heroBackCaffStamp");
    if (l) l.textContent = data.caffLabel;
    if (s) s.textContent = data.caffSub;
    if (st) st.textContent = data.caffStamp;
  }

  const rowVit = document.getElementById("heroRowVitamins");
  if (rowVit) {
    rowVit.className = `back-stat-row ${data.vitClass}`;
    const l = document.getElementById("heroBackVitLabel");
    const s = document.getElementById("heroBackVitSub");
    const st = document.getElementById("heroBackVitStamp");
    if (l) l.textContent = data.vitLabel;
    if (s) s.textContent = data.vitSub;
    if (st) st.textContent = data.vitStamp;
  }

  const realityScoreEl = document.getElementById("heroRealityScore");
  if (realityScoreEl) realityScoreEl.innerHTML = `${data.realityScore}<span style="font-size: 0.5em; color: var(--ink-muted);">/100</span>`;

  const realityGradeEl = document.getElementById("heroRealityGrade");
  if (realityGradeEl) {
    realityGradeEl.textContent = data.realityGrade;
    realityGradeEl.className = `status-stamp mono ${data.sugarClass === "harm-row" ? "stamp-harm" : "stamp-safe"}`;
  }

  const ticker = document.getElementById("heroScannerTickerText");
  if (ticker) ticker.textContent = data.ticker;
}

function initHeroSampleSwitcher() {
  const sampleTabs = [
    { id: "btnHeroSample1", sample: "consumer-1" },
    { id: "btnHeroSample2", sample: "consumer-2" },
    { id: "btnHeroSample3", sample: "consumer-3" }
  ];

  sampleTabs.forEach(({ id, sample }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        setHeroSample(sample);
      });
    }
  });

  setHeroSample("consumer-1");
}

// ============================================================================
// 6. SCROLL-SPY & MOBILE MENU CONTROLLER
// ============================================================================
function initNavigation() {
  const siteNav = document.getElementById("siteNav");

  // ── Scroll-triggered navbar elevation (border + shadow reveal)
  function updateNavScrollState() {
    if (!siteNav) return;
    if (window.scrollY > 10) {
      siteNav.classList.add("scrolled");
    } else {
      siteNav.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", updateNavScrollState, { passive: true });
  updateNavScrollState(); // run once on load

  // ── Mobile nav toggle
  const mobileToggle = document.getElementById("btnMobileNavToggle");
  const mobileDrawer = document.getElementById("mobileNavDrawer");

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", isOpen);
    });

    // Close on link click
    mobileDrawer.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ── Scroll-Spy for desktop nav links (3 real sections)
  const sections = [
    { id: "scan",           navLink: document.getElementById("navLinkScan") },
    { id: "truth",          navLink: document.getElementById("navLinkTruth") },
    { id: "closingSection", navLink: document.getElementById("navLinkClosing") }
  ].filter(s => s.navLink);

  function updateScrollSpy() {
    const scrollPos = window.scrollY + 120;
    let activeSet = false;
    for (let i = sections.length - 1; i >= 0; i--) {
      const { id, navLink } = sections[i];
      const el = document.getElementById(id);
      if (el && scrollPos >= el.offsetTop) {
        sections.forEach(s => s.navLink.classList.remove("active"));
        navLink.classList.add("active");
        activeSet = true;
        break;
      }
    }
    if (!activeSet) sections.forEach(s => s.navLink.classList.remove("active"));
  }

  window.addEventListener("scroll", updateScrollSpy, { passive: true });
}

// ============================================================================
// 7. VIEW SWITCHING & NAVIGATION
// ============================================================================
function showLandingPage() {
  document.body.classList.remove("dashboard-mode");
  const siteNav = document.getElementById("siteNav") || document.querySelector(".site-nav");
  if (siteNav) siteNav.style.display = "flex";
  document.getElementById("landingView").style.display = "block";
  document.getElementById("dashboardView").style.display = "none";
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
}

function showDashboardPage(productId = "consumer-1") {
  CURRENT_PRODUCT_ID = productId;
  document.body.classList.add("dashboard-mode");
  const siteNav = document.getElementById("siteNav") || document.querySelector(".site-nav");
  if (siteNav) siteNav.style.display = "none";
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");
  if (mobileNavDrawer) mobileNavDrawer.classList.remove("open");
  document.getElementById("landingView").style.display = "none";
  document.getElementById("dashboardView").style.display = "block";
  renderDashboard(productId);
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// ============================================================================
// 8. LIVE CAMERA BARCODE SCANNER & SCAN FLOW
// ============================================================================
let codeReader = null;
let currentCameraDeviceId = null;
let isScanningActive = false;

function getCodeReader() {
  if (!codeReader && typeof ZXing !== "undefined" && ZXing.BrowserMultiFormatReader) {
    codeReader = new ZXing.BrowserMultiFormatReader();
  }
  return codeReader;
}

function playScanBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1760, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch (e) {
    // Audio context may require prior interaction; safe to ignore
  }
}

function stopCameraTracks() {
  const videoEl = document.getElementById("scannerVideo");
  if (videoEl && videoEl.srcObject) {
    try {
      const stream = videoEl.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoEl.srcObject = null;
    } catch (e) {
      console.warn("Could not stop camera tracks:", e);
    }
  }
}

function stopCameraScanner() {
  isScanningActive = false;
  try {
    if (codeReader) {
      codeReader.reset();
    }
  } catch (e) {
    console.warn("Could not reset ZXing reader:", e);
  }
  stopCameraTracks();
}

function switchToUploadFallback(reasonText = "") {
  stopCameraScanner();
  const cameraState = document.getElementById("scanCameraState");
  const readyState = document.getElementById("scanReadyState");
  const laserState = document.getElementById("scanActiveLaserState");

  if (cameraState) cameraState.style.display = "none";
  if (laserState) laserState.style.display = "none";
  if (readyState) {
    readyState.style.display = "block";
    if (reasonText) {
      const dropSub = readyState.querySelector(".dropzone-sub");
      if (dropSub) dropSub.textContent = reasonText;
    }
  }
}

async function startCameraScanner() {
  const cameraState = document.getElementById("scanCameraState");
  const readyState = document.getElementById("scanReadyState");
  const laserState = document.getElementById("scanActiveLaserState");
  const videoEl = document.getElementById("scannerVideo");
  const cameraSelect = document.getElementById("cameraSelect");
  const statusLabel = document.getElementById("scanCameraStatusLabel");

  if (!cameraState || !videoEl) return;

  cameraState.style.display = "block";
  if (readyState) readyState.style.display = "none";
  if (laserState) laserState.style.display = "none";

  if (statusLabel) {
    statusLabel.textContent = "INITIALIZING CAMERA...";
    statusLabel.style.color = "rgba(255,255,255,0.85)";
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    switchToUploadFallback("Camera API is not supported in this browser. Please upload a photo below.");
    return;
  }

  const reader = getCodeReader();
  if (!reader) {
    switchToUploadFallback("Barcode reader library loading. Please upload a photo or retry.");
    return;
  }

  try {
    stopCameraTracks();

    let videoDevices = [];
    try {
      videoDevices = await reader.listVideoInputDevices();
    } catch (err) {
      console.warn("Unable to enumerate video devices:", err);
    }

    if (cameraSelect && videoDevices.length > 0) {
      cameraSelect.innerHTML = "";
      videoDevices.forEach((device, index) => {
        const opt = document.createElement("option");
        opt.value = device.deviceId;
        opt.textContent = device.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(opt);
      });

      if (!currentCameraDeviceId) {
        const backCam = videoDevices.find(d => /back|rear|environment|facing\s*back/i.test(d.label));
        currentCameraDeviceId = backCam ? backCam.deviceId : videoDevices[0].deviceId;
      }
      cameraSelect.value = currentCameraDeviceId;
      cameraSelect.style.display = videoDevices.length > 1 ? "block" : "none";
    }

    isScanningActive = true;
    if (statusLabel) {
      statusLabel.textContent = "POINT CAMERA AT BARCODE";
      statusLabel.style.color = "rgba(255,255,255,0.85)";
    }

    reader.decodeFromVideoDevice(currentCameraDeviceId, videoEl, (result, err) => {
      if (!isScanningActive) return;

      if (result) {
        const barcodeText = result.getText().trim();
        if (barcodeText) {
          console.log("Barcode decoded from live camera feed:", barcodeText);
          onBarcodeDetected(barcodeText);
        }
      }
    });

  } catch (err) {
    console.error("Camera access failed:", err);
    switchToUploadFallback("Camera access denied or unavailable: " + (err.message || err.name));
  }
}

function openScannerModal() {
  const modal = document.getElementById("scannerModal");
  if (!modal) return;
  modal.classList.add("open");
  // Default directly to live camera scanning
  startCameraScanner();
}

function closeScannerModal() {
  const modal = document.getElementById("scannerModal");
  if (!modal) return;
  modal.classList.remove("open");
  stopCameraScanner();
}

function executeScanFlow(targetProductId = "consumer-1") {
  stopCameraScanner();
  const modal = document.getElementById("scannerModal");
  if (modal) modal.classList.add("open");

  const cameraState = document.getElementById("scanCameraState");
  const readyState = document.getElementById("scanReadyState");
  const laserState = document.getElementById("scanActiveLaserState");

  if (cameraState) cameraState.style.display = "none";
  if (readyState) readyState.style.display = "none";
  if (laserState) laserState.style.display = "block";

  const ticker = document.getElementById("scanProgressTickerText");
  if (ticker) {
    ticker.textContent = "Analyzing ingredients against nutritional standards...";
  }

  setTimeout(() => {
    closeScannerModal();
    showDashboardPage(targetProductId);
    persistScanToBackend(targetProductId);
  }, 220);
}

async function onBarcodeDetected(barcodeText) {
  isScanningActive = false;
  playScanBeep();

  const statusLabel = document.getElementById("scanCameraStatusLabel");
  if (statusLabel) {
    statusLabel.textContent = `✓ BARCODE DETECTED: ${barcodeText}`;
    statusLabel.style.color = "#40C057";
  }

  stopCameraScanner();

  const cameraState = document.getElementById("scanCameraState");
  const readyState = document.getElementById("scanReadyState");
  const laserState = document.getElementById("scanActiveLaserState");

  if (cameraState) cameraState.style.display = "none";
  if (readyState) readyState.style.display = "none";
  if (laserState) laserState.style.display = "block";

  const ticker = document.getElementById("scanProgressTickerText");
  if (ticker) ticker.textContent = `Barcode detected: ${barcodeText}. Retrieving product and analysis...`;

  try {
    await fetchProductByBarcode(barcodeText);
  } catch (err) {
    console.error("Barcode lookup error:", err);
    if (ticker) {
      ticker.innerHTML = `
        <div style="color:var(--ink-harm); font-weight:700; margin-bottom:8px;">
          Product not found for barcode: ${barcodeText}
        </div>
        <div style="font-size:0.75rem; color:var(--ink-muted); margin-bottom:14px;">
          Could not find this barcode in the database. You can upload an image of the nutrition / ingredients label.
        </div>
        <div style="display:flex; justify-content:center; gap:8px;">
          <button id="btnRetryCameraAfterErr" class="btn-cta-primary" style="font-size:0.75rem; padding:6px 12px;" type="button">
            SCAN AGAIN
          </button>
          <button id="btnSwitchUploadAfterErr" class="btn-cta-secondary" style="font-size:0.75rem; padding:6px 12px;" type="button">
            UPLOAD PHOTO
          </button>
        </div>
      `;
      document.getElementById("btnRetryCameraAfterErr")?.addEventListener("click", () => startCameraScanner());
      document.getElementById("btnSwitchUploadAfterErr")?.addEventListener("click", () => switchToUploadFallback());
    }
  }
}

async function fetchProductByBarcode(barcode) {
  let scanData = null;
  let analysis = null;
  let productData = null;

  // 1. Primary hook: Call PackCheck full scan pipeline (Product + Rule Engine + Jev AI + Alternatives)
  try {
    const scanRes = await fetch("http://localhost:8000/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode: barcode.trim(), device_info: "consumer-browser" })
    });
    if (scanRes.ok) {
      scanData = await scanRes.json();
      productData = scanData.product;
    }
  } catch (err) {
    console.warn("Scan endpoint lookup note:", err);
  }

  // 2. Secondary hook: Retrieve full ingredient classifications if needed
  try {
    const analyzeRes = await fetch(`http://localhost:8000/api/analyze/${encodeURIComponent(barcode.trim())}`, { method: "POST" });
    if (analyzeRes.ok) {
      analysis = await analyzeRes.json();
      if (!productData && analysis) {
        productData = {
          barcode: barcode,
          product: { name: analysis.product_name, category: "Barcode Scan" },
          nutrition: {},
          ingredients: []
        };
      }
    }
  } catch (err) {
    console.warn("Analyze endpoint lookup note:", err);
  }

  // If scan endpoint failed and analyze endpoint failed, try direct products lookup
  if (!scanData && !analysis) {
    try {
      const prodRes = await fetch(`http://localhost:8000/api/products/${encodeURIComponent(barcode.trim())}`);
      if (prodRes.ok) {
        productData = await prodRes.json();
      }
    } catch (_) {}
  }

  if (!scanData && !analysis && !productData) {
    throw new Error(`Product barcode ${barcode} not found.`);
  }

  const dynamicId = "scan-" + barcode;
  registerScannedProduct(dynamicId, barcode, analysis, productData, scanData);

  closeScannerModal();
  showDashboardPage(dynamicId);
  persistScanToBackend(dynamicId);
}

function registerScannedProduct(dynamicId, barcode, analysis, productData, scanData = null) {
  analysis = analysis || {};
  const nutrition = productData?.nutrition || {};
  const prodInfo = productData?.product || {};
  const allergenBreakdown = analysis.allergen_breakdown || productData?.allergen_breakdown || {};

  const HARMFUL_TYPES = ["Sweetener", "Preservative", "Colour", "Caffeine"];
  const GOOD_TYPES    = ["Fiber", "Protein", "Vitamin", "Mineral"];

  function toSubstanceCard(ing) {
    return {
      name:        ing.ingredient_name || ing.raw_name || "Unknown",
      category:    ing.ingredient_type  || "Other",
      qty:         "Per 100g/ml",
      limit:       ing.notes            || "Standard food-grade use",
      status:      HARMFUL_TYPES.includes(ing.ingredient_type) ? "harm" : GOOD_TYPES.includes(ing.ingredient_type) ? "good" : "safe",
      whatIsIt:    ing.description      || "No description available.",
      whyInProduct: ing.common_use      || "Standard food formulation ingredient.",
      whatItDoes:  ing.notes            || "No specific body impact data available."
    };
  }

  const harmfulArr = (analysis.ingredient_analysis || [])
    .filter(i => HARMFUL_TYPES.includes(i.ingredient_type))
    .map(toSubstanceCard);

  const goodArr = (analysis.ingredient_analysis || [])
    .filter(i => GOOD_TYPES.includes(i.ingredient_type))
    .map(toSubstanceCard);

  const safeArr = (analysis.ingredient_analysis || [])
    .filter(i => !HARMFUL_TYPES.includes(i.ingredient_type) && !GOOD_TYPES.includes(i.ingredient_type))
    .map(toSubstanceCard);

  // Compute CleanScore from nutrition analysis & harmful ingredients
  const nutrAnalysis = analysis.nutrition_analysis || {};
  let score = 100;
  if (nutrAnalysis.sugar?.level === "high") score -= 20;
  if (nutrAnalysis.sugar?.level === "moderate") score -= 10;
  if (nutrAnalysis.sodium?.level === "high") score -= 15;
  if (nutrAnalysis.saturated_fat?.level === "high") score -= 15;
  if (nutrAnalysis.trans_fat?.level === "high") score -= 20;
  if (nutrAnalysis.protein?.level === "high") score += 5;
  if (nutrAnalysis.fiber?.level === "high" || nutrAnalysis.fiber?.level === "source") score += 5;

  // Penalize harmful additives (sweeteners, artificial colors, preservatives, caffeine)
  if (harmfulArr.length > 0) {
    score -= Math.min(25, harmfulArr.length * 5);
  }

  score = Math.max(10, Math.min(100, Math.round(score)));

  // Extract structured intelligence from Rule Engine & Jev AI
  const ruleData = scanData?.nutrition_analysis || analysis?.rule_engine_analysis || {};
  const finalScore = (ruleData.score != null) ? ruleData.score : score;
  const jevData = scanData?.jev_evaluation || analysis?.jev_evaluation || null;

  const grade   = finalScore >= 75 ? "Grade A" : finalScore >= 55 ? "Grade B" : finalScore >= 40 ? "Grade C" : "Grade D";
  const status  = finalScore >= 75 ? "safe" : finalScore >= 40 ? "warn" : "harm";
  const verdict = finalScore >= 75 ? "Clean formulation — low concern markers."
                : finalScore >= 40 ? "Moderate concern — monitor intake."
                : "High concern — significant limit markers detected.";

  // Determine actual product name
  const productName = (analysis.product_name && analysis.product_name !== "Unknown Product")
    ? analysis.product_name
    : (prodInfo.name && prodInfo.name !== "Unknown Product")
      ? prodInfo.name
      : `Scanned Barcode ${barcode}`;

  const brandName = prodInfo.brand || "";
  const imageUrl = prodInfo.image || "";

  // Map recommendations to swaps
  const rawRecs = scanData?.recommendations || [];
  const swapsList = rawRecs.map(r => ({
    name: r.product_name || r.name || "Healthy Alternative",
    reason: r.comparison_summary || r.reason || "Healthier nutrient profile within same category",
    score: r.cleanscore || 85
  }));

  PRODUCTS_DB[dynamicId] = {
    id: dynamicId,
    name: productName,
    brand: brandName,
    category: prodInfo.category || (barcode ? "Barcode Scan" : "OCR Label Scan"),
    servingSize: "Per 100g/ml",
    status: status,
    verdict: verdict,
    cleanScore: finalScore,
    grade: grade,
    visualSvg: imageUrl
      ? `<img src="${imageUrl}" alt="${productName}" style="max-height:140px;max-width:100%;object-fit:contain;margin:auto;display:block;">`
      : `<div style="font-size:3.5rem;text-align:center;padding:24px;line-height:1;">📦<br><span style="font-size:0.7rem;font-family:monospace;color:#666;">${barcode || "SCAN"}</span></div>`,
    harmful: harmfulArr,
    safe:    safeArr,
    good:    goodArr,
    bodyImpact: [
      { label: "Sugar Load",  verdict: nutrAnalysis.sugar?.level    || "low",  val: Math.min(100, Math.round(((nutrition.sugars != null ? nutrition.sugars : nutrAnalysis.sugar?.value) || 0) * 4)),   status: nutrAnalysis.sugar?.level    === "high" ? "harm" : "safe", text: nutrAnalysis.sugar?.message    || "" },
      { label: "Sodium",      verdict: nutrAnalysis.sodium?.level   || "low",  val: Math.min(100, Math.round(((nutrition.sodium != null ? nutrition.sodium : (nutrAnalysis.sodium?.value ? nutrAnalysis.sodium.value / 1000 : 0)) || 0) * 500)), status: nutrAnalysis.sodium?.level   === "high" ? "harm" : "warn", text: nutrAnalysis.sodium?.message   || "" },
      { label: "Protein",     verdict: nutrAnalysis.protein?.level  || "low",  val: Math.min(100, Math.round(((nutrition.protein != null ? nutrition.protein : nutrAnalysis.protein?.value) || 0) * 5)),   status: nutrAnalysis.protein?.level  === "high" ? "good" : "safe", text: nutrAnalysis.protein?.message  || "" }
    ],
    allergens: allergenBreakdown.contains || [],
    swaps: swapsList.length > 0 ? swapsList : (PRODUCTS_DB["consumer-1"]?.swaps || []),
    metrology: null,
    jev_evaluation: jevData,
    packcheck_flags: ruleData.flags || [],
    positive_flags: ruleData.positive_flags || [],
    nutrition_summary: ruleData.nutrition_summary || {}
  };
}

// ============================================================================
// 9. RESULTS DASHBOARD RENDERING & HEALTH STAR RATING
// ============================================================================
function renderHealthStars(score) {
  // Convert 0-100 score into a 0.5 - 5.0 star scale rounded to nearest half-star
  const rawScore = typeof score === "number" ? score : 50;
  const starScore = Math.max(0.5, Math.min(5, Math.round((rawScore / 20) * 2) / 2));
  const starsNum = document.getElementById("dashStarsNum");
  const starsRow = document.getElementById("dashStarsRow");

  if (starsNum) {
    starsNum.textContent = starScore.toFixed(1);
  }

  if (starsRow) {
    let starsHtml = "";
    const uniqueToken = Date.now().toString(36);
    for (let i = 1; i <= 5; i++) {
      if (starScore >= i) {
        // Full Star (Vibrant Gold)
        starsHtml += `
          <svg class="health-star star-full" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="#F59F00" stroke="#111110" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>`;
      } else if (starScore >= i - 0.5) {
        // Half Star (50% Gold / 50% Neutral)
        const gradId = `starGrad_${uniqueToken}_${i}`;
        starsHtml += `
          <svg class="health-star star-half" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <defs>
              <linearGradient id="${gradId}">
                <stop offset="50%" stop-color="#F59F00"/>
                <stop offset="50%" stop-color="#E9ECEF"/>
              </linearGradient>
            </defs>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="url(#${gradId})" stroke="#111110" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>`;
      } else {
        // Empty Star (Neutral Muted)
        starsHtml += `
          <svg class="health-star star-empty" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>`;
      }
    }
    starsRow.innerHTML = starsHtml;
  }
}

// ============================================================================
// 9B. JEV AI PRODUCT ASSESSMENT RENDERING
// ============================================================================
function renderJevAssessment(prod) {
  const badgeEl = document.getElementById("jevProfileBadge");
  const scorePill = document.getElementById("jevPackCheckScorePill");
  const flagsContainer = document.getElementById("jevFlagsContainer");
  const nutritionSummaryEl = document.getElementById("jevNutritionSummary");
  const statusBadge = document.getElementById("jevStatusBadge");
  const sugarLevelEl = document.getElementById("jevSugarLevel");
  const sodiumLevelEl = document.getElementById("jevSodiumLevel");
  const reasonsList = document.getElementById("jevReasonsList");
  const disclaimerEl = document.getElementById("jevDisclaimerText");

  if (!badgeEl) return;

  const jev = prod.jev_evaluation || {};
  const isAvailable = jev.available !== false;
  const inferredProfile = prod.cleanScore >= 70 ? "HEALTHY" : prod.cleanScore >= 50 ? "MODERATE" : "LIMIT";
  const profile = (jev.overall_profile || inferredProfile).toUpperCase();

  // 1. Overall Profile Badge
  if (!isAvailable) {
    badgeEl.textContent = "UNAVAILABLE";
    badgeEl.className = "jev-profile-badge profile-unavailable";
    if (statusBadge) {
      statusBadge.textContent = "AI OFFLINE";
      statusBadge.style.color = "var(--ink-muted)";
      statusBadge.style.borderColor = "var(--ink-muted)";
      statusBadge.style.background = "#F1F3F5";
    }
  } else {
    badgeEl.textContent = profile;
    badgeEl.className = `jev-profile-badge profile-${profile.toLowerCase()}`;
    if (statusBadge) {
      statusBadge.textContent = "ACTIVE";
      statusBadge.style.color = "#2B8A3E";
      statusBadge.style.borderColor = "#2B8A3E";
      statusBadge.style.background = "#EBFBEE";
    }
  }

  // 2. PackCheck Nutrition Score
  if (scorePill) {
    scorePill.textContent = `SCORE: ${prod.cleanScore || 50}/100`;
  }

  // 3. Structured Flags (Warning & Positive)
  const warnFlags = (prod.packcheck_flags && prod.packcheck_flags.length > 0)
    ? prod.packcheck_flags
    : (prod.status === "harm" ? ["HIGH_SUGAR"] : []);

  const posFlags = (prod.positive_flags && prod.positive_flags.length > 0)
    ? prod.positive_flags
    : (prod.cleanScore >= 60 ? ["LOW_SODIUM", "CONTAINS_PROTEIN"] : ["LOW_SODIUM"]);

  const flagLabels = {
    "HIGH_SUGAR": "⚠ High Sugar",
    "HIGH_SODIUM": "⚠ High Sodium",
    "HIGH_SATURATED_FAT": "⚠ High Saturated Fat",
    "HIGH_FAT": "⚠ High Fat",
    "LOW_PROTEIN": "⚠ Low Protein",
    "HIGH_CALORIES": "⚠ High Energy Density",
    "ALLERGEN_PRESENT": "⚠ Allergens Present",
    "ADDITIVE_PRESENT": "⚠ Additives Present",
    "LOW_SUGAR": "✓ Low Sugar",
    "LOW_SODIUM": "✓ Low Sodium",
    "LOW_SATURATED_FAT": "✓ Low Saturated Fat",
    "CONTAINS_PROTEIN": "✓ Contains Protein",
    "CONTAINS_FIBER": "✓ Source of Fiber"
  };

  if (flagsContainer) {
    let flagsHtml = "";
    warnFlags.forEach(f => {
      flagsHtml += `<div class="jev-flag-pill jev-flag-warn">${flagLabels[f] || ("⚠ " + f.replace(/_/g, " "))}</div>`;
    });
    posFlags.forEach(f => {
      flagsHtml += `<div class="jev-flag-pill jev-flag-good">${flagLabels[f] || ("✓ " + f.replace(/_/g, " "))}</div>`;
    });
    if (!flagsHtml) {
      flagsHtml = `<div class="jev-flag-pill jev-flag-good">✓ Balanced Nutritional Profile</div>`;
    }
    flagsContainer.innerHTML = flagsHtml;
  }

  // 4. Nutrition Summary Bar
  if (nutritionSummaryEl) {
    const summary = prod.nutrition_summary || {};
    const sugarVal = summary.sugar != null ? summary.sugar : (prod.bodyImpact?.[0]?.val ? (prod.bodyImpact[0].val / 4).toFixed(0) : "27");
    const sodVal = summary.sodium != null ? summary.sodium : (prod.bodyImpact?.[1]?.val ? (prod.bodyImpact[1].val * 2).toFixed(0) : "42");
    const protVal = summary.protein != null ? summary.protein : "2.0";
    const fatVal = summary.fat != null ? summary.fat : "0.2";

    nutritionSummaryEl.innerHTML = `
      <span><strong>Sugar:</strong> ${sugarVal}g</span>
      <span><strong>Sodium:</strong> ${sodVal}mg</span>
      <span><strong>Protein:</strong> ${protVal}g</span>
      <span><strong>Fat:</strong> ${fatVal}g</span>
    `;
  }

  // 5. Sugar & Sodium Levels
  const sugarLvl = (jev.sugar_level || (warnFlags.includes("HIGH_SUGAR") ? "HIGH" : "MODERATE")).toUpperCase();
  const sodiumLvl = (jev.sodium_level || (warnFlags.includes("HIGH_SODIUM") ? "HIGH" : "LOW")).toUpperCase();

  if (sugarLevelEl) {
    sugarLevelEl.textContent = sugarLvl;
    sugarLevelEl.style.color = sugarLvl === "HIGH" ? "var(--ink-harm)" : sugarLvl === "LOW" ? "var(--ink-good)" : "var(--ink-warn)";
  }
  if (sodiumLevelEl) {
    sodiumLevelEl.textContent = sodiumLvl;
    sodiumLevelEl.style.color = sodiumLvl === "HIGH" ? "var(--ink-harm)" : sodiumLvl === "LOW" ? "var(--ink-good)" : "var(--ink-warn)";
  }

  // 6. Reasons List (WHY?)
  if (reasonsList) {
    const explanations = (jev.explanation && jev.explanation.length > 0)
      ? jev.explanation
      : warnFlags.length > 0
        ? warnFlags.map(f => flagLabels[f] ? flagLabels[f].replace(/[⚠✓]/g, '').trim() + " content detected" : f)
        : ["Nutritional parameters within reference standard thresholds", "Balanced nutrient and energy distribution"];

    reasonsList.innerHTML = explanations.map(txt => `<li>${txt}</li>`).join("");
  }

  // 7. Disclaimer
  if (disclaimerEl) {
    disclaimerEl.textContent = jev.disclaimer || "Jev AI classification is based strictly on PackCheck's factual nutritional parameters. For dietary guidance only; not medical advice or diagnosis.";
  }
}

function renderDashboard(productId) {
  const prod = PRODUCTS_DB[productId] || PRODUCTS_DB["consumer-1"];

  // 1. Titles & Thumbnail
  document.getElementById("dashProductTitle").textContent = prod.name;
  document.getElementById("dashProductCategory").textContent = prod.category;
  document.getElementById("dashProductServing").textContent = prod.servingSize;
  document.getElementById("dashProductVisual").innerHTML = prod.visualSvg;

  // 2. Verdict Banner
  const verdictBanner = document.getElementById("dashVerdictBanner");
  const verdictText = document.getElementById("dashVerdictText");
  verdictText.textContent = prod.verdict;

  verdictBanner.className = "health-verdict-banner";
  if (prod.status === "harm") {
    verdictBanner.classList.add("verdict-banner-harm");
  } else if (prod.status === "safe") {
    verdictBanner.classList.add("verdict-banner-safe");
  } else {
    verdictBanner.classList.add("verdict-banner-warn");
  }

  // 3. CleanScore Progress Gauge & Health Star Rating
  const scoreNum = document.getElementById("dashScoreNum");
  const gradeBadge = document.getElementById("dashScoreGradeBadge");
  const radialProgress = document.getElementById("radialProgress");

  scoreNum.textContent = prod.cleanScore;
  gradeBadge.textContent = prod.grade;

  gradeBadge.className = "score-grade-badge";
  if (prod.cleanScore >= 75) {
    gradeBadge.classList.add("score-good");
    radialProgress.setAttribute("stroke", "#2B8A3E");
  } else if (prod.cleanScore >= 50) {
    gradeBadge.classList.add("score-warn");
    radialProgress.setAttribute("stroke", "#D9480F");
  } else {
    gradeBadge.classList.add("score-harmful");
    radialProgress.setAttribute("stroke", "#C92A2A");
  }

  const circumference = 251.2;
  const offset = circumference - (prod.cleanScore / 100) * circumference;
  radialProgress.style.strokeDashoffset = offset;

  // Render 5-Star Health Rating
  renderHealthStars(prod.cleanScore);

  // 4. Pillars Count
  const countHarm = prod.harmful.length;
  const countSafe = prod.safe.length;
  const countGood = prod.good.length;
  const countTotal = countHarm + countSafe + countGood;

  document.getElementById("countHarmful").textContent = countHarm;
  document.getElementById("countSafe").textContent = countSafe;
  document.getElementById("countGood").textContent = countGood;

  document.getElementById("tabCountAll").textContent = countTotal;
  document.getElementById("tabCountHarmful").textContent = countHarm;
  document.getElementById("tabCountSafe").textContent = countSafe;
  document.getElementById("tabCountGood").textContent = countGood;

  // 5. Render Lists & Jev Assessment
  renderSubstanceCards(prod, ACTIVE_FILTER);
  renderBodyMeters(prod.bodyImpact);
  renderSwaps(prod.swaps);
  renderJevAssessment(prod);

  // 6. Metrology Drawer & 8-Point Consumer Dossier
  if (prod.metrology) {
    const metroNumEl = document.getElementById("metroNumeral");
    const metroMrpEl = document.getElementById("metroMrp");
    const metroFssaiEl = document.getElementById("metroFssai");
    if (metroNumEl) metroNumEl.textContent = prod.metrology.numeral;
    if (metroMrpEl) metroMrpEl.textContent = prod.metrology.mrp;
    if (metroFssaiEl) metroFssaiEl.textContent = prod.metrology.fssai;
  }
  renderConsumerDossier(prod);
}

function renderConsumerDossier(prod) {
  const dossier = (typeof DOSSIER_DATA !== "undefined" && DOSSIER_DATA[prod.id]) ? DOSSIER_DATA[prod.id] : null;
  if (!dossier) return;

  // Header overall status pill
  const overallPill = document.getElementById("dossierOverallStatus");
  if (overallPill) {
    const summary = dossier.inspectionSummary.consumer;
    overallPill.textContent = summary.auditBadge || "AUDITED";
    overallPill.className = `dossier-summary-pill mono ${summary.badgeClass || 'status-warn'}`;
  }

  // 1. Product Information
  const cdBodyProdInfo = document.getElementById("cdBodyProdInfo");
  if (cdBodyProdInfo && dossier.productInfo) {
    cdBodyProdInfo.innerHTML = dossier.productInfo.consumer.map(item => `
      <div class="dossier-kv-row">
        <span class="dossier-kv-label">${item.label}:</span>
        <span class="dossier-kv-value">${item.value}</span>
      </div>
    `).join("");
  }

  // 2. Inspection Summary
  const cdBodyInspSummary = document.getElementById("cdBodyInspSummary");
  const cdBadgeInspSummary = document.getElementById("cdBadgeInspSummary");
  if (cdBodyInspSummary && dossier.inspectionSummary) {
    const summary = dossier.inspectionSummary.consumer;
    if (cdBadgeInspSummary) {
      cdBadgeInspSummary.textContent = summary.grade.toUpperCase();
      cdBadgeInspSummary.className = `dossier-badge-pill ${summary.badgeClass === 'status-safe' ? 'dossier-badge-pass' : summary.badgeClass === 'status-warn' ? 'dossier-badge-warn' : 'dossier-badge-harm'}`;
    }
    cdBodyInspSummary.innerHTML = `
      <div style="font-weight:700; color:var(--ink); margin-bottom:4px; font-size:0.82rem; line-height:1.4;">${summary.verdictText}</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
        ${summary.stats.map(s => `
          <div style="background:rgba(0,0,0,0.03); border:1px solid rgba(17,17,16,0.15); padding:5px 7px;">
            <div style="font-size:0.65rem; color:var(--ink-muted); font-weight:700;">${s.label.toUpperCase()}</div>
            <div style="font-size:0.8rem; font-weight:800; color:${s.status === 'good' || s.status === 'safe' ? 'var(--ink-good)' : 'var(--ink-harm)'};">${s.value}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // 3. Detected Declarations
  const cdBodyDetected = document.getElementById("cdBodyDetected");
  if (cdBodyDetected && dossier.detectedDeclarations) {
    cdBodyDetected.innerHTML = dossier.detectedDeclarations.consumer.map(d => `
      <div class="dossier-claim-box">
        <div style="font-weight:800; font-size:0.7rem; color:var(--ink-muted); text-transform:uppercase;">${d.claim}</div>
        <div style="font-weight:600; color:var(--ink); margin-top:2px;">${d.text}</div>
      </div>
    `).join("");
  }

  // 4. Legal Metrology Checks
  const cdBodyMetrology = document.getElementById("cdBodyMetrology");
  if (cdBodyMetrology && dossier.legalMetrology) {
    cdBodyMetrology.innerHTML = dossier.legalMetrology.consumer.map(m => `
      <div style="display:flex; align-items:flex-start; gap:8px; border-bottom:1px dashed rgba(17,17,16,0.2); padding-bottom:5px;">
        <span class="dossier-badge-pill ${m.status === 'pass' ? 'dossier-badge-pass' : 'dossier-badge-warn'}" style="flex-shrink:0;">
          ${m.status === 'pass' ? '✓ PASS' : '⚠ WARN'}
        </span>
        <div>
          <div style="font-weight:800; font-size:0.76rem;">${m.check}</div>
          <div style="font-size:0.73rem; color:var(--ink-muted); line-height:1.35;">${m.detail}</div>
        </div>
      </div>
    `).join("");
  }

  // 5. FSSAI Checks
  const cdBodyFssai = document.getElementById("cdBodyFssai");
  if (cdBodyFssai && dossier.fssaiChecks) {
    cdBodyFssai.innerHTML = dossier.fssaiChecks.consumer.map(f => `
      <div style="display:flex; align-items:flex-start; gap:8px; border-bottom:1px dashed rgba(17,17,16,0.2); padding-bottom:5px;">
        <span class="dossier-badge-pill ${f.status === 'pass' ? 'dossier-badge-pass' : 'dossier-badge-warn'}" style="flex-shrink:0;">
          ${f.status === 'pass' ? '✓ VERIFIED' : '⚠ NOTICE'}
        </span>
        <div>
          <div style="font-weight:800; font-size:0.76rem;">${f.check}</div>
          <div style="font-size:0.73rem; color:var(--ink-muted); line-height:1.35;">${f.detail}</div>
        </div>
      </div>
    `).join("");
  }

  // 6. Issues & Alerts
  const cdBodyIssues = document.getElementById("cdBodyIssues");
  if (cdBodyIssues && dossier.issuesAndAlerts) {
    cdBodyIssues.innerHTML = dossier.issuesAndAlerts.consumer.map(a => `
      <div class="dossier-alert-tag ${a.type}">
        <div style="font-weight:900; font-size:0.73rem; text-transform:uppercase; margin-bottom:2px;">
          ${a.type === 'critical' ? '🔴 CRITICAL ALERT' : a.type === 'warning' ? '⚠️ CAUTION' : '🔵 SAFE ATTRIBUTE'}: ${a.title}
        </div>
        <div>${a.text}</div>
      </div>
    `).join("");
  }

  // 7. Evidence + Rule Reference
  const cdBodyEvidence = document.getElementById("cdBodyEvidence");
  if (cdBodyEvidence && dossier.evidenceAndRules) {
    cdBodyEvidence.innerHTML = dossier.evidenceAndRules.consumer.map(e => `
      <div style="padding:5px 0; border-bottom:1px dashed rgba(17,17,16,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
          <span style="font-weight:800; font-size:0.75rem; color:var(--ink);">${e.authority}</span>
          <span class="mono" style="font-size:0.66rem; color:var(--ink-muted); background:rgba(0,0,0,0.05); padding:1px 5px;">${e.rule}</span>
        </div>
        <div style="font-size:0.73rem; color:var(--ink); margin-top:3px; line-height:1.35;">${e.text}</div>
      </div>
    `).join("");
  }

  // 8. Inspector Verification + Report
  const cdBodyVerification = document.getElementById("cdBodyVerification");
  if (cdBodyVerification && dossier.inspectorVerification) {
    const v = dossier.inspectorVerification.consumer;
    cdBodyVerification.innerHTML = `
      <div class="dossier-cert-box">
        <div>
          <div style="font-weight:900; font-size:0.78rem; letter-spacing:0.04em;">${v.certifiedSeal}</div>
          <div style="font-size:0.7rem; color:var(--ink-muted); margin-top:2px;">AUDIT ID: ${v.reportId} · ${v.date}</div>
        </div>
        <span class="dossier-badge-pill ${v.status === 'PASSED' ? 'dossier-badge-pass' : 'dossier-badge-harm'}">
          ${v.status}
        </span>
      </div>
      <div class="dossier-kv-row" style="margin-top:6px;">
        <span class="dossier-kv-label">Auditing Body:</span>
        <span class="dossier-kv-value">${v.authority}</span>
      </div>
      <div class="dossier-kv-row">
        <span class="dossier-kv-label">Auditor ID:</span>
        <span class="dossier-kv-value mono">${v.inspectorId}</span>
      </div>
      <div style="margin-top:6px; font-size:0.73rem; line-height:1.35; background:rgba(0,0,0,0.02); padding:6px; border-left:2px solid var(--ink);">
        <strong>Official Notes:</strong> ${v.notes}
      </div>
    `;
  }
}

function renderSubstanceCards(prod, filter = "all", searchQuery = "") {
  const container = document.getElementById("substanceCardsContainer");
  container.innerHTML = "";

  let list = [];
  if (filter === "all") {
    list = [
      ...prod.harmful.map(item => ({ ...item, pillar: "harmful" })),
      ...prod.safe.map(item => ({ ...item, pillar: "safe" })),
      ...prod.good.map(item => ({ ...item, pillar: "good" }))
    ];
  } else if (filter === "harmful") {
    list = prod.harmful.map(item => ({ ...item, pillar: "harmful" }));
  } else if (filter === "safe") {
    list = prod.safe.map(item => ({ ...item, pillar: "safe" }));
  } else if (filter === "good") {
    list = prod.good.map(item => ({ ...item, pillar: "good" }));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q) ||
      item.whatIsIt.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px; text-align: center; font-family: var(--font-mono); color: var(--ink-muted);">
        [ NO SUBSTANCES MATCH CURRENT SELECTION ]
      </div>
    `;
    return;
  }

  list.forEach((sub, idx) => {
    const card = document.createElement("div");
    card.className = "substance-card";
    card.id = `subCard-${idx}`;

    let stampClass = "";
    let stampText = "";
    if (sub.pillar === "harmful") {
      stampClass = "stamp-harm";
      stampText = "🔴 HARMFUL";
    } else if (sub.pillar === "safe") {
      stampClass = "stamp-safe";
      stampText = "🔵 SAFE";
    } else {
      stampClass = "stamp-good";
      stampText = "🟢 GOOD";
    }

    card.innerHTML = `
      <div class="substance-card-main">
        <div class="substance-left-info">
          <span class="status-stamp ${stampClass}">${stampText}</span>
          <div>
            <div class="substance-name">${sub.name}</div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--ink-muted);">${sub.category}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="text-align: right;">
            <div class="substance-qty-val">${sub.qty}</div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--ink-muted);">${sub.limit}</div>
          </div>
          <span class="mono" style="font-size: 1.1rem; font-weight: 700;">+</span>
        </div>
      </div>

      <div class="substance-drawer">
        <div class="drawer-grid">
          <div class="drawer-column">
            <div class="drawer-col-title">[ WHAT IS IT ]</div>
            <div class="drawer-col-text">${sub.whatIsIt}</div>
          </div>
          <div class="drawer-column">
            <div class="drawer-col-title">[ WHY IN PRODUCT ]</div>
            <div class="drawer-col-text">${sub.whyInProduct}</div>
          </div>
          <div class="drawer-column">
            <div class="drawer-col-title">[ WHAT IT DOES TO BODY ]</div>
            <div class="drawer-col-text" style="font-weight: 600;">${sub.whatItDoes}</div>
          </div>
        </div>
      </div>
    `;

    card.querySelector(".substance-card-main").addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    container.appendChild(card);
  });
}

function renderBodyMeters(meters = []) {
  const container = document.getElementById("bodyMetersContainer");
  container.innerHTML = "";

  meters.forEach(m => {
    const row = document.createElement("div");
    row.className = "body-meter-row";

    let barClass = "meter-bar-safe";
    if (m.status === "harm") barClass = "meter-bar-harm";
    else if (m.status === "warn") barClass = "meter-bar-warn";
    else if (m.status === "good") barClass = "meter-bar-good";

    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700;">
        <span>${m.label}: <span style="font-weight: 400; color: var(--ink-muted);">${m.text}</span></span>
        <span>[ ${m.verdict} ]</span>
      </div>
      <div class="meter-track">
        <div class="meter-bar ${barClass}" style="width: ${m.val}%;"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderSwaps(swaps = []) {
  const container = document.getElementById("swapsContainer");
  container.innerHTML = "";

  swaps.forEach(s => {
    const card = document.createElement("div");
    card.className = "swap-item-card";
    card.innerHTML = `
      <div>
        <div style="font-family: var(--font-display); font-size: 1rem; font-weight: 800;">${s.name}</div>
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--ink-muted);">${s.reason}</div>
      </div>
      <div class="swap-score-pill">${s.score}</div>
    `;
    container.appendChild(card);
  });
}

// ============================================================================
// 10. COMPARISON MODAL
// ============================================================================
function openCompareModal() {
  const modal = document.getElementById("compareModal");
  const grid = document.getElementById("compareGrid");
  modal.classList.add("open");

  const prodA = PRODUCTS_DB[CURRENT_PRODUCT_ID] || PRODUCTS_DB["consumer-1"];
  const prodB = PRODUCTS_DB[CURRENT_PRODUCT_ID === "consumer-1" ? "consumer-2" : "consumer-1"];

  grid.innerHTML = `
    <div style="background: var(--paper-bg); border: var(--rule-med); padding: 14px; box-shadow: 3px 3px 0 var(--ink);">
      <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--ink-muted);">CURRENT AUDIT</div>
      <h3 style="font-size: 1.15rem; margin: 4px 0 10px;">${prodA.shortName || prodA.name}</h3>
      <div class="mono" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
        <div>CLEANSCORE: <strong>${prodA.cleanScore} / 100</strong></div>
        <div style="color: #E67700; font-weight: 800;">HEALTH RATING: <strong>${(Math.max(0.5, Math.min(5, Math.round((prodA.cleanScore / 20) * 2) / 2))).toFixed(1)} / 5 ★</strong></div>
        <div style="color: var(--ink-harm);">HARMFUL: ${prodA.harmful.length}</div>
        <div style="color: var(--ink-safe);">SAFE: ${prodA.safe.length}</div>
        <div style="color: var(--ink-good);">GOOD: ${prodA.good.length}</div>
      </div>
    </div>

    <div style="background: var(--paper-bg); border: var(--rule-med); padding: 14px; box-shadow: 3px 3px 0 var(--ink);">
      <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--ink-muted);">BENCHMARK ALTERNATIVE</div>
      <h3 style="font-size: 1.15rem; margin: 4px 0 10px;">${prodB.shortName || prodB.name}</h3>
      <div class="mono" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
        <div>CLEANSCORE: <strong>${prodB.cleanScore} / 100</strong></div>
        <div style="color: #E67700; font-weight: 800;">HEALTH RATING: <strong>${(Math.max(0.5, Math.min(5, Math.round((prodB.cleanScore / 20) * 2) / 2))).toFixed(1)} / 5 ★</strong></div>
        <div style="color: var(--ink-harm);">HARMFUL: ${prodB.harmful.length}</div>
        <div style="color: var(--ink-safe);">SAFE: ${prodB.safe.length}</div>
        <div style="color: var(--ink-good);">GOOD: ${prodB.good.length}</div>
      </div>
    </div>
  `;
}

function closeCompareModal() {
  document.getElementById("compareModal").classList.remove("open");
}

// ============================================================================
// 10B. SAVED SCAN HISTORY MODAL (MY SCANS)
// ============================================================================
async function openScansModal() {
  const modal = document.getElementById("scansModal");
  if (!modal) return;
  modal.classList.add("open");
  const listEl = document.getElementById("scansModalList");
  listEl.innerHTML = '<div style="text-align: center; color: var(--ink-muted); font-family: var(--font-mono); padding: 24px;">Fetching your saved scans...</div>';

  try {
    const res = await fetch('/api/scans', { credentials: 'include' });
    if (!res.ok) {
      listEl.innerHTML = `
        <div style="padding: 24px; text-align: center; font-family: var(--font-mono); color: var(--ink-muted);">
          <div style="font-weight: 700; color: var(--ink); margin-bottom: 8px;">SYNC HISTORY VIA ACCOUNT</div>
          <div style="font-size: 0.8rem; margin-bottom: 14px;">Sign in to sync your personal scan history and access it across devices.</div>
          <a href="login.html" class="btn-cta-primary" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; padding: 6px 14px; font-size: 0.78rem;">
            <span>SIGN IN NOW</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      `;
      return;
    }

    const data = await res.json();
    if (!data.scans || data.scans.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 24px; text-align: center; font-family: var(--font-mono); color: var(--ink-muted);">
          [ NO SAVED SCANS RECORDED YET ]<br>
          <span style="font-size: 0.78rem;">Scan any product package to automatically save results.</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    data.scans.forEach(item => {
      let nutr = {};
      try {
        nutr = typeof item.nutrition_data === 'string' ? JSON.parse(item.nutrition_data) : (item.nutrition_data || {});
      } catch(_) {}

      const card = document.createElement('div');
      card.className = 'saved-scan-row';
      card.style.cssText = 'background: var(--paper-surface); border: var(--border-med); padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 2px 2px 0 var(--ink);';

      const dateStr = item.scanned_at ? new Date(item.scanned_at).toLocaleString() : 'Recent';
      const score = nutr.cleanScore !== undefined ? `${nutr.cleanScore}/100` : 'Recorded';

      card.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
          <strong style="font-family: var(--font-display); font-size: 1rem; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.product_name}</strong>
          <span class="mono" style="font-size: 0.72rem; color: var(--ink-muted);">${dateStr} · CleanScore: <strong>${score}</strong></span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <button class="btn-cta-secondary mono btn-delete-scan" data-id="${item.id}" type="button" style="padding: 5px 10px; font-size: 0.72rem; color: var(--ink-harm); border-color: var(--ink-harm); box-shadow: 2px 2px 0 var(--ink);" aria-label="Delete scan">
            DELETE ✕
          </button>
        </div>
      `;
      listEl.appendChild(card);
    });

    listEl.querySelectorAll('.btn-delete-scan').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        btn.textContent = 'DELETING...';
        try {
          const delRes = await fetch(`/api/scans/${id}`, { method: 'DELETE', credentials: 'include' });
          if (delRes.ok) {
            openScansModal();
          }
        } catch(_) {
          btn.textContent = 'ERROR';
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--ink-harm); font-family: var(--font-mono);">Could not load scans. Backend may be offline.</div>';
  }
}

function closeScansModal() {
  const modal = document.getElementById("scansModal");
  if (modal) modal.classList.remove("open");
}

function persistScanToBackend(productId) {
  try {
    const prod = PRODUCTS_DB[productId] || PRODUCTS_DB["consumer-1"];
    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        product_name: prod.name,
        nutrition_data: { cleanScore: prod.cleanScore, grade: prod.grade, status: prod.status, servingSize: prod.servingSize },
        ingredients_data: { harmful: prod.harmful, safe: prod.safe, good: prod.good },
        claims_data: { verdict: prod.verdict }
      })
    }).then(r => r.json()).then(data => {
      console.log('[PackCheck DB Sync] Scan saved to MySQL:', data);
    }).catch(err => {
      console.warn('[PackCheck DB Sync] Offline or demo mode:', err);
    });
  } catch (_) {}
}

// ============================================================================
// 10. SMOOTH SCROLL & SCROLLTRIGGER SECTION ANIMATIONS
// ============================================================================
let lenis = null;

function initSmoothScroll() {
  if (typeof Lenis !== "undefined") {
    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    } catch (err) {
      console.warn("Lenis init fallback:", err);
    }
  }

  // Smooth scroll click listeners for all in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: -70 });
          } else {
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    });
  });
}

// Ingredient Spotlight Database for Stage 07 (Plain English for Everyday Shoppers)
const INGREDIENT_SPOTLIGHT_DATA = [
  {
    stamp: "SAFE (JUST WATER)",
    stampClass: "stamp-good",
    title: "CARBONATED WATER",
    what: "Clean drinking water with bubbles and fizz.",
    why: "Makes the drink refreshing and bubbly.",
    health: "Completely healthy. Zero sugar, zero calories, just normal water."
  },
  {
    stamp: "UNHEALTHY (7 SPOONS)",
    stampClass: "stamp-harm",
    title: "CANE SUGAR",
    what: "White table sugar (27 grams — equal to 7 whole teaspoons in 1 can).",
    why: "Makes the drink taste very sweet and masks the chemical taste.",
    health: "More than a full day's limit. Causes rapid weight gain, energy crashes, and tooth decay."
  },
  {
    stamp: "SOUR TASTE (WATCH TEETH)",
    stampClass: "stamp-safe",
    title: "CITRIC ACID (SOUR ACID)",
    what: "A sour food acid (the same sour taste found naturally in lemons).",
    why: "Adds a sharp tangy flavor and helps the can stay fresh on store shelves.",
    health: "Safe for your body, but drinking too much can wear down your teeth over time."
  },
  {
    stamp: "CAFFEINE (1 CUP COFFEE)",
    stampClass: "stamp-safe",
    title: "CAFFEINE BOOST",
    what: "The same wake-up booster found in a cup of black coffee (75mg).",
    why: "Temporarily tricks your brain into feeling awake and energetic.",
    health: "Safe in moderation. Drinking too much can cause jitters, fast heart rate, or poor sleep."
  },
  {
    stamp: "ENERGY ADDITIVE",
    stampClass: "stamp-safe",
    title: "TAURINE",
    what: "A natural building block found in meat, fish, and your own body.",
    why: "Added to energy drinks to make them look like athletic sports formulas.",
    health: "Safe at this amount. Your body naturally flushes out whatever it does not need."
  },
  {
    stamp: "SHELF CHEMICAL",
    stampClass: "stamp-harm",
    title: "PRESERVATIVE (SODIUM BENZOATE)",
    what: "A chemical used to prevent mold and bacteria from growing in the can.",
    why: "Lets cans sit in grocery warehouses for over 2 years without going bad.",
    health: "Can irritate sensitive stomachs. Best to avoid consuming daily in large amounts."
  }
];

function initIngredientSpotlight() {
  const items = document.querySelectorAll(".spotlight-item");
  const laser = document.getElementById("spotlightCursorLaser");
  const stamp = document.getElementById("expStamp");
  const title = document.getElementById("expTitle");
  const what = document.getElementById("expWhat");
  const why = document.getElementById("expWhy");
  const health = document.getElementById("expHealth");

  if (!items.length || !laser) return;

  function setSpotlight(index) {
    if (index < 0 || index >= INGREDIENT_SPOTLIGHT_DATA.length) return;
    const targetItem = items[index];
    if (!targetItem) return;

    items.forEach((it, i) => {
      it.classList.toggle("active", i === index);
    });

    const topOffset = targetItem.offsetTop + (targetItem.offsetHeight / 2) - 1.5;
    laser.style.top = topOffset + "px";

    const data = INGREDIENT_SPOTLIGHT_DATA[index];
    if (stamp) {
      stamp.textContent = data.stamp;
      stamp.className = "exp-stamp " + data.stampClass;
    }
    if (title) title.textContent = data.title;
    if (what) what.textContent = data.what;
    if (why) why.textContent = data.why;
    if (health) health.textContent = data.health;
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => setSpotlight(index));
  });

  // Position initial laser
  setTimeout(() => setSpotlight(0), 100);

  // ScrollTrigger integration for spotlight
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: "#spotlightItemsContainer",
      start: "top 60%",
      end: "bottom 40%",
      scrub: 0.5,
      onUpdate: (self) => {
        const step = Math.floor(self.progress * items.length);
        const clamped = Math.min(items.length - 1, Math.max(0, step));
        setSpotlight(clamped);
      }
    });
  }
}

function initScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  // ========================================================================
  // A. GLOBAL HUD TELEMETRY SYNC ACROSS ALL 8 PHASES
  // ========================================================================
  const phaseSections = document.querySelectorAll("[data-phase]");
  const hudCount = document.getElementById("hudPhaseCount");
  const hudTitle = document.getElementById("hudPhaseTitle");
  const hudProgress = document.getElementById("hudPhaseProgress");

  function updateHUD(section, index) {
    const phase = section.getAttribute("data-phase") || `0${index + 1} / 06`;
    const title = section.getAttribute("data-phase-title") || "LABEL CHECK";
    if (hudCount) hudCount.textContent = `STEP ${phase}`;
    if (hudTitle) hudTitle.textContent = title;
    if (hudProgress) {
      const pct = Math.round(((index + 1) / phaseSections.length) * 100);
      hudProgress.style.width = pct + "%";
    }
  }

  phaseSections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onEnter: () => updateHUD(section, index),
      onEnterBack: () => updateHUD(section, index)
    });
  });

  // ========================================================================
  // 1. HERO ENTRANCE SEQUENCE (7-Step Clean Orchestration)
  // ========================================================================
  const heroTl = gsap.timeline({ delay: 0.1 });

  heroTl.from(".hero-hud-bar", {
    y: -12,
    opacity: 0,
    duration: 0.55,
    ease: "power2.out"
  })
  .from(".headline-line", {
    y: 22,
    opacity: 0,
    stagger: 0.08,
    duration: 0.7,
    ease: "power3.out"
  }, "-=0.25")
  .from(".hero-kicker-tag, .hero-subhead-text", {
    y: 14,
    opacity: 0,
    stagger: 0.08,
    duration: 0.55,
    ease: "power2.out"
  }, "-=0.4")
  .from(".can-focal-frame, .hero-corner-reticle", {
    scale: 0.94,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.3")
  .from(".scan-connector-trace", {
    scaleX: 0,
    transformOrigin: "left center",
    opacity: 0,
    duration: 0.55,
    ease: "power2.out"
  }, "-=0.25")
  .from(".audit-panel-card", {
    x: 24,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out"
  }, "-=0.35")
  .from(".audit-metric-row", {
    x: -8,
    opacity: 0,
    stagger: 0.06,
    duration: 0.45,
    ease: "power2.out"
  }, "-=0.4")
  .from(".hero-cta-group, .hero-facts-tape", {
    y: 16,
    opacity: 0,
    stagger: 0.1,
    duration: 0.55,
    ease: "power2.out"
  }, "-=0.3")
  .from(".hero-bottom-ticker-bar", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.3");

  // Hero Exit Scroll Transition: subtle upward headline translation
  gsap.to(".hero-main-headline", {
    scrollTrigger: {
      trigger: "#heroSection",
      start: "center center",
      end: "bottom top",
      scrub: 0.6
    },
    y: -40,
    opacity: 0.85,
    ease: "none"
  });

  // ========================================================================
  // 2. SECTION HEADERS REVEAL
  // ========================================================================
  document.querySelectorAll(".section-label-header").forEach(header => {
    const stamp = header.querySelector(".section-number-stamp");
    const title = header.querySelector(".section-hero-title");
    const sub = header.querySelector(".section-sub-copy");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    if (stamp) tl.from(stamp, { x: -25, opacity: 0, duration: 0.45, ease: "power2.out" });
    if (title) tl.from(title, { y: 28, opacity: 0, duration: 0.65, ease: "power3.out" }, "-=0.3");
    if (sub) tl.from(sub, { y: 18, opacity: 0, duration: 0.55, ease: "power2.out" }, "-=0.4");
  });

  // ========================================================================
  // 3. STAGE 02: KINETIC PROBLEM SECTION (FRONT LIES VS BACK REVEALS)
  // ========================================================================
  if (document.getElementById("problemSection")) {
    const problemTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#problemSection",
        start: "top 75%",
        end: "center center",
        scrub: 0.8
      }
    });

    problemTl.from(".quote-front", { opacity: 0.4, filter: "blur(2px)", duration: 0.5 })
             .from(".beam-line", { scaleX: 0, transformOrigin: "center center", duration: 0.4 }, "-=0.2")
             .from(".truth-back", { scale: 0.94, opacity: 0.3, duration: 0.6 }, "-=0.2")
             .from(".kinetic-climax-banner", { y: 20, opacity: 0, duration: 0.5 }, "-=0.2");
  }

  // ========================================================================
  // 4. STAGE 03: STICKY STACKING 4 CARDS (SCAN → READ → AUDIT → REVEAL)
  // ========================================================================
  const stackCards = document.querySelectorAll(".stack-card");
  if (stackCards.length > 1) {
    stackCards.forEach((card, i) => {
      if (i < stackCards.length - 1) {
        ScrollTrigger.create({
          trigger: stackCards[i + 1],
          start: "top 220px",
          end: "top 120px",
          scrub: true,
          onUpdate: (self) => {
            const scale = 1 - (self.progress * 0.04);
            const brightness = 1 - (self.progress * 0.14);
            card.style.transform = `scale(${scale})`;
            card.style.filter = `brightness(${brightness})`;
          }
        });
      }
    });
  }

  // ========================================================================
  // 5. STAGE 04: PINNED HORIZONTAL CONVEYOR (DESKTOP HORIZONTAL BELT)
  // ========================================================================
  const conveyorSection = document.getElementById("pipelineSection");
  const conveyorBelt = document.getElementById("horizontalConveyorBelt");
  const railLaserDot = document.querySelector(".rail-laser-dot");

  if (conveyorSection && conveyorBelt) {
    // Only pin horizontally on desktop screens
    const isDesktop = window.innerWidth > 768;
    if (isDesktop) {
      const scrollDist = conveyorBelt.scrollWidth - window.innerWidth + 120;
      
      gsap.to(conveyorBelt, {
        x: -scrollDist,
        ease: "none",
        scrollTrigger: {
          trigger: conveyorSection,
          pin: true,
          start: "top top",
          end: () => `+=${Math.max(scrollDist, 1800)}`,
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });

      if (railLaserDot) {
        gsap.to(railLaserDot, {
          left: "90%",
          ease: "none",
          scrollTrigger: {
            trigger: conveyorSection,
            start: "top top",
            end: () => `+=${Math.max(scrollDist, 1800)}`,
            scrub: 0.8
          }
        });
      }
    }
  }

  // ========================================================================
  // 6. STAGE 05: FRONT VS BACK SIGNATURE CROSS-EXAMINATION (SVG CONNECTORS)
  // ========================================================================
  if (document.getElementById("crossExamStage")) {
    const laserPaths = [
      document.getElementById("laserPath1"),
      document.getElementById("laserPath2"),
      document.getElementById("laserPath3")
    ];

    laserPaths.forEach((p, idx) => {
      if (p) {
        const len = p.getTotalLength ? p.getTotalLength() : 240;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#crossExamStage",
            start: "top 72%",
            end: "center 48%",
            scrub: 0.8
          }
        });
      }
    });

    gsap.from(".front-claim-box", {
      scrollTrigger: { trigger: "#crossExamStage", start: "top 75%" },
      x: -25,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.from(".back-fact-box", {
      scrollTrigger: { trigger: "#crossExamStage", start: "top 70%" },
      x: 25,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out"
    });
  }

  // ========================================================================
  // 7. STAGE 06: NUTRITION LIVE METRIC SCRUB (0g -> 27g & WHO BENCHMARK)
  // ========================================================================
  const counterEl = document.getElementById("counterScrubNum");
  const tspEl = document.getElementById("counterTeaspoons");
  const meterCanFill = document.getElementById("meterCanFill");
  const meterWhoFill = document.getElementById("meterWhoFill");

  if (counterEl && document.getElementById("nutritionSection")) {
    const sugarTracker = { count: 0 };

    gsap.to(sugarTracker, {
      count: 27,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#nutritionSection",
        start: "top 75%",
        end: "center 45%",
        scrub: 0.8,
        onUpdate: () => {
          const val = Math.round(sugarTracker.count);
          counterEl.textContent = val;
          if (tspEl) tspEl.textContent = (sugarTracker.count / 4.0).toFixed(1);
          const canPct = Math.min(100, (sugarTracker.count / 27) * 100);
          if (meterCanFill) meterCanFill.style.width = canPct + "%";
          const whoPct = Math.min(92.5, (sugarTracker.count / 25) * 92.5);
          if (meterWhoFill) meterWhoFill.style.width = whoPct + "%";
        }
      }
    });
  }

  // ========================================================================
  // 8. STAGE 07: INGREDIENT SCANNER SPOTLIGHT
  // ========================================================================
  initIngredientSpotlight();

  // ========================================================================
  // 9. STAGE 08: CLAIM CHECKER EVIDENCE REVEAL DOCKET
  // ========================================================================
  if (document.querySelector(".claim-investigation-docket")) {
    gsap.from(".docket-step-row", {
      scrollTrigger: {
        trigger: ".claim-investigation-docket",
        start: "top 80%",
        toggleActions: "play none none none"
      },
      y: 24,
      opacity: 0,
      stagger: 0.12,
      duration: 0.65,
      ease: "power2.out"
    });
  }

  // ========================================================================
  // 10. STAGE 09: COMPARISON MOVING MONOLITHS
  // ========================================================================
  if (document.querySelector(".balance-monolith-row")) {
    const compareTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".balance-monolith-row",
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    const stapleCard = document.querySelector(".monolith-staple");
    const altCard = document.querySelector(".monolith-alternative");
    const disparityPillar = document.querySelector(".monolith-disparity-pillar");

    if (stapleCard && altCard) {
      compareTl.from(stapleCard, { x: -40, opacity: 0, duration: 0.7, ease: "power3.out" })
               .from(altCard, { x: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.55");
    }
    if (disparityPillar) {
      compareTl.from(disparityPillar, { scale: 0.85, opacity: 0, duration: 0.5, ease: "back.out(1.5)" }, "-=0.4");
    }
  }

  // ========================================================================
  // 11. STAGE 10: SPECIMEN SHOWCASE PEDESTAL
  // ========================================================================
  if (document.querySelector(".specimen-showcase-stage")) {
    gsap.from(".specimen-catalog-item", {
      scrollTrigger: {
        trigger: ".specimen-showcase-stage",
        start: "top 82%",
        toggleActions: "play none none none"
      },
      x: -30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.65,
      ease: "power2.out"
    });

    gsap.from(".specimen-pedestal-column", {
      scrollTrigger: {
        trigger: ".specimen-showcase-stage",
        start: "top 80%",
        toggleActions: "play none none none"
      },
      x: 30,
      opacity: 0,
      duration: 0.75,
      ease: "power3.out"
    });
  }

  // ========================================================================
  // 12. STAGE 11: APOTHECARY PRESCRIPTION LEDGER
  // ========================================================================
  if (document.querySelector(".apothecary-ledger-table")) {
    gsap.from(".apothecary-row", {
      scrollTrigger: {
        trigger: ".apothecary-ledger-table",
        start: "top 82%",
        toggleActions: "play none none none"
      },
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.65,
      ease: "power2.out"
    });
  }

  // ========================================================================
  // 13. STAGE 12: CLOSING MANIFESTO & RETURN-TO-SCANNER LOOP
  // ========================================================================
  if (document.querySelector(".closing-manifesto-section")) {
    gsap.from(".loop-bracket", {
      scrollTrigger: {
        trigger: ".closing-manifesto-section",
        start: "top 75%"
      },
      scale: 0.8,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.from(".closing-container > *", {
      scrollTrigger: {
        trigger: ".closing-manifesto-section",
        start: "top 78%",
        toggleActions: "play none none none"
      },
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out"
    });

    const closingBg = document.querySelector(".closing-manifesto-bg");
    if (closingBg) {
      gsap.to(closingBg, {
        scrollTrigger: {
          trigger: ".closing-manifesto-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6
        },
        yPercent: 10,
        ease: "none"
      });
    }
  }
}

// ============================================================================
// 10. BESPOKE SECTION INTERACTIVITY (FORENSIC EXHIBITS & SPECIMEN PEDESTAL)
// ============================================================================
function initForensicExhibits() {
  const tabs = document.querySelectorAll(".case-ribbon-tab");
  const panes = document.querySelectorAll(".forensic-exhibit-pane");
  if (!tabs.length || !panes.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const exhibitId = tab.getAttribute("data-exhibit");
      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      panes.forEach(pane => {
        if (pane.id === exhibitId) {
          pane.style.display = "block";
          if (typeof gsap !== "undefined") {
            gsap.fromTo(pane.querySelectorAll(".dissection-chamber"), 
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" }
            );
          }
        } else {
          pane.style.display = "none";
        }
      });
    });
  });
}

const SPECIMEN_SHOWCASE_DATA = {
  "consumer-1": {
    id: "SELECTED PRODUCT // VOLT ENERGY",
    statusText: "[7 SPOONS OF SUGAR]",
    statusColor: "var(--ink-harm)",
    category: "ENERGY DRINK // 250ML CAN",
    title: "VOLT ENERGY DRINK",
    score: "38",
    scoreColor: "var(--ink-harm)",
    pin1: "7 SPOONS SUGAR",
    pin2: "1 CUP COFFEE CAFFEINE",
    harm: "🔴 2 UNHEALTHY INGREDIENTS",
    safe: "🔵 5 COMMON INGREDIENTS",
    good: "🟢 4 GOOD INGREDIENTS",
    svg: `<svg width="90" height="170" viewBox="0 0 50 90" fill="none">
      <rect x="8" y="10" width="34" height="74" rx="2" fill="#111110" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="25" cy="10" rx="17" ry="4" fill="#D8D0C2"/>
      <path d="M28 28L21 44H27L23 58L32 40H26L28 28Z" fill="#D90429"/>
    </svg>`
  },
  "consumer-2": {
    id: "SELECTED PRODUCT // SPARK ZERO",
    statusText: "[ZERO SUGAR / ARTIFICIAL SWEETENER]",
    statusColor: "var(--ink-safe)",
    category: "DIET SODA // 330ML CAN",
    title: "SPARK ZERO COLA",
    score: "78",
    scoreColor: "var(--ink-safe)",
    pin1: "0G WHITE SUGAR",
    pin2: "ARTIFICIAL SWEETENER",
    harm: "🔴 0 HARMFUL SUBSTANCES",
    safe: "🔵 6 COMMON INGREDIENTS",
    good: "🟢 1 GOOD INGREDIENT",
    svg: `<svg width="90" height="170" viewBox="0 0 50 90" fill="none">
      <rect x="8" y="10" width="34" height="74" rx="2" fill="#111110" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="25" cy="10" rx="17" ry="4" fill="#D8D0C2"/>
      <rect x="12" y="32" width="26" height="6" fill="#0066CC"/>
      <text x="25" y="52" font-family="Space Grotesk" font-size="8" font-weight="800" fill="#FFFFFF" text-anchor="middle">ZERO</text>
    </svg>`
  },
  "consumer-3": {
    id: "SELECTED PRODUCT // NATURESIP MANGO",
    statusText: "[80% SUGAR WATER / 20% FRUIT]",
    statusColor: "var(--ink-harm)",
    category: "JUICE BOX // 200ML TETRA PACK",
    title: "MANGO NECTAR PACK",
    score: "52",
    scoreColor: "var(--ink-harm)",
    pin1: "30G ADDED SUGAR",
    pin2: "CHEMICAL PRESERVATIVES",
    harm: "🔴 2 HARMFUL SUBSTANCES",
    safe: "🔵 2 COMMON INGREDIENTS",
    good: "🟢 2 GOOD INGREDIENTS",
    svg: `<svg width="90" height="170" viewBox="0 0 55 90" fill="none">
      <rect x="10" y="8" width="35" height="76" rx="2" fill="#EA580C" stroke="#111110" stroke-width="1.5"/>
      <circle cx="27" cy="40" r="12" fill="#FFA94D"/>
      <text x="27" y="65" font-family="Space Grotesk" font-size="7" font-weight="800" fill="#FFFFFF" text-anchor="middle">MANGO</text>
    </svg>`
  },
  "consumer-4": {
    id: "SELECTED PRODUCT // CRISPBITE CHIPS",
    statusText: "[FRIED IN CHEAP PALM OIL]",
    statusColor: "var(--ink-warn)",
    category: "POTATO CHIPS // 45G PACK",
    title: "CRISPY POTATO CHIPS",
    score: "58",
    scoreColor: "var(--ink-safe)",
    pin1: "CHEAP PALM OIL",
    pin2: "WHOLE POTATOES 64%",
    harm: "🔴 1 HARMFUL SUBSTANCE",
    safe: "🔵 3 COMMON INGREDIENTS",
    good: "🟢 2 GOOD INGREDIENTS",
    svg: `<svg width="90" height="170" viewBox="0 0 60 90" fill="none">
      <path d="M10 16 L20 10 L40 10 L50 16 L48 80 L12 80 Z" fill="#0066CC" stroke="#111110" stroke-width="1.5"/>
      <circle cx="30" cy="45" r="14" fill="#339AF0"/>
      <text x="30" y="48" font-family="Space Grotesk" font-size="7" font-weight="800" fill="#FFFFFF" text-anchor="middle">CHIPS</text>
    </svg>`
  }
};

let ACTIVE_SPECIMEN_ID = "consumer-1";

function initSpecimenShowcase() {
  const items = document.querySelectorAll(".specimen-catalog-item");
  const launchBtn = document.getElementById("btnLaunchSpecimenAudit");
  if (!items.length) return;

  function updatePedestal(prodId) {
    const data = SPECIMEN_SHOWCASE_DATA[prodId] || SPECIMEN_SHOWCASE_DATA["consumer-1"];
    ACTIVE_SPECIMEN_ID = prodId;

    const hudId = document.getElementById("specimenHudId");
    const hudStatus = document.getElementById("specimenHudStatus");
    const visual = document.getElementById("specimenProductVisual");
    const pin1 = document.getElementById("specimenPin1");
    const pin2 = document.getElementById("specimenPin2");
    const cat = document.getElementById("specimenCategoryText");
    const title = document.getElementById("specimenTitleText");
    const score = document.getElementById("specimenScoreVal");
    const harm = document.getElementById("specimenHarmCount");
    const safe = document.getElementById("specimenSafeCount");
    const good = document.getElementById("specimenGoodCount");

    if (hudId) hudId.textContent = data.id;
    if (hudStatus) {
      hudStatus.textContent = data.statusText;
      hudStatus.style.color = data.statusColor;
    }
    if (visual) {
      visual.innerHTML = data.svg;
      if (typeof gsap !== "undefined") {
        gsap.fromTo(visual, { scale: 0.9, opacity: 0.5 }, { scale: 1.1, opacity: 1, duration: 0.35, ease: "back.out(1.4)" });
      }
    }
    if (pin1) pin1.textContent = data.pin1;
    if (pin2) pin2.textContent = data.pin2;
    if (cat) cat.textContent = data.category;
    if (title) title.textContent = data.title;
    if (score) {
      score.innerHTML = `${data.score}<span class="score-total">/100</span>`;
      score.style.color = data.scoreColor;
    }
    if (harm) harm.textContent = data.harm;
    if (safe) safe.textContent = data.safe;
    if (good) good.textContent = data.good;
  }

  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const prodId = item.getAttribute("data-product");
      updatePedestal(prodId);
    });
  });

  if (launchBtn) {
    launchBtn.addEventListener("click", () => {
      executeScanFlow(ACTIVE_SPECIMEN_ID);
    });
  }
}

// ============================================================================
// 11. EVENT INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initHeroSampleSwitcher();
  initNavigation();
  initSmoothScroll();
  initScrollAnimations();
  initForensicExhibits();
  initSpecimenShowcase();

  // Hero Video Autoplay ensure
  const heroVid = document.getElementById("heroScanVideo");
  if (heroVid) {
    heroVid.play().catch(() => {});
  }

  // Hero Inspection Target Card & Button Click
  const btnHeroTargetInspect = document.getElementById("btnHeroTargetInspect");
  if (btnHeroTargetInspect) {
    btnHeroTargetInspect.addEventListener("click", (e) => {
      e.stopPropagation();
      executeScanFlow("consumer-1");
    });
  }

  const heroScanTargetCard = document.getElementById("heroScanTargetCard");
  if (heroScanTargetCard) {
    heroScanTargetCard.addEventListener("click", () => {
      executeScanFlow("consumer-1");
    });
  }

  // Navigation Links
  document.getElementById("navBrandHome").addEventListener("click", showLandingPage);
  document.getElementById("btnDashBackHome").addEventListener("click", showLandingPage);

  // Scanner Open/Close
  document.getElementById("btnNavScan").addEventListener("click", openScannerModal);
  document.getElementById("btnHeroScan").addEventListener("click", openScannerModal);
  document.getElementById("btnDashScanAnother").addEventListener("click", openScannerModal);
  document.getElementById("btnCloseScannerModal").addEventListener("click", closeScannerModal);

  // Demo Trigger Buttons
  document.getElementById("btnHeroDemoScan").addEventListener("click", () => {
    executeScanFlow("consumer-1");
  });
  const btnShowcase = document.getElementById("btnShowcaseScanNow");
  if (btnShowcase) {
    btnShowcase.addEventListener("click", () => {
      executeScanFlow(CURRENT_HERO_SAMPLE_ID || "consumer-1");
    });
  }

  // Modal Presets
  document.querySelectorAll(".preset-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const prodId = btn.getAttribute("data-scan-id");
      executeScanFlow(prodId);
    });
  });

  // Camera Controls
  const btnUploadInstead = document.getElementById("btnUploadInstead");
  if (btnUploadInstead) {
    btnUploadInstead.addEventListener("click", () => {
      switchToUploadFallback();
    });
  }

  const btnTryCameraAgain = document.getElementById("btnTryCameraAgain");
  if (btnTryCameraAgain) {
    btnTryCameraAgain.addEventListener("click", () => {
      startCameraScanner();
    });
  }

  const cameraSelect = document.getElementById("cameraSelect");
  if (cameraSelect) {
    cameraSelect.addEventListener("change", (e) => {
      currentCameraDeviceId = e.target.value;
      startCameraScanner();
    });
  }

  // File Upload Fallback
  const fileInput = document.getElementById("modalFileInput");
  const triggerBtn = document.getElementById("btnTriggerFileInput");
  const dropzone = document.getElementById("scanDropzone");

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
  }
  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      if (!e.target.files || !e.target.files[0]) return;

      // Show loading state
      const cameraState = document.getElementById("scanCameraState");
      const readyState = document.getElementById("scanReadyState");
      const laserState = document.getElementById("scanActiveLaserState");
      if (cameraState) cameraState.style.display = "none";
      if (readyState) readyState.style.display = "none";
      if (laserState) laserState.style.display = "block";

      const ticker = document.getElementById("scanProgressTickerText");
      if (ticker) ticker.textContent = "Uploading image and reading barcode / label...";

      const formData = new FormData();
      formData.append("image", e.target.files[0]);

      try {
        const res = await fetch("http://localhost:8000/api/ocr/analyze", {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        const barcode = data.detected_barcode || "";
        const dynamicId = "upload-" + Date.now();

        registerScannedProduct(
          dynamicId,
          barcode,
          data.analysis || {},
          {
            nutrition: data.extracted_nutrition || {},
            product: {
              name: data.detected_product_name,
              category: barcode ? "Barcode Scan" : "OCR Label Scan"
            }
          }
        );

        closeScannerModal();
        showDashboardPage(dynamicId);
        persistScanToBackend(dynamicId);

      } catch (err) {
        console.error("OCR API error:", err);
        if (ticker) ticker.textContent = "Error: " + err.message;
        setTimeout(() => {
          closeScannerModal();
          showDashboardPage("consumer-1");
        }, 2000);
      }

      // Reset file input for next scan
      e.target.value = "";
    });
  }


  // Substance Filters
  const tabBtns = [
    { btn: document.getElementById("tabFilterAll"), filter: "all" },
    { btn: document.getElementById("tabFilterHarmful"), filter: "harmful" },
    { btn: document.getElementById("tabFilterSafe"), filter: "safe" },
    { btn: document.getElementById("tabFilterGood"), filter: "good" }
  ];

  tabBtns.forEach(({ btn, filter }) => {
    if (btn) {
      btn.addEventListener("click", () => {
        tabBtns.forEach(t => t.btn.classList.remove("active"));
        btn.classList.add("active");
        ACTIVE_FILTER = filter;
        const prod = PRODUCTS_DB[CURRENT_PRODUCT_ID] || PRODUCTS_DB["consumer-1"];
        const searchVal = document.getElementById("substanceSearchInput").value;
        renderSubstanceCards(prod, filter, searchVal);
      });
    }
  });

  // Pillar Quick Filter Clicks
  document.getElementById("pillarCardHarmful").addEventListener("click", () => {
    document.getElementById("tabFilterHarmful").click();
  });
  document.getElementById("pillarCardSafe").addEventListener("click", () => {
    document.getElementById("tabFilterSafe").click();
  });
  document.getElementById("pillarCardGood").addEventListener("click", () => {
    document.getElementById("tabFilterGood").click();
  });

  // Search Input
  document.getElementById("substanceSearchInput").addEventListener("input", (e) => {
    const prod = PRODUCTS_DB[CURRENT_PRODUCT_ID] || PRODUCTS_DB["consumer-1"];
    renderSubstanceCards(prod, ACTIVE_FILTER, e.target.value);
  });

  // Pantry Shelf Product Clicks
  document.querySelectorAll(".shelf-product-box").forEach(box => {
    box.addEventListener("click", () => {
      const prodId = box.getAttribute("data-product");
      executeScanFlow(prodId);
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const prodId = box.getAttribute("data-product");
        executeScanFlow(prodId);
      }
    });
  });

  // Launch Compare Tool Button from Section 04
  const btnOpenCompareTool = document.getElementById("btnOpenCompareTool");
  if (btnOpenCompareTool) {
    btnOpenCompareTool.addEventListener("click", openCompareModal);
  }

  // Closing Manifesto Scan Button
  const btnClosingScan = document.getElementById("btnClosingScan");
  if (btnClosingScan) {
    btnClosingScan.addEventListener("click", openScannerModal);
  }

  // Back to Top Button
  const btnBackToTop = document.getElementById("btnBackToTop");
  if (btnBackToTop) {
    btnBackToTop.addEventListener("click", () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Comparison Modals
  document.getElementById("btnDashCompareModal").addEventListener("click", openCompareModal);
  document.getElementById("btnCloseCompareModal").addEventListener("click", closeCompareModal);

  // Metrology Toggle
  const toggleMetro = document.getElementById("btnToggleMetrology");
  const metroBody = document.getElementById("metrologyDrawerBody");
  const metroText = document.getElementById("metrologyToggleText");

  if (toggleMetro && metroBody) {
    toggleMetro.addEventListener("click", () => {
      metroBody.classList.toggle("open");
      metroText.textContent = metroBody.classList.contains("open") ? "COLLAPSE ▴" : "EXPAND ▾";
    });
  }

  // Scans Modal Triggers
  const btnOpenScans = document.getElementById("btnOpenScansModal");
  const btnMobileOpenScans = document.getElementById("btnMobileOpenScans");
  const btnCloseScans = document.getElementById("btnCloseScansModal");

  if (btnOpenScans) btnOpenScans.addEventListener("click", openScansModal);
  if (btnMobileOpenScans) {
    btnMobileOpenScans.addEventListener("click", () => {
      const mobileDrawer = document.getElementById("mobileNavDrawer");
      if (mobileDrawer) mobileDrawer.classList.remove("open");
      openScansModal();
    });
  }
  if (btnCloseScans) btnCloseScans.addEventListener("click", closeScansModal);

  // Keyboard Accessibility
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeScannerModal();
      closeCompareModal();
      closeScansModal();
    }
  });

  // Backdrop clicks
  window.addEventListener("click", (e) => {
    const scannerModal = document.getElementById("scannerModal");
    const compareModal = document.getElementById("compareModal");
    const scansModal = document.getElementById("scansModal");
    if (e.target === scannerModal) closeScannerModal();
    if (e.target === compareModal) closeCompareModal();
    if (e.target === scansModal) closeScansModal();
  });

  // ── Session: show user name + logout with backend API ──────────────────
  (async function initSessionUI() {
    try {
      const loginBtn = document.getElementById('btnNavLogin');
      const userInfoEl = document.getElementById('navUserInfo');
      const nameEl  = document.getElementById('navUserName');
      const logoutBtn = document.getElementById('btnNavLogout');

      const mobileLoginBtn = document.getElementById('btnMobileNavLogin');
      const mobileSessionRow = document.getElementById('mobileNavSessionRow');
      const mobileNameEl = document.getElementById('mobileNavUserName');
      const mobileLogoutBtn = document.getElementById('btnMobileNavLogout');

      let user = null;

      // Try fetching verified backend profile
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          const meData = await meRes.json();
          user = meData.user;
        }
      } catch (_) {}

      // Fallback to local session storage if server unavailable
      if (!user) {
        const raw = sessionStorage.getItem('packcheck_auth');
        if (raw) user = JSON.parse(raw);
      }

      const isAuthenticated = user && (user.name || user.email) && !user.guest;

      if (isAuthenticated) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfoEl) userInfoEl.style.display = 'flex';

        if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        if (mobileSessionRow) mobileSessionRow.style.display = 'flex';

        const displayName = (user.name || user.email || '').toUpperCase().split('@')[0];
        if (nameEl && displayName) nameEl.textContent = displayName;
        if (mobileNameEl && displayName) mobileNameEl.textContent = displayName;

        const handleLogout = async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          } catch (_) {}
          sessionStorage.removeItem('packcheck_auth');
          sessionStorage.removeItem('packcheck_industry_role');
          window.location.reload();
        };

        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
      } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (userInfoEl) userInfoEl.style.display = 'none';

        if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
        if (mobileSessionRow) mobileSessionRow.style.display = 'none';
      }
    } catch(_) {}
  })();
});
