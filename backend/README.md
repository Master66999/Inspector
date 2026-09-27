# PackCheck Backend with Jev AI Integration

Production-ready backend for **PackCheck** — an AI-powered packaged food and beverage barcode inspection and health assessment platform.

Built with:
- **Python 3.10+**
- **FastAPI**
- **Pydantic v2**
- **HTTPX** (Async HTTP client)
- **Jev AI (TypeSafe AI System One)** (High-speed structured product classification & decision layer)
- **PackCheck Rule Engine** (Deterministic nutritional thresholds aligned with WHO/ICMR-NIN/FSSAI)
- **Open Food Facts API v2**
- **SQLAlchemy 2.0** (Async PostgreSQL engine with seamless local SQLite fallback)
- **Pillow** (Image preprocessing for label OCR)

---

## Architecture Pipeline

PackCheck implements a strict separation of factual data retrieval, deterministic rule analysis, and AI decision classification:

```
Barcode / Packaging Image
         │
         ▼
[ 1. Product Identification ] ────► Barcode Validation / OCR Parser
         │
         ▼
[ 2. Product / Nutrition Data ] ──► Local SQLite Cache / Open Food Facts API v2
         │
         ▼
[ 3. PackCheck Rule Engine ] ─────► Deterministic flags (HIGH_SUGAR, HIGH_SODIUM, etc.) & Score
         │
         ▼
[ 4. Jev AI Evaluation ] ─────────► Structured classification (LIMIT / MODERATE / HEALTHY)
         │
         ▼
[ 5. Recommendation Engine ] ─────► Category-aware healthier benchmark alternatives
         │
         ▼
[ 6. Frontend Results ] ──────────► CleanScore gauge, Warning flags, AI verdict, Swaps
```

### Important Architectural Rule: Jev's Role
**Jev AI must NOT be responsible for inventing product facts.**
- Product data (product name, ingredients, nutritional values, serving size, allergens, category) is strictly supplied by PackCheck's database and Open Food Facts.
- PackCheck's **Rule Engine** deterministically computes factual flags and reference thresholds.
- **Jev AI** receives the structured facts and produces high-speed, bounded, typed classifications (`overall_profile`: "LIMIT" | "MODERATE" | "HEALTHY", reason codes, and concise non-medical explanations).
- AI assessments are presented as nutritional guidance, **never** as medical advice or clinical diagnosis.

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint, CORS & lifespan
│   │
│   ├── config/                  # Configuration & Rule Benchmarks
│   │   ├── nutrition_thresholds.py      # Isolated WHO/ICMR-NIN/FSSAI public health cutoffs
│   │   └── ingredient_knowledge_base.py # Neutral ingredient taxonomy & INS mapping
│   │
│   ├── api/                     # API Route Controllers
│   │   ├── scanner.py           # POST /api/scan (Complete Scan Pipeline with Jev AI)
│   │   ├── products.py          # GET /api/products/{barcode}, GET /api/products/id/{id}, POST /api/products
│   │   ├── analysis.py          # POST /api/analyze/{identifier} (Nutrition & Jev Analysis)
│   │   ├── alternatives.py      # GET /api/alternatives/{identifier}
│   │   └── ocr.py               # POST /api/ocr/analyze (label photo & text fallback)
│   │
│   ├── services/                # Deterministic Business Logic & Integrations
│   │   ├── rule_engine.py       # Deterministic nutrition rule analysis & health scoring
│   │   ├── jev_service.py       # Jev AI System One decision client & fallback handler
│   │   ├── product_service.py   # Database cache manager (Check DB -> OFF -> Save -> Return)
│   │   ├── nutrition.py         # Rule-based nutrition analysis & public health thresholds
│   │   ├── ingredients.py       # Ingredient tokenizer & neutral classifier
│   │   ├── allergens.py         # Allergen detection (distinguishing contains vs may contain)
│   │   ├── recommendations.py   # Category-aware healthier alternative recommendation engine
│   │   ├── openfoodfacts.py     # Open Food Facts API client & normalizer
│   │   └── ocr_service.py       # Image preprocessing & packaging label parser
│   │
│   ├── database/                # Database Layer
│   │   ├── connection.py        # Async engine & resilient session provider
│   │   └── models.py            # SQLAlchemy models (Products, Nutrition, Ingredients, Allergens, Scans)
│   │
│   ├── schemas/                 # Pydantic Schemas
│   │   ├── jev.py               # Jev AI evaluation schema
│   │   ├── product.py           # Product response & registration schemas
│   │   ├── nutrition.py         # Nutrition schema (per 100g/ml)
│   │   ├── analysis.py          # Nutrition & ingredient evaluation schemas
│   │   ├── alternatives.py      # Healthier alternative comparison schemas
│   │   └── ocr.py               # OCR fallback response schema
│   │
│   └── utils/
│       └── helpers.py           # Barcode validation, clean text, safe float conversions
│
├── tests/                       # Comprehensive Automated Test Suite (41 tests)
│   ├── test_jev_integration.py  # Jev integration, rule engine flags, fallback & pipeline tests
│   ├── test_barcode.py          # Barcode format validation tests
│   ├── test_openfoodfacts.py    # Open Food Facts integration & response mapping tests
│   ├── test_caching.py          # Database caching & retrieval tests
│   ├── test_nutrition.py        # Nutrition engine & threshold evaluation tests
│   ├── test_ingredients.py      # Ingredient parser & INS code taxonomy tests
│   ├── test_allergens.py        # Allergen detection (contains vs may contain) tests
│   ├── test_alternatives.py     # Alternative recommendations & delta calculation tests
│   ├── test_ocr.py              # Packaging image preprocessing & OCR tests
│   └── test_api_endpoints.py    # Integration tests for all primary endpoints
│
├── requirements.txt
├── .env.example
├── .env
└── README.md
```

---

## Configuration & Environment Variables

Credentials must **only** be stored in `backend/.env`. Secrets are never committed to version control and never exposed to the frontend.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `JEV_API_KEY` | API Key for TypeSafe AI / Jev System One | *None (triggers safe fallback if unset)* |
| `JEV_API_URL` | Jev Decision Endpoint URL | `https://api.typesafe.ai/v1/systemone` |
| `JEV_MODEL` | Jev Decision Model ID | `jev-latest` |
| `OPENFOODFACTS_BASE_URL` | Open Food Facts v2 endpoint | `https://world.openfoodfacts.org/api/v2` |
| `DATABASE_URL` | PostgreSQL connection string | *PostgreSQL with auto-fallback to SQLite* |
| `PORT` | Backend service port | `8000` |
| `HOST` | Backend service host | `0.0.0.0` |

---

## PackCheck Deterministic Rule Engine

The rule engine (`app/services/rule_engine.py`) deterministically benchmarks macro- and micro-nutrients against WHO (2024), ICMR-NIN, and FSSAI standards:

- **HIGH_SUGAR**: Sugars > 12.5g per 100g/ml
- **HIGH_SODIUM**: Sodium > 600mg per 100g/ml (or salt > 1.5g)
- **HIGH_SATURATED_FAT**: Saturated fat > 5.0g per 100g/ml
- **HIGH_FAT**: Total fat > 17.5g per 100g/ml
- **LOW_PROTEIN**: Protein < 5.0g per 100g/ml
- **HIGH_CALORIES**: Energy density > 250 kcal per 100g/ml
- **ALLERGEN_PRESENT**: Recipe contains declared allergens
- **ADDITIVE_PRESENT**: Recipe includes formulated sweeteners, preservatives, or artificial colors

All thresholds are isolated in `app/config/nutrition_thresholds.py` for auditability and regulatory alignment.

---

## API Specification

### `POST /api/scan`

Scans a product barcode, runs the deterministic rule engine, invokes Jev AI evaluation, and fetches healthier alternatives.

#### Request:
```bash
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"barcode": "8901234567890"}'
```

#### Response:
```json
{
  "success": true,
  "status": "success",
  "scan_id": "7b8dbbe4-3c66-4c4f-9e73-b3c4f74d0a32",
  "barcode": "8901234567890",
  "product": {
    "barcode": "8901234567890",
    "product": {
      "name": "Example Chocolate Drink",
      "brand": "ChocoPure",
      "category": "Beverage",
      "image": "https://example.com/chocodrink.jpg"
    },
    "nutrition": {
      "energy_kcal": 210.0,
      "sugars": 18.0,
      "fat": 3.2,
      "saturated_fat": 2.1,
      "sodium": 120.0,
      "protein": 4.0,
      "fiber": 1.2
    },
    "ingredients": ["milk", "sugar", "cocoa", "emulsifier (INS 322)"],
    "allergens": ["milk", "soy"]
  },
  "nutrition_analysis": {
    "score": 62,
    "flags": ["HIGH_SUGAR", "ADDITIVE_PRESENT", "ALLERGEN_PRESENT"],
    "positive_flags": ["LOW_SODIUM"],
    "nutrition_summary": {
      "sugar": 18.0,
      "fat": 3.2,
      "saturated_fat": 2.1,
      "sodium": 120.0,
      "protein": 4.0,
      "calories": 210.0
    },
    "warnings": [
      "High sugar content (18.0g per 100g/ml; benchmark > 12.5g)",
      "Contains formulated food additives (preservatives, colors, or artificial sweeteners)",
      "Contains declared allergens: milk, soy"
    ]
  },
  "jev_evaluation": {
    "available": true,
    "overall_profile": "LIMIT",
    "sugar_level": "HIGH",
    "sodium_level": "LOW",
    "concerns": ["HIGH_SUGAR"],
    "reason_codes": ["HIGH_SUGAR"],
    "explanation": [
      "High sugar content exceeding recommended daily reference limits",
      "Moderate nutritional value"
    ],
    "disclaimer": "AI classification is based on PackCheck's factual nutritional parameters. For dietary guidance only; not medical advice."
  },
  "recommendations": [
    {
      "barcode": "8901000000012",
      "product_name": "Organic Cold-Brewed Green Tea (Unsweetened)",
      "brand": "PureLeaf Botanical",
      "category": "Beverage",
      "cleanscore": 95,
      "comparison_summary": "Superior choice: 18.0g less sugar per 100g."
    }
  ]
}
```

---

## Fallback & Error Handling Behavior

PackCheck is architected for zero single points of failure:
- **Jev AI Offline / Network Failure / Missing Key:** If Jev AI times out, errors, or if `JEV_API_KEY` is omitted, the scan **never crashes**. The system marks `jev_evaluation.available = false`, logs the error safely (without exposing credentials), and returns the full deterministic PackCheck nutrition score and rule engine flags.
- **Product Missing from Database:** Automatically queries Open Food Facts v2, standardizes product attributes, caches the result in SQLite, and completes the scan.
- **Missing Nutrition Facts:** Handled smoothly by defaulting missing items to `0.0` rather than throwing uncaught exceptions.

Example Jev fallback response payload:
```json
{
  "jev_evaluation": {
    "available": false,
    "reason": "AI evaluation temporarily unavailable"
  }
}
```

---

## Running Locally

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Add your `JEV_API_KEY` if testing with live TypeSafe AI credentials)*

### 3. Run Automated Tests
```bash
python -m pytest
# 41 passed in ~4.9s
```

### 4. Run Development Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
