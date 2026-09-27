from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class JevEvaluation(BaseModel):
    """
    Standardized Jev AI classification output.
    Gracefully handles unavailable state if external Jev AI API fails or is unconfigured.
    """
    model_config = ConfigDict(from_attributes=True, extra="allow")

    available: bool = Field(default=True, description="Whether Jev AI evaluation was completed")
    reason: Optional[str] = Field(default=None, description="Reason message if AI evaluation is unavailable")
    overall_profile: Optional[str] = Field(default=None, description="LIMIT, MODERATE, or HEALTHY")
    sugar_level: Optional[str] = Field(default=None, description="LOW, MODERATE, or HIGH")
    sodium_level: Optional[str] = Field(default=None, description="LOW, MODERATE, or HIGH")
    concerns: List[str] = Field(default_factory=list, description="Nutritional flags identified as concerns")
    reason_codes: List[str] = Field(default_factory=list, description="Standard reason codes for decision")
    explanation: List[str] = Field(default_factory=list, description="Clear, non-medical explanation bullet points")
    inspector_audit: Optional[dict] = Field(
        default=None,
        description="Detailed statutory compliance audit information for food safety officers and inspectors"
    )
    disclaimer: Optional[str] = Field(
        default="AI classification is based on PackCheck's factual nutritional parameters. For dietary guidance only; not medical advice.",
        description="Statutory non-medical advisory notice"
    )

