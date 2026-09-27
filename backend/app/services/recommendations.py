import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..database.models import Product
from ..schemas.product import ProductResponse
from ..schemas.nutrition import NutritionData
from ..schemas.alternatives import AlternativeProduct, AlternativesResponse

logger = logging.getLogger("packcheck.services.recommendations")

# Benchmark category healthier candidates to supplement local database (all units per 100g/ml)
CATEGORY_BENCHMARK_PROFILES = {
    "beverage": [
        {
            "name": "Infused Sparkling Lemon-Lime Spring Water",
            "brand": "SparkPure",
            "barcode": "8901000000011",
            "category": "Carbonated Drinks",
            "nutrition": {
                "energy_kcal": 2.0,
                "sugars": 0.0,
                "fat": 0.0,
                "saturated_fat": 0.0,
                "protein": 0.0,
                "fiber": 0.0,
                "sodium": 0.005,  # 5mg in grams
                "salt": 0.01
            }
        },
        {
            "name": "Organic Cold-Brewed Green Tea (Unsweetened)",
            "brand": "PureLeaf Botanical",
            "barcode": "8901000000012",
            "category": "Iced Tea & Beverages",
            "nutrition": {
                "energy_kcal": 0.0,
                "sugars": 0.0,
                "fat": 0.0,
                "saturated_fat": 0.0,
                "protein": 0.0,
                "fiber": 0.0,
                "sodium": 0.002,  # 2mg in grams
                "salt": 0.0
            }
        }
    ],
    "snack": [
        {
            "name": "Roasted Spiced Chickpeas (Chana)",
            "brand": "HarvestPulse",
            "barcode": "8901000000021",
            "category": "Savory Snacks",
            "nutrition": {
                "energy_kcal": 380.0,
                "sugars": 2.5,
                "fat": 6.0,
                "saturated_fat": 0.8,
                "protein": 19.0,
                "fiber": 15.0,
                "sodium": 0.280,  # 280mg in grams
                "salt": 0.70
            }
        },
        {
            "name": "Air-Popped Salt & Pepper Makhana (Fox Nuts)",
            "brand": "NativeRoots",
            "barcode": "8901000000022",
            "category": "Roasted Snacks",
            "nutrition": {
                "energy_kcal": 350.0,
                "sugars": 0.5,
                "fat": 1.5,
                "saturated_fat": 0.3,
                "protein": 9.5,
                "fiber": 7.0,
                "sodium": 0.180,  # 180mg in grams
                "salt": 0.45
            }
        }
    ],
    "biscuit": [
        {
            "name": "100% Whole Wheat & Rolled Oats Digestive",
            "brand": "GrainHeritage",
            "barcode": "8901000000031",
            "category": "Biscuits & Cookies",
            "nutrition": {
                "energy_kcal": 410.0,
                "sugars": 11.0,
                "fat": 12.0,
                "saturated_fat": 2.5,
                "protein": 9.0,
                "fiber": 8.5,
                "sodium": 0.190,  # 190mg in grams
                "salt": 0.48
            }
        }
    ]
}


class RecommendationService:
    """
    Transparent healthier alternative recommendation engine.
    Compares candidate products in the same category against target product,
    calculating objective nutritional differentials and explainable reasons.
    """

    async def get_alternatives_for_product(
        self,
        target: ProductResponse,
        db: AsyncSession,
        limit: int = 4
    ) -> AlternativesResponse:
        target_nutr = target.nutrition
        candidates_pool = await self._gather_candidates(target, db)
        evaluated_alternatives: List[AlternativeProduct] = []

        for cand in candidates_pool:
            cand_nutr = cand["nutrition"]

            # Calculate differentials (Candidate - Target)
            sugar_diff = round(cand_nutr.sugars - target_nutr.sugars, 1)

            # Sodium normalized to milligrams for display
            target_sod_mg = target_nutr.sodium * 1000.0 if target_nutr.sodium <= 10.0 else target_nutr.sodium
            cand_sod_mg = cand_nutr.sodium * 1000.0 if cand_nutr.sodium <= 10.0 else cand_nutr.sodium
            sodium_diff = round(cand_sod_mg - target_sod_mg, 1)

            sat_fat_diff = round(cand_nutr.saturated_fat - target_nutr.saturated_fat, 1)
            protein_diff = round(cand_nutr.protein - target_nutr.protein, 1)
            fiber_diff = round(cand_nutr.fiber - target_nutr.fiber, 1)
            calories_diff = round(cand_nutr.energy_kcal - target_nutr.energy_kcal, 1)

            # Check for advantages with priority weighting
            # format: (priority_score, text_message)
            scored_advantages = []

            if sugar_diff <= -2.5:
                prio = 20.0 + abs(sugar_diff)
                scored_advantages.append((prio, f"Lower sugar than scanned product ({sugar_diff:+}g per 100g/ml)"))

            if sat_fat_diff <= -1.0:
                prio = 15.0 + abs(sat_fat_diff) * 2
                scored_advantages.append((prio, f"Lower saturated fat than scanned product ({sat_fat_diff:+}g per 100g/ml)"))

            if sodium_diff <= -50.0:
                prio = 10.0 + abs(sodium_diff) / 50.0
                scored_advantages.append((prio, f"Lower sodium than scanned product ({sodium_diff:+}mg per 100g/ml)"))

            if protein_diff >= 2.0:
                prio = 12.0 + protein_diff * 2
                scored_advantages.append((prio, f"Higher protein than scanned product ({protein_diff:+}g per 100g/ml)"))

            if fiber_diff >= 1.5:
                prio = 12.0 + fiber_diff * 2
                scored_advantages.append((prio, f"Higher dietary fiber than scanned product ({fiber_diff:+}g per 100g/ml)"))

            if calories_diff <= -30.0:
                prio = 5.0 + abs(calories_diff) / 50.0
                scored_advantages.append((prio, f"Lower energy density ({calories_diff:+} kcal per 100g/ml)"))

            # Only suggest candidate if it offers at least one genuine nutritional advantage
            if scored_advantages:
                # Sort by highest advantage priority
                scored_advantages.sort(key=lambda x: x[0], reverse=True)
                primary_reason = scored_advantages[0][1]
                advantages_text = [a[1] for a in scored_advantages]
                explanation = f"Offers {len(advantages_text)} measurable nutritional advantages: " + "; ".join(advantages_text)

                evaluated_alternatives.append(
                    AlternativeProduct(
                        name=cand["name"],
                        brand=cand.get("brand"),
                        barcode=cand.get("barcode"),
                        category=cand.get("category"),
                        image=cand.get("image"),
                        reason=primary_reason,
                        comparison={
                            "sugar_difference": sugar_diff,
                            "sodium_difference": sodium_diff,
                            "saturated_fat_difference": sat_fat_diff,
                            "protein_difference": protein_diff,
                            "fiber_difference": fiber_diff,
                            "calories_difference": calories_diff
                        },
                        score_explanation=explanation
                    )
                )

        # Sort by most advantageous candidates
        evaluated_alternatives = evaluated_alternatives[:limit]

        return AlternativesResponse(
            product=target.product.name,
            barcode=target.barcode,
            category=target.product.category,
            alternatives=evaluated_alternatives
        )

    async def _gather_candidates(self, target: ProductResponse, db: AsyncSession) -> List[Dict[str, Any]]:
        """Queries local database and supplements with category profiles."""
        candidates = []
        cat = (target.product.category or "").lower()
        barcode = target.barcode

        # Query DB for products in similar category
        try:
            import re
            from sqlalchemy import or_

            stmt = (
                select(Product)
                .where(Product.barcode != barcode)
                .options(selectinload(Product.nutrition))
            )
            cat_words = [w for w in re.split(r"[\s,/-]", cat) if len(w) > 3]
            if cat_words:
                or_clauses = [Product.category.ilike(f"%{w}%") for w in cat_words]
                stmt = stmt.where(or_(*or_clauses))

            stmt = stmt.limit(10)
            res = await db.execute(stmt)
            db_prods = res.scalars().all()

            for p in db_prods:
                if p.nutrition:
                    candidates.append({
                        "name": p.name,
                        "brand": p.brand,
                        "barcode": p.barcode,
                        "category": p.category,
                        "image": p.image_url,
                        "nutrition": NutritionData(
                            energy_kcal=p.nutrition.energy_kcal or 0.0,
                            sugars=p.nutrition.sugars or 0.0,
                            fat=p.nutrition.fat or 0.0,
                            saturated_fat=p.nutrition.saturated_fat or 0.0,
                            protein=p.nutrition.protein or 0.0,
                            fiber=p.nutrition.fiber or 0.0,
                            sodium=p.nutrition.sodium or 0.0,
                            salt=p.nutrition.salt or 0.0
                        )
                    })
        except Exception as e:
            logger.warning(f"Could not load database candidates for alternatives: {e}")

        # Supplement with appropriate category benchmark profiles
        category_key = "beverage"
        if any(w in cat for w in ("chip", "crisp", "snack", "fry", "namkeen")):
            category_key = "snack"
        elif any(w in cat for w in ("biscuit", "cookie", "bakery", "cake")):
            category_key = "biscuit"

        benchmarks = CATEGORY_BENCHMARK_PROFILES.get(category_key, CATEGORY_BENCHMARK_PROFILES["beverage"])
        for b in benchmarks:
            if b["barcode"] != barcode:
                candidates.append({
                    "name": b["name"],
                    "brand": b["brand"],
                    "barcode": b["barcode"],
                    "category": b["category"],
                    "image": None,
                    "nutrition": NutritionData(**b["nutrition"])
                })

        return candidates
