import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Integer,
    Boolean,
    JSON,
    Table,
)
from sqlalchemy.orm import relationship
from .connection import Base


def utc_now():
    return datetime.now(timezone.utc)


# Many-to-Many association tables
product_ingredients = Table(
    "product_ingredients",
    Base.metadata,
    Column("product_id", String, ForeignKey("products.id"), primary_key=True),
    Column("ingredient_id", String, ForeignKey("ingredients.id"), primary_key=True),
)

product_allergens = Table(
    "product_allergens",
    Base.metadata,
    Column("product_id", String, ForeignKey("products.id"), primary_key=True),
    Column("allergen_id", String, ForeignKey("allergens.id"), primary_key=True),
    Column("status", String, default="contains"),  # 'contains' or 'may_contain'
)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    scans = relationship("ScanHistory", back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    barcode = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, default="Unknown Product")
    brand = Column(String, nullable=True, default="Unknown Brand")
    category = Column(String, nullable=True, default="Uncategorized")
    image_url = Column(String, nullable=True)
    source = Column(String, default="openfoodfacts")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    nutrition = relationship("Nutrition", back_populates="product", uselist=False, cascade="all, delete-orphan")
    ingredients = relationship("Ingredient", secondary=product_ingredients, back_populates="products")
    allergens = relationship("Allergen", secondary=product_allergens, back_populates="products")
    analyses = relationship("ProductAnalysis", back_populates="product", cascade="all, delete-orphan")
    scans = relationship("ScanHistory", back_populates="product", cascade="all, delete-orphan")


class Nutrition(Base):
    __tablename__ = "nutrition"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)

    energy_kcal = Column(Float, default=0.0)
    sugars = Column(Float, default=0.0)
    added_sugars = Column(Float, nullable=True)
    fat = Column(Float, default=0.0)
    saturated_fat = Column(Float, default=0.0)
    trans_fat = Column(Float, default=0.0)
    protein = Column(Float, default=0.0)
    fiber = Column(Float, default=0.0)
    sodium = Column(Float, default=0.0)
    salt = Column(Float, default=0.0)

    product = relationship("Product", back_populates="nutrition")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False)
    ingredient_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    common_use = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    products = relationship("Product", secondary=product_ingredients, back_populates="ingredients")


class Allergen(Base):
    __tablename__ = "allergens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False)

    products = relationship("Product", secondary=product_allergens, back_populates="allergens")


class ProductAnalysis(Base):
    __tablename__ = "product_analysis"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    analysis_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    product = relationship("Product", back_populates="analyses")


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    scanned_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="scans")
    product = relationship("Product", back_populates="scans")
