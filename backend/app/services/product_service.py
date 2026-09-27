import logging
import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..database.models import Product, Nutrition, Ingredient, Allergen
from ..schemas.product import ProductResponse, ProductInfo, AllergenInfo
from ..schemas.nutrition import NutritionData
from .openfoodfacts import OpenFoodFactsService, ProductNotFoundError, OpenFoodFactsAPIError

logger = logging.getLogger("packcheck.services.product")
off_service = OpenFoodFactsService()


class ProductService:
    """Handles cached database lookups and Open Food Facts persistence."""

    async def get_or_fetch_product(self, barcode: str, db: AsyncSession) -> ProductResponse:
        """
        Flow:
        1. Check PostgreSQL/Database
        2. If found -> return cached database result
        3. If not found -> Query Open Food Facts
        4. Save product, nutrition, ingredients, and allergens to database
        5. Return normalized result
        """
        # 1. Check local database
        stmt = (
            select(Product)
            .where(Product.barcode == barcode)
            .options(
                selectinload(Product.nutrition),
                selectinload(Product.ingredients),
                selectinload(Product.allergens)
            )
        )
        result = await db.execute(stmt)
        db_product = result.scalar_one_or_none()

        if db_product:
            logger.info(f"[DB CACHE HIT] Retrieved product '{barcode}' from local database.")
            return self._db_product_to_response(db_product)

        # 2. Not found in local DB -> fetch from Open Food Facts
        logger.info(f"[EXTERNAL QUERY] Product '{barcode}' not in database. Fetching from Open Food Facts...")
        normalized = await off_service.fetch_product_by_barcode(barcode)

        # 3. Save to database for local caching
        try:
            await self._persist_product(normalized, db)
            logger.info(f"[DB SAVED] Product '{barcode}' saved to database.")
        except Exception as e:
            logger.error(f"Failed to persist product {barcode} to database: {e}")
            await db.rollback()

        return normalized

    async def get_product_by_id(self, product_id: str, db: AsyncSession) -> Optional[ProductResponse]:
        """Look up a product by its internal database UUID/ID."""
        stmt = (
            select(Product)
            .where(Product.id == product_id)
            .options(
                selectinload(Product.nutrition),
                selectinload(Product.ingredients),
                selectinload(Product.allergens)
            )
        )
        result = await db.execute(stmt)
        product = result.scalar_one_or_none()
        if not product:
            return None
        return self._db_product_to_response(product)

    async def create_product(self, product_in, db: AsyncSession) -> ProductResponse:
        """Registers a new custom product into the database."""
        stmt = (
            select(Product)
            .where(Product.barcode == product_in.barcode)
            .options(
                selectinload(Product.nutrition),
                selectinload(Product.ingredients),
                selectinload(Product.allergens)
            )
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            return self._db_product_to_response(existing)

        prod_resp = ProductResponse(
            barcode=product_in.barcode,
            product=ProductInfo(
                name=product_in.name,
                brand=product_in.brand or "Unknown Brand",
                category=product_in.category or "Uncategorized",
                image=product_in.image_url
            ),
            nutrition=product_in.nutrition or NutritionData(),
            ingredients=product_in.ingredients or [],
            allergens=product_in.allergens or [],
            allergen_breakdown=AllergenInfo(contains=product_in.allergens or [])
        )
        await self._persist_product(prod_resp, db)
        return prod_resp

    async def _persist_product(self, data: ProductResponse, db: AsyncSession) -> Product:
        """Persists normalized Open Food Facts product dataset into database."""
        product_id = str(uuid.uuid4())

        # Nutrition entity
        nutr = data.nutrition
        new_nutrition = Nutrition(
            id=str(uuid.uuid4()),
            product_id=product_id,
            energy_kcal=nutr.energy_kcal,
            sugars=nutr.sugars,
            added_sugars=nutr.added_sugars,
            fat=nutr.fat,
            saturated_fat=nutr.saturated_fat,
            trans_fat=nutr.trans_fat,
            protein=nutr.protein,
            fiber=nutr.fiber,
            sodium=nutr.sodium,
            salt=nutr.salt
        )

        # Ingredients entities collection
        ing_objs: List[Ingredient] = []
        for ing_name in data.ingredients:
            clean_name = ing_name.strip()
            if not clean_name:
                continue
            ing_stmt = select(Ingredient).where(Ingredient.name == clean_name)
            ing_res = await db.execute(ing_stmt)
            ing_obj = ing_res.scalar_one_or_none()
            if not ing_obj:
                ing_obj = Ingredient(
                    id=str(uuid.uuid4()),
                    name=clean_name
                )
                db.add(ing_obj)
            ing_objs.append(ing_obj)

        # Allergens entities collection
        all_objs: List[Allergen] = []
        for allergen_name in data.allergens:
            clean_all = allergen_name.strip()
            if not clean_all:
                continue
            all_stmt = select(Allergen).where(Allergen.name == clean_all)
            all_res = await db.execute(all_stmt)
            all_obj = all_res.scalar_one_or_none()
            if not all_obj:
                all_obj = Allergen(
                    id=str(uuid.uuid4()),
                    name=clean_all
                )
                db.add(all_obj)
            all_objs.append(all_obj)

        new_product = Product(
            id=product_id,
            barcode=data.barcode,
            name=data.product.name,
            brand=data.product.brand,
            category=data.product.category,
            image_url=data.product.image,
            source="openfoodfacts",
            nutrition=new_nutrition,
            ingredients=ing_objs,
            allergens=all_objs
        )

        db.add(new_product)
        await db.commit()
        return new_product

    def _db_product_to_response(self, product: Product) -> ProductResponse:
        """Converts SQLAlchemy Product model into normalized ProductResponse schema."""
        nutr = product.nutrition
        if nutr:
            nutrition_data = NutritionData(
                energy_kcal=nutr.energy_kcal or 0.0,
                sugars=nutr.sugars or 0.0,
                added_sugars=nutr.added_sugars,
                fat=nutr.fat or 0.0,
                saturated_fat=nutr.saturated_fat or 0.0,
                trans_fat=nutr.trans_fat or 0.0,
                protein=nutr.protein or 0.0,
                fiber=nutr.fiber or 0.0,
                sodium=nutr.sodium or 0.0,
                salt=nutr.salt or 0.0
            )
        else:
            nutrition_data = NutritionData()

        ingredients = [i.name for i in product.ingredients] if product.ingredients else []
        allergens = [a.name for a in product.allergens] if product.allergens else []

        return ProductResponse(
            barcode=product.barcode,
            product=ProductInfo(
                name=product.name or "Unknown Product",
                brand=product.brand or "Unknown Brand",
                category=product.category or "Uncategorized",
                image=product.image_url
            ),
            nutrition=nutrition_data,
            ingredients=ingredients,
            allergens=allergens,
            allergen_breakdown=AllergenInfo(contains=allergens)
        )
