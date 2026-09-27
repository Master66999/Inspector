import pytest
from app.utils.helpers import validate_barcode, is_valid_barcode


def test_valid_barcode():
    assert validate_barcode("5449000000996") == "5449000000996"
    assert validate_barcode("  012345678905 ") == "012345678905"
    assert is_valid_barcode("8901030383748") is True


def test_invalid_barcode_non_numeric():
    with pytest.raises(ValueError, match="only digits"):
        validate_barcode("54490000A0996")
    assert is_valid_barcode("ABC12345") is False


def test_invalid_barcode_length():
    with pytest.raises(ValueError, match="Invalid barcode length"):
        validate_barcode("123")  # too short
    assert is_valid_barcode("1234567890123456789") is False  # too long


def test_empty_barcode():
    with pytest.raises(ValueError, match="cannot be empty"):
        validate_barcode("")
    assert is_valid_barcode("") is False
