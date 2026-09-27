import re
from typing import Any, Optional


def validate_barcode(barcode: str) -> str:
    """
    Validates a barcode string.
    Standard food packaging barcodes (EAN-8, UPC-E, UPC-A, EAN-13, ITF-14)
    consist of 7 to 14 numeric digits.
    """
    if not barcode:
        raise ValueError("Barcode cannot be empty.")
    
    cleaned = barcode.strip()
    if not cleaned.isdigit():
        raise ValueError("Barcode must contain only digits.")
    
    if len(cleaned) < 6 or len(cleaned) > 16:
        raise ValueError(f"Invalid barcode length ({len(cleaned)} digits). Expected 7 to 14 digits.")
    
    return cleaned


def is_valid_barcode(barcode: str) -> bool:
    """Returns True if the barcode passes standard format checks."""
    try:
        validate_barcode(barcode)
        return True
    except (ValueError, TypeError):
        return False


def safe_float(val: Any, default: float = 0.0) -> float:
    """Safely converts a value to float, handling nulls, strings, and missing data."""
    if val is None:
        return default
    try:
        f = float(val)
        return round(f, 2)
    except (ValueError, TypeError):
        return default


def clean_text(text: Optional[str]) -> str:
    """Cleans up formatting artifacts, extra spaces, and special symbols from scraped strings."""
    if not text:
        return ""
    # Remove HTML tags if present
    cleaned = re.sub(r"<[^>]+>", "", text)
    # Normalize multiple whitespace characters
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned
