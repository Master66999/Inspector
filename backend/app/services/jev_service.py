import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger("packcheck.services.jev")

DEFAULT_JEV_API_URL = "https://api.typesafe.ai/v1/systemone"
DEFAULT_JEV_MODEL = "jev-latest"


class JevService:
    """
    Integration service for Jev AI (TypeSafe AI System One decision engine).
    Acts as a high-speed, bounded, typed classification layer that receives
    structured product facts and PackCheck deterministic flags.
    Never invents product facts or makes unauthorized medical diagnoses.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 4.0
    ):
        self.api_key = api_key or os.getenv("JEV_API_KEY")
        self.api_url = api_url or os.getenv("JEV_API_URL", DEFAULT_JEV_API_URL)
        self.model = model or os.getenv("JEV_MODEL", DEFAULT_JEV_MODEL)
        self.timeout = timeout_seconds

    async def evaluate_product(
        self,
        product_name: str,
        category: str,
        ingredients: List[str],
        nutrition: Dict[str, Any],
        packcheck_flags: List[str]
    ) -> Dict[str, Any]:
        """
        Sends structured product information and PackCheck flags to Jev System One
        and returns a validated classification object.
        Gracefully returns unavailable status on missing keys or network failure.
        """
        # If API key is not configured, safely return unavailable without crashing
        if not self.api_key or not self.api_key.strip():
            logger.info("JEV_API_KEY not configured; AI evaluation unavailable.")
            return {
                "available": False,
                "reason": "AI evaluation temporarily unavailable (JEV_API_KEY not configured)"
            }

        # Build clean, structured context payload
        structured_state = {
            "product_name": product_name or "Unknown Product",
            "category": category or "Food & Beverage",
            "ingredients": ingredients or [],
            "nutrition": {
                "sugar_g": float(nutrition.get("sugar", 0.0) or nutrition.get("sugars", 0.0) or 0.0),
                "fat_g": float(nutrition.get("fat", 0.0) or 0.0),
                "saturated_fat_g": float(nutrition.get("saturated_fat", 0.0) or 0.0),
                "sodium_mg": float(nutrition.get("sodium", 0.0) or 0.0),
                "protein_g": float(nutrition.get("protein", 0.0) or 0.0),
                "calories_kcal": float(nutrition.get("calories", 0.0) or nutrition.get("energy_kcal", 0.0) or 0.0)
            },
            "packcheck_flags": packcheck_flags or []
        }

        # Format questions for Jev System One typed decisions
        payload = {
            "model": self.model,
            "state": json.dumps(structured_state),
            "questions": {
                "overall_profile": {
                    "type": "choice",
                    "instructions": "Classify the dietary balance profile for this food product based strictly on provided nutritional flags.",
                    "options": ["HEALTHY", "MODERATE", "LIMIT"]
                },
                "sugar_level": {
                    "type": "choice",
                    "instructions": "Determine the sugar content classification level.",
                    "options": ["LOW", "MODERATE", "HIGH"]
                },
                "sodium_level": {
                    "type": "choice",
                    "instructions": "Determine the sodium content classification level.",
                    "options": ["LOW", "MODERATE", "HIGH"]
                }
            }
        }

        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)

                if response.status_code != 200:
                    logger.warning(
                        f"Jev API returned HTTP {response.status_code}: {response.text[:200]}"
                    )
                    return {
                        "available": False,
                        "reason": "AI evaluation temporarily unavailable"
                    }

                data = response.json()
                return self._parse_jev_response(data, packcheck_flags, structured_state)

        except httpx.TimeoutException:
            logger.warning("Jev API request timed out.")
            return {
                "available": False,
                "reason": "AI evaluation temporarily unavailable (Request timed out)"
            }
        except Exception as exc:
            # Ensure no credentials are exposed in logs
            logger.warning(f"Error during Jev AI evaluation: {type(exc).__name__}")
            return {
                "available": False,
                "reason": "AI evaluation temporarily unavailable"
            }

    def _parse_jev_response(
        self,
        data: Dict[str, Any],
        packcheck_flags: List[str],
        state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Parses Jev System One decision answers into PackCheck's standardized evaluation schema.
        Supports both System One 'answers' and direct key mappings.
        """
        answers = data.get("answers", data)

        def extract_choice(key: str, default: str) -> str:
            val = answers.get(key, {})
            if isinstance(val, dict):
                return str(val.get("choice", val.get("value", default))).upper()
            if isinstance(val, str):
                return val.upper()
            return default

        overall_profile = extract_choice("overall_profile", "MODERATE")
        sugar_level = extract_choice("sugar_level", "MODERATE")
        sodium_level = extract_choice("sodium_level", "LOW")

        # Compile explainable reason codes & concise non-medical explanation bullet points
        concerns = list(packcheck_flags)
        reason_codes = list(packcheck_flags)

        explanations: List[str] = []
        if "HIGH_SUGAR" in packcheck_flags:
            explanations.append("High sugar content exceeding recommended daily reference limits")
        if "HIGH_SODIUM" in packcheck_flags:
            explanations.append("Elevated sodium density per standard serving")
        if "HIGH_SATURATED_FAT" in packcheck_flags:
            explanations.append("High saturated fat formulation")
        if "HIGH_FAT" in packcheck_flags:
            explanations.append("High total fat content")
        if "ADDITIVE_PRESENT" in packcheck_flags:
            explanations.append("Formulated with food additives or artificial sweeteners")

        if not explanations:
            explanations.append("Nutritional parameters within balanced benchmark ranges")

        # Detailed Statutory Compliance Intelligence for Food Safety Inspectors
        is_limit = overall_profile == "LIMIT" or "HIGH_SUGAR" in packcheck_flags or "HIGH_SATURATED_FAT" in packcheck_flags
        is_moderate = overall_profile == "MODERATE" or "HIGH_SODIUM" in packcheck_flags or "HIGH_FAT" in packcheck_flags

        if is_limit:
            compliance_verdict = "NON-COMPLIANT (FLAGGED)"
            risk_severity = "HIGH RISK"
            statutory_action = "Issue Improvement Notice under FSS Act Section 32; Mandate Front-of-Pack Warning Tag per FSSR 2020"
            priority = "URGENT_INSPECTION"
        elif is_moderate:
            compliance_verdict = "CONDITIONAL PASS (CAUTION)"
            risk_severity = "MODERATE RISK"
            statutory_action = "Require laboratory verification of declared tolerances and advisory statements"
            priority = "ROUTINE_MONITORING"
        else:
            compliance_verdict = "STATUTORY COMPLIANT"
            risk_severity = "LOW RISK"
            statutory_action = "Standard periodic surveillance audit"
            priority = "ARCHIVED_COMPLIANT"

        citations: List[str] = []
        if "HIGH_SUGAR" in packcheck_flags:
            citations.append("FSS (Labelling and Display) Regs 2020 Cl. 2.4.4 & WHO 2024 Free Sugar Ceiling (25g/day)")
        if "HIGH_SODIUM" in packcheck_flags:
            citations.append("ICMR-NIN 2024 Daily Salt Threshold (≤ 5g/day) & FSSAI FOPNL Limits")
        if "HIGH_SATURATED_FAT" in packcheck_flags:
            citations.append("FSSAI Table 1 Saturated Fat Ceiling (≤ 5.0g per 100g)")
        if "HIGH_FAT" in packcheck_flags:
            citations.append("WHO/FSSAI Guidance on Total Fat Density (> 17.5g per 100g)")
        if "ADDITIVE_PRESENT" in packcheck_flags:
            citations.append("FSSR 2011 Schedule II Specific Functional Class and INS Code Declaration")
        if "ALLERGEN_PRESENT" in packcheck_flags:
            citations.append("FSS (Packaging and Labelling) Regs Clause 2.2.3 Mandatory Allergen Disclosures")
        if not citations:
            citations.append("FSS Act 2006 Standard Commodity Compliance")

        inspector_briefing = (
            f"Statutory Risk: {risk_severity}. Profile: {overall_profile}. "
            f"Factual Nutritional Flags: {', '.join(packcheck_flags) if packcheck_flags else 'Within permissible ranges'}. "
            f"Enforcement Action: {statutory_action}."
        )

        inspector_audit = {
            "compliance_verdict": compliance_verdict,
            "risk_severity": risk_severity,
            "priority": priority,
            "statutory_action": statutory_action,
            "fssai_citations": citations,
            "inspector_briefing": inspector_briefing,
            "reason_codes": reason_codes
        }

        return {
            "available": True,
            "overall_profile": overall_profile,
            "sugar_level": sugar_level,
            "sodium_level": sodium_level,
            "concerns": concerns,
            "reason_codes": reason_codes,
            "explanation": explanations,
            "inspector_audit": inspector_audit,
            "disclaimer": "AI classification is based strictly on PackCheck's factual nutritional parameters. For dietary guidance only; not medical advice."
        }

        return {
            "available": True,
            "overall_profile": overall_profile,
            "sugar_level": sugar_level,
            "sodium_level": sodium_level,
            "concerns": concerns,
            "reason_codes": reason_codes,
            "explanation": explanations,
            "inspector_audit": inspector_audit,
            "disclaimer": "AI classification is based strictly on PackCheck's factual nutritional parameters. For dietary guidance only; not medical advice."
        }
