from typing import Optional, List, Literal, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

ReviewStatusType = Literal["Draft", "In Review", "Changes Requested", "Approved", "Rejected"]
SeverityType = Literal["critical", "high", "medium", "low"]
RuleType = Literal["terminology", "voice", "prohibited_claim", "mandatory_rule", "preferred_wording", "fact"]
FindingSourceType = Literal["rule_engine", "ai_assisted"]
FindingStatusType = Literal["open", "accepted", "rejected", "edited"]

# --- Brand Profile Models ---
class BrandProfileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    tagline: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    tone_attributes: List[str] = Field(default_factory=list)

class BrandProfileCreate(BrandProfileBase):
    pass

class BrandProfileResponse(BrandProfileBase):
    id: int
    created_at: str
    updated_at: str

# --- Brand Rule Models ---
class BrandRuleBase(BaseModel):
    rule_type: RuleType
    category: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=150)
    description: str = Field(..., min_length=1)
    pattern_or_term: Optional[str] = None
    preferred_term: Optional[str] = None
    severity: SeverityType = "medium"
    rationale: Optional[str] = None

class BrandRuleCreate(BrandRuleBase):
    brand_id: int

class BrandRuleResponse(BrandRuleBase):
    id: int
    brand_id: int
    created_at: str

# --- Brand Fact Models ---
class BrandFactBase(BaseModel):
    fact_key: str = Field(..., min_length=1, max_length=100)
    fact_statement: str = Field(..., min_length=1)
    verified_value: str = Field(..., min_length=1)
    evidence_source: Optional[str] = None

class BrandFactCreate(BrandFactBase):
    brand_id: int

class BrandFactResponse(BrandFactBase):
    id: int
    brand_id: int
    created_at: str

# --- Content Draft Models ---
class ContentDraftCreate(BaseModel):
    brand_id: int
    title: str = Field(..., min_length=1, max_length=200)
    channel: str = Field("Blog Post", max_length=100)
    author: str = Field(..., min_length=1, max_length=100)
    original_text: str = Field(..., min_length=1)

class ContentDraftUpdateText(BaseModel):
    current_text: str = Field(..., min_length=1)
    editor_notes: Optional[str] = None

class ContentDraftResponse(BaseModel):
    id: int
    brand_id: int
    title: str
    channel: str
    author: str
    original_text: str
    current_text: str
    review_status: ReviewStatusType
    reviewer_notes: Optional[str] = None
    created_at: str
    updated_at: str

# --- Analysis Finding Models ---
class AnalysisFindingResponse(BaseModel):
    id: int
    draft_id: int
    rule_id: Optional[int] = None
    fact_id: Optional[int] = None
    finding_source: FindingSourceType
    rule_type: str
    severity: SeverityType
    title: str
    explanation: str
    evidence: str
    matched_text: Optional[str] = None
    start_char: Optional[int] = None
    end_char: Optional[int] = None
    suggested_correction: Optional[str] = None
    status: FindingStatusType
    user_applied_text: Optional[str] = None
    created_at: str

class ApplyCorrectionRequest(BaseModel):
    action: Literal["accept", "reject", "edit"]
    custom_correction: Optional[str] = None  # Used if action is 'edit'

# --- Review Workflow Models ---
class ReviewTransitionRequest(BaseModel):
    to_status: ReviewStatusType
    reviewer_name: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = None

class ReviewHistoryResponse(BaseModel):
    id: int
    draft_id: int
    from_status: str
    to_status: str
    changed_by: str
    notes: Optional[str] = None
    timestamp: str

# --- Analysis Run Response ---
class AnalysisRunResponse(BaseModel):
    draft_id: int
    total_findings: int
    findings: List[AnalysisFindingResponse]
    rules_checked: int
    facts_checked: int
    ai_assisted_used: bool
    ai_status_message: Optional[str] = None

# --- Brand Trust Report Model ---
class BrandTrustReportResponse(BaseModel):
    draft_id: int
    draft_title: str
    review_status: ReviewStatusType
    publication_readiness: str
    is_approval_blocked: bool
    blockers: List[str]
    unresolved_by_severity: dict[str, int]
    total_unresolved: int
    unresolved_by_category: dict[str, int]
    resolved_summary: dict[str, int]
    evidence_references: List[dict[str, Any]]
    calculation_basis: str
    generated_at: str

# ================= ROUND 3 MODELS =================

# --- 1. Visual Governance Models ---
class VisualColorItem(BaseModel):
    hex: str = Field(..., pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    name: str = Field("Brand Color", max_length=50)
    role: str = Field("primary", max_length=30) # 'primary', 'secondary', 'accent', 'neutral'

class LogoRulesModel(BaseModel):
    aspect_ratio_min: float = 0.5
    aspect_ratio_max: float = 3.5
    clearspace_ratio: float = 0.1
    min_resolution_px: int = 100

class TypographyRulesModel(BaseModel):
    primary_font: str = "Inter"
    secondary_font: str = "Outfit"
    max_type_scale: float = 3.0

class VisualProfileBase(BaseModel):
    primary_colors: List[VisualColorItem] = Field(default_factory=list)
    secondary_colors: List[VisualColorItem] = Field(default_factory=list)
    logo_rules: LogoRulesModel = Field(default_factory=LogoRulesModel)
    typography_rules: TypographyRulesModel = Field(default_factory=TypographyRulesModel)
    guidelines: Optional[str] = None

class VisualProfileCreate(VisualProfileBase):
    pass

class VisualProfileResponse(VisualProfileBase):
    id: int
    brand_id: int
    created_at: str
    updated_at: str

class VisualViolationItem(BaseModel):
    category: str # 'Color Deviation', 'Logo Aspect Ratio', 'Typography', 'Resolution', 'Slide Layout'
    severity: SeverityType # 'critical', 'high', 'medium', 'low'
    title: str
    explanation: str
    recommendation: str
    detected_value: Optional[str] = None
    expected_value: Optional[str] = None

class DominantColorItem(BaseModel):
    hex: str
    percentage: float
    is_approved: bool = False
    nearest_approved_hex: Optional[str] = None
    delta_e: Optional[float] = None

class VisualAssetResponse(BaseModel):
    id: int
    brand_id: int
    filename: str
    original_name: str
    mime_type: str
    file_size: int
    file_path: str
    width: int
    height: int
    asset_type: str # 'image' or 'pptx'
    audit_score: float
    audit_status: str # 'pending', 'passed', 'flagged', 'failed'
    dominant_colors: List[DominantColorItem] = Field(default_factory=list)
    audit_results: Dict[str, Any] = Field(default_factory=dict)
    created_at: str

# --- 2. Brand Voice Intelligence Models ---
class VoiceSampleCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    source: Optional[str] = Field("Marketing Sample", max_length=100)
    sample_text: str = Field(..., min_length=20)

class VoiceSampleResponse(BaseModel):
    id: int
    brand_id: int
    title: str
    source: Optional[str]
    sample_text: str
    word_count: int
    created_at: str

class VoiceProfileResponse(BaseModel):
    id: int
    brand_id: int
    sample_count: int
    total_words: int
    formality_score: float # 0 - 100
    avg_sentence_length: float # words per sentence
    vocab_complexity: float # 0 - 100
    active_voice_ratio: float # 0 - 100%
    tone_attributes: List[str]
    preferred_terms: List[str]
    style_guidelines: List[str]
    generated_at: str
    updated_at: str

class VoiceDeviationItem(BaseModel):
    metric: str
    severity: SeverityType
    current_value: str
    target_value: str
    explanation: str
    recommendation: str

class VoiceAnalysisResponse(BaseModel):
    draft_id: Optional[int] = None
    brand_id: int
    consistency_score: float # 0 - 100
    formality_score: float
    avg_sentence_length: float
    vocab_complexity: float
    active_voice_ratio: float
    benchmark_profile: Dict[str, Any]
    deviations: List[VoiceDeviationItem]
    top_recommendations: List[str]
    analyzed_at: str

# --- 3. CMS & Headless Webhook Models ---
class CMSPublishCheckRequest(BaseModel):
    brand_id: int
    cms_platform: str = Field("WordPress", max_length=50) # 'WordPress', 'Contentful', 'Webflow', 'HubSpot', 'Custom'
    title: str = Field(..., min_length=1, max_length=200)
    channel: str = Field("Website Blog", max_length=100)
    content: str = Field(..., min_length=1)
    author: str = Field("CMS Author", max_length=100)
    external_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CMSPublishCheckResponse(BaseModel):
    decision: Literal["ALLOW", "BLOCK"]
    allowed: bool
    summary: str
    blockers: List[str]
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    findings: List[AnalysisFindingResponse]
    audit_log_id: int
    cms_platform: str
    checked_at: str

class CMSPublicationLogResponse(BaseModel):
    id: int
    brand_id: int
    cms_platform: str
    title: str
    channel: str
    external_id: Optional[str]
    author: Optional[str]
    decision: str
    allowed: int
    blockers: List[str]
    findings_summary: Dict[str, Any]
    payload_preview: Optional[str]
    timestamp: str

