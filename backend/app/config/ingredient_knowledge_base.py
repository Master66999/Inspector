"""
Ingredient Knowledge Base.
Contains neutral, scientific, and functional descriptions of common food ingredients,
additives, and INS/E-number food codes.
Classifications: Sweetener, Preservative, Colour, Acidity regulator, Emulsifier,
Stabilizer, Flavoring, Caffeine, Salt, Oil, Other.
"""

INGREDIENT_KNOWLEDGE_BASE = {
    # ── Sweeteners ──────────────────────────────────────────────────────────
    "sugar": {
        "ingredient_name": "Sugar (Sucrose)",
        "ingredient_type": "Sweetener",
        "description": "Simple carbohydrate composed of glucose and fructose, commonly extracted from sugarcane or sugar beet.",
        "common_use": "Provides sweetness, structure, moisture retention, and acts as a traditional preservative in jams and confectioneries.",
        "notes": "Caloric sweetener. High dietary intake is associated with dental caries and increased energy density."
    },
    "glucose syrup": {
        "ingredient_name": "Glucose Syrup / Liquid Glucose",
        "ingredient_type": "Sweetener",
        "description": "Concentrated aqueous solution of nutritive saccharides obtained from starch hydrolysis.",
        "common_use": "Used in candies, beverages, and baked goods for sweetness and to prevent crystallization.",
        "notes": "Rapidly digestible carbohydrate with high glycemic response."
    },
    "high fructose corn syrup": {
        "ingredient_name": "High Fructose Corn Syrup (HFCS)",
        "ingredient_type": "Sweetener",
        "description": "Sweetener liquid derived from corn starch with varying ratios of fructose and glucose.",
        "common_use": "Commonly used in sodas, sweetened teas, and processed snacks.",
        "notes": "Caloric sweetener metabolized primarily by the liver; provides 4 kcal/g."
    },
    "sucralose": {
        "ingredient_name": "Sucralose (INS 955)",
        "ingredient_type": "Sweetener",
        "description": "Zero-calorie artificial sweetener made by chlorinating sucrose.",
        "common_use": "Provides intense sweetness (approx. 600x sweeter than sucrose) without calories in diet beverages and low-sugar foods.",
        "notes": "Heat-stable non-nutritive sweetener approved by FSSAI, FDA, and EFSA within established acceptable daily intake (ADI)."
    },
    "aspartame": {
        "ingredient_name": "Aspartame (INS 951)",
        "ingredient_type": "Sweetener",
        "description": "Low-calorie dipeptide sweetener composed of phenylalanine and aspartic acid.",
        "common_use": "Used in diet sodas, sugar-free desserts, and chewing gum (approx. 200x sweeter than sugar).",
        "notes": "Carries warning for individuals with phenylketonuria (PKU). Approved globally within established ADI guidelines."
    },
    "acesulfame potassium": {
        "ingredient_name": "Acesulfame Potassium (INS 950)",
        "ingredient_type": "Sweetener",
        "description": "Calorie-free sweetener often blended with aspartame or sucralose to create a rounded sweet profile.",
        "common_use": "Used in low-calorie beverages, baked items, and dairy preparations.",
        "notes": "Excreted unchanged by the kidneys without being metabolized."
    },
    "stevia": {
        "ingredient_name": "Steviol Glycosides (INS 960)",
        "ingredient_type": "Sweetener",
        "description": "Natural zero-calorie sweet compounds extracted from the leaves of the Stevia rebaudiana plant.",
        "common_use": "Sweetening agent in beverages, yogurt, and confectionery.",
        "notes": "Plant-derived non-caloric sweetener with a minor licorice-like aftertaste."
    },

    # ── Acidity Regulators ──────────────────────────────────────────────────
    "citric acid": {
        "ingredient_name": "Citric Acid (INS 330)",
        "ingredient_type": "Acidity regulator",
        "description": "Organic tricarboxylic acid naturally present in citrus fruits, commercially produced via fermentation.",
        "common_use": "Controls product pH, enhances tart fruity flavors, and acts as an antioxidant synergist.",
        "notes": "Widely used standard food-grade ingredient with general recognized-as-safe (GRAS) status."
    },
    "phosphoric acid": {
        "ingredient_name": "Phosphoric Acid (INS 338)",
        "ingredient_type": "Acidity regulator",
        "description": "Inorganic acid providing a distinctive sharp, tangy flavor note.",
        "common_use": "Primary acidulant in cola-type carbonated soft drinks.",
        "notes": "Provides dietary phosphorus. Excessive long-term consumption without balanced calcium intake has been studied in bone mineral density research."
    },
    "sodium citrate": {
        "ingredient_name": "Sodium Citrate (INS 331)",
        "ingredient_type": "Acidity regulator",
        "description": "Sodium salt of citric acid with a mild salty-sour taste.",
        "common_use": "Buffering agent, emulsifier in processed cheese, and flavor enhancer in gelatin and soft drinks.",
        "notes": "Contributes to the sodium content of the product."
    },
    "malic acid": {
        "ingredient_name": "Malic Acid (INS 296)",
        "ingredient_type": "Acidity regulator",
        "description": "Dicarboxylic organic acid naturally found in apples and tart fruits.",
        "common_use": "Used to produce smooth, lingering sourness in candies and fruit beverages.",
        "notes": "Standard fruit acid with high solubility."
    },

    # ── Preservatives ───────────────────────────────────────────────────────
    "sodium benzoate": {
        "ingredient_name": "Sodium Benzoate (INS 211)",
        "ingredient_type": "Preservative",
        "description": "Sodium salt of benzoic acid effective in acidic conditions (pH < 4.5).",
        "common_use": "Inhibits yeast, mold, and bacterial growth in fruit juices, carbonated drinks, and pickles.",
        "notes": "Permitted preservative strictly regulated by maximum limit ceilings in food safety regulations."
    },
    "potassium sorbate": {
        "ingredient_name": "Potassium Sorbate (INS 202)",
        "ingredient_type": "Preservative",
        "description": "Potassium salt of sorbic acid with broad antimicrobial activity.",
        "common_use": "Extends shelf-life of baked goods, cheese, dried fruit, and sauces.",
        "notes": "Metabolized by the human body similarly to dietary fatty acids into water and carbon dioxide."
    },

    # ── Colours ─────────────────────────────────────────────────────────────
    "caramel": {
        "ingredient_name": "Caramel Colour (INS 150d / Class IV)",
        "ingredient_type": "Colour",
        "description": "Water-soluble food colouring produced by controlled heat treatment of carbohydrates with ammonium and sulphite compounds.",
        "common_use": "Imparts deep brown colour in colas, sauces, gravies, and baked products.",
        "notes": "Permitted food colour subject to purity standards regulating trace 4-MEI levels."
    },
    "tartrazine": {
        "ingredient_name": "Tartrazine (INS 102)",
        "ingredient_type": "Colour",
        "description": "Synthetic lemon-yellow azo dye.",
        "common_use": "Used in snacks, soft drinks, desserts, and instant noodles.",
        "notes": "Permitted synthetic food colour; requires mandatory front-of-pack declaration in several jurisdictions."
    },
    "sunset yellow": {
        "ingredient_name": "Sunset Yellow FCF (INS 110)",
        "ingredient_type": "Colour",
        "description": "Synthetic orange-red azo dye.",
        "common_use": "Commonly applied in confectionery, orange sodas, and savory snacks.",
        "notes": "Subject to defined daily acceptable intake limits and statutory labeling requirements."
    },
    "beta carotene": {
        "ingredient_name": "Beta-Carotene (INS 160a)",
        "ingredient_type": "Colour",
        "description": "Naturally derived or nature-identical red-orange pigment and provitamin A precursor.",
        "common_use": "Colours margarines, dairy products, and juices with yellow-orange tones.",
        "notes": "Nutrient precursor that can be converted by the human body into vitamin A."
    },

    # ── Emulsifiers & Stabilizers ───────────────────────────────────────────
    "soy lecithin": {
        "ingredient_name": "Soy Lecithin (INS 322)",
        "ingredient_type": "Emulsifier",
        "description": "Mixture of phospholipids derived from soybeans during oil processing.",
        "common_use": "Prevents separation of fat and water in chocolate, margarine, and baked goods; aids chocolate flow.",
        "notes": "Derived from soy; requires allergen labeling for soy-sensitive consumers."
    },
    "mono and diglycerides": {
        "ingredient_name": "Mono- and Di-glycerides of Fatty Acids (INS 471)",
        "ingredient_type": "Emulsifier",
        "description": "Food additive composed of glycerol bound to one or two fatty acids.",
        "common_use": "Maintains texture, retards staling in bread, and stabilizes ice cream emulsions.",
        "notes": "Fat-derived emulsifier metabolized similarly to normal dietary fats."
    },
    "xanthan gum": {
        "ingredient_name": "Xanthan Gum (INS 415)",
        "ingredient_type": "Stabilizer",
        "description": "Polysaccharide fermented from sugars by the bacterium Xanthomonas campestris.",
        "common_use": "Viscosity enhancer and suspension stabilizer in salad dressings, sauces, and gluten-free foods.",
        "notes": "Soluble dietary fiber with excellent stability across a wide temperature and pH range."
    },
    "guar gum": {
        "ingredient_name": "Guar Gum (INS 412)",
        "ingredient_type": "Stabilizer",
        "description": "Galactomannan polysaccharide extracted from the seeds of the guar plant (Cyamopsis tetragonoloba).",
        "common_use": "Thickener and moisture binder in soups, sauces, baked foods, and dairy desserts.",
        "notes": "Plant-based soluble fiber that increases satiety and stabilizes liquid viscosity."
    },

    # ── Caffeine ────────────────────────────────────────────────────────────
    "caffeine": {
        "ingredient_name": "Caffeine",
        "ingredient_type": "Caffeine",
        "description": "Naturally occurring methylxanthine alkaloid that stimulates the central nervous system.",
        "common_use": "Added to colas and energy drinks for functional alertness and mild bitter flavor balancing.",
        "notes": "Dietary stimulant. Regulatory guidelines typically recommend moderation for children and pregnant individuals."
    },

    # ── Salt ────────────────────────────────────────────────────────────────
    "salt": {
        "ingredient_name": "Salt (Sodium Chloride)",
        "ingredient_type": "Salt",
        "description": "Essential mineral crystalline compound composed predominantly of sodium and chlorine (NaCl).",
        "common_use": "Primary savory seasoning, flavor enhancer, and natural preservation agent.",
        "notes": "Essential nutrient for fluid balance and nerve transmission. Excessive intake is linked to cardiovascular hypertension risk."
    },

    # ── Oils & Fats ─────────────────────────────────────────────────────────
    "palm oil": {
        "ingredient_name": "Palm Oil / Palmolein",
        "ingredient_type": "Oil",
        "description": "Edible vegetable oil extracted from the mesocarp of oil palm fruit, naturally balanced in saturated and unsaturated fatty acids.",
        "common_use": "Widely used in frying, instant noodles, biscuits, and confectionery due to its high oxidative stability and semi-solid room temperature texture.",
        "notes": "Contains approximately 50% saturated fat (predominantly palmitic acid). Does not require hydrogenation, thus naturally zero trans fat."
    },
    "sunflower oil": {
        "ingredient_name": "Sunflower Oil",
        "ingredient_type": "Oil",
        "description": "Non-volatile plant oil pressed from the seeds of the sunflower (Helianthus annuus).",
        "common_use": "Cooking, frying, and salad oil due to its high smoke point and neutral flavor.",
        "notes": "Rich in unsaturated fatty acids (polyunsaturated linoleic acid and monounsaturated oleic acid) and vitamin E."
    },

    # ── Flavorings ──────────────────────────────────────────────────────────
    "natural flavorings": {
        "ingredient_name": "Natural Flavorings",
        "ingredient_type": "Flavoring",
        "description": "Flavor constituents extracted from plants, spices, fruits, vegetables, or herbs.",
        "common_use": "Enhances or standardizes product aroma and taste profiles.",
        "notes": "Derived from natural raw material sources without synthetic chemical synthesis."
    },
    "vanillin": {
        "ingredient_name": "Vanillin / Ethyl Vanillin",
        "ingredient_type": "Flavoring",
        "description": "Primary aromatic compound responsible for characteristic vanilla flavor.",
        "common_use": "Confectionery, chocolates, ice creams, and baked goods.",
        "notes": "Nature-identical or synthesized flavor compound standard in modern confectionery."
    },

    # ── Other Staples ───────────────────────────────────────────────────────
    "carbonated water": {
        "ingredient_name": "Carbonated Water",
        "ingredient_type": "Other",
        "description": "Purified water into which carbon dioxide gas under pressure has been dissolved.",
        "common_use": "Base liquid for sparkling beverages and sodas, providing characteristic effervescence.",
        "notes": "Hydrating fluid; carbonic acid gives a mild crisp effervescence."
    },
    "water": {
        "ingredient_name": "Water",
        "ingredient_type": "Other",
        "description": "Purified drinking water meeting potability standards.",
        "common_use": "Primary solvent, hydrating carrier, and volume base in liquid and beverage foods.",
        "notes": "Essential life nutrient providing zero calories, sugar, or sodium."
    },
    "wheat flour": {
        "ingredient_name": "Wheat Flour (Maida / Atta)",
        "ingredient_type": "Other",
        "description": "Powder made from the grinding of wheat grain (Triticum aestivum).",
        "common_use": "Basic structural ingredient in noodles, breads, biscuits, and snack doughs.",
        "notes": "Contains gluten proteins (gliadin and glutenin) which provide elasticity."
    },
    "cocoa powder": {
        "ingredient_name": "Cocoa Solids / Cocoa Powder",
        "ingredient_type": "Other",
        "description": "Non-fat component of cacao beans remaining after cocoa butter extraction.",
        "common_use": "Imparts deep chocolate flavor and colour to confectioneries, beverages, and baked goods.",
        "notes": "Source of natural polyphenols (flavanols) and minerals like magnesium and iron."
    }
}
