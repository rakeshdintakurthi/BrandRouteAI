import os
import sys
import shutil
import logging
from pathlib import Path

# Ensure root directory is in sys.path regardless of launch cwd
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import init_db
from backend.seed_data import seed_demo_data_if_empty
from backend.models import (
    BrandProfileCreate,
    BrandProfileResponse,
    BrandRuleCreate,
    BrandRuleResponse,
    BrandFactCreate,
    BrandFactResponse,
    ContentDraftCreate,
    ContentDraftUpdateText,
    ContentDraftResponse,
    AnalysisFindingResponse,
    ApplyCorrectionRequest,
    ReviewTransitionRequest,
    ReviewHistoryResponse,
    AnalysisRunResponse,
    BrandTrustReportResponse,
    VisualProfileCreate,
    VisualProfileResponse,
    VisualAssetResponse,
    VoiceSampleCreate,
    VoiceSampleResponse,
    VoiceProfileResponse,
    VoiceAnalysisResponse,
    CMSPublishCheckRequest,
    CMSPublishCheckResponse,
    CMSPublicationLogResponse,
)
import backend.crud as crud
from backend.rules_engine import analyze_draft_with_rules
from backend.ai_engine import analyze_draft_with_gemini
from backend.visual_engine import audit_image_asset, audit_pptx_asset
from backend.voice_engine import generate_brand_voice_profile, compare_draft_to_voice_profile
from backend.cms_gateway import evaluate_cms_publication, get_platform_adapters_info

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("brandproof.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed demo data
    logger.info("Initializing SQLite database...")
    init_db()
    seed_demo_data_if_empty()
    logger.info(f"BrandRoute AI backend startup complete. AI enabled: {settings.has_ai}")
    yield
    logger.info("BrandRoute AI backend shutting down...")

app = FastAPI(
    title="BrandRoute AI API",
    description="AI-powered brand governance, voice compliance, and fact verification platform.",
    version="1.0.0-mvp",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ----------------- BASE & HEALTH ENDPOINTS -----------------

@app.get("/", tags=["System"])
def get_app_info():
    """Application metadata and system status."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "description": "AI-powered brand governance & fact verification web application",
        "features": [
            "Deterministic Rule Engine (Terminology, Claims, Style, Voice)",
            "Verified Brand Facts & Factual Consistency Checker",
            "Google Gemini AI Governance Auditor (Nuanced claims, tone subtleties)",
            "Interactive Correction Workflow (Accept, Edit, Reject)",
            "Governed Review State Machine (Draft -> In Review -> Changes Requested / Approved / Rejected)"
        ],
        "ai_active": settings.has_ai,
        "ai_model": settings.gemini_model if settings.has_ai else "None (Deterministic rule engine only)",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["System"])
def health_check():
    """Health status endpoint."""
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "ai_configured": settings.has_ai,
    }

# ----------------- BRAND PROFILES -----------------

@app.post("/api/brands", response_model=BrandProfileResponse, status_code=status.HTTP_201_CREATED, tags=["Brand Profiles"])
def create_brand(profile: BrandProfileCreate):
    try:
        return crud.create_brand_profile(profile)
    except Exception as e:
        logger.error(f"Error creating brand profile: {e}")
        raise HTTPException(status_code=400, detail=f"Brand profile could not be created: {str(e)}")

@app.get("/api/brands", response_model=List[BrandProfileResponse], tags=["Brand Profiles"])
def list_brands():
    return crud.list_brand_profiles()

@app.get("/api/brands/{brand_id}", response_model=BrandProfileResponse, tags=["Brand Profiles"])
def get_brand(brand_id: int):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    return brand

# ----------------- BRAND RULES -----------------

@app.post("/api/rules", response_model=BrandRuleResponse, status_code=status.HTTP_201_CREATED, tags=["Brand Rules"])
def create_rule(rule: BrandRuleCreate):
    brand = crud.get_brand_profile(rule.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{rule.brand_id} not found")
    return crud.create_brand_rule(rule)

@app.get("/api/brands/{brand_id}/rules", response_model=List[BrandRuleResponse], tags=["Brand Rules"])
def list_rules(brand_id: int):
    return crud.list_brand_rules(brand_id)

@app.delete("/api/rules/{rule_id}", tags=["Brand Rules"])
def delete_rule(rule_id: int):
    deleted = crud.delete_brand_rule(rule_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Rule #{rule_id} not found")
    return {"message": f"Rule #{rule_id} deleted successfully"}

# ----------------- BRAND FACTS -----------------

@app.post("/api/facts", response_model=BrandFactResponse, status_code=status.HTTP_201_CREATED, tags=["Brand Facts"])
def create_fact(fact: BrandFactCreate):
    brand = crud.get_brand_profile(fact.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{fact.brand_id} not found")
    return crud.create_brand_fact(fact)

@app.get("/api/brands/{brand_id}/facts", response_model=List[BrandFactResponse], tags=["Brand Facts"])
def list_facts(brand_id: int):
    return crud.list_brand_facts(brand_id)

@app.delete("/api/facts/{fact_id}", tags=["Brand Facts"])
def delete_fact(fact_id: int):
    deleted = crud.delete_brand_fact(fact_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Fact #{fact_id} not found")
    return {"message": f"Fact #{fact_id} deleted successfully"}

# ----------------- CONTENT DRAFTS -----------------

@app.post("/api/drafts", response_model=ContentDraftResponse, status_code=status.HTTP_201_CREATED, tags=["Content Drafts"])
def submit_draft(draft: ContentDraftCreate):
    brand = crud.get_brand_profile(draft.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{draft.brand_id} not found")
    return crud.create_content_draft(draft)

@app.get("/api/drafts", response_model=List[ContentDraftResponse], tags=["Content Drafts"])
def list_drafts(brand_id: Optional[int] = Query(None)):
    return crud.list_content_drafts(brand_id)

@app.get("/api/drafts/{draft_id}", response_model=ContentDraftResponse, tags=["Content Drafts"])
def get_draft(draft_id: int):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return draft

@app.put("/api/drafts/{draft_id}", response_model=ContentDraftResponse, tags=["Content Drafts"])
def update_draft(draft_id: int, payload: ContentDraftUpdateText):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    updated = crud.update_draft_text(draft_id, payload.current_text, payload.editor_notes)
    return updated

# ----------------- GOVERNANCE ANALYSIS -----------------

@app.post("/api/drafts/{draft_id}/analyze", response_model=AnalysisRunResponse, tags=["Analysis"])
async def run_governance_analysis(draft_id: int, run_ai: bool = Query(True)):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")

    brand_id = draft["brand_id"]
    profile = crud.get_brand_profile(brand_id)
    rules = crud.list_brand_rules(brand_id)
    facts = crud.list_brand_facts(brand_id)

    # 1. Clear prior findings for fresh run
    crud.clear_open_findings(draft_id)

    # 2. Run deterministic rule-based checks
    rule_findings = analyze_draft_with_rules(
        draft_text=draft["current_text"],
        rules=rules,
        facts=facts,
        profile=profile
    )

    all_findings = list(rule_findings)
    ai_used = False
    ai_status = "AI analysis skipped by user parameter."

    # 3. If requested and available, run AI-assisted checks
    if run_ai:
        ai_findings, ai_used, ai_status = await analyze_draft_with_gemini(
            draft_text=draft["current_text"],
            rules=rules,
            facts=facts,
            profile=profile
        )
        if ai_findings:
            # Filter duplicates if AI matched the same phrase
            existing_matches = {f.get("matched_text", "").lower() for f in rule_findings if f.get("matched_text")}
            for af in ai_findings:
                if af.get("matched_text", "").lower() not in existing_matches:
                    all_findings.append(af)

    # 4. Save findings to database
    saved = crud.save_findings(draft_id, all_findings)

    return AnalysisRunResponse(
        draft_id=draft_id,
        total_findings=len(saved),
        findings=saved,
        rules_checked=len(rules),
        facts_checked=len(facts),
        ai_assisted_used=ai_used,
        ai_status_message=ai_status
    )

@app.get("/api/drafts/{draft_id}/findings", response_model=List[AnalysisFindingResponse], tags=["Analysis"])
def get_findings(draft_id: int):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return crud.get_draft_findings(draft_id)

@app.get("/api/drafts/{draft_id}/trust-report", response_model=BrandTrustReportResponse, tags=["Analysis"])
def get_draft_trust_report(draft_id: int):
    """
    Computes and returns the Brand Trust Report summarizing the selected draft's
    governance state: severity breakdown, category issues, resolved corrections,
    approval blockers, and transparent publication readiness.
    """
    report = crud.generate_brand_trust_report(draft_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return report


# ----------------- CORRECTION ACTIONS -----------------

@app.post("/api/findings/{finding_id}/action", tags=["Analysis"])
def apply_correction(finding_id: int, payload: ApplyCorrectionRequest):
    success, message, finding, draft = crud.apply_finding_action(
        finding_id=finding_id,
        action=payload.action,
        custom_correction=payload.custom_correction
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {
        "success": True,
        "message": message,
        "finding": finding,
        "draft": draft
    }

# ----------------- REVIEW WORKFLOW & STATE TRANSITIONS -----------------

@app.post("/api/drafts/{draft_id}/review-transition", tags=["Review Workflow"])
def transition_draft_review(draft_id: int, payload: ReviewTransitionRequest):
    success, message, updated_draft = crud.transition_review_status(
        draft_id=draft_id,
        to_status=payload.to_status,
        reviewer_name=payload.reviewer_name,
        notes=payload.notes
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {
        "success": True,
        "message": message,
        "draft": updated_draft
    }

@app.get("/api/drafts/{draft_id}/review-history", response_model=List[ReviewHistoryResponse], tags=["Review Workflow"])
def get_draft_review_history(draft_id: int):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return crud.get_review_history(draft_id)

# ----------------- DEMO SEED RESET -----------------

@app.post("/api/seed", tags=["System"])
def seed_demo():
    """Seeds or resets the demo brand with rules, facts, and drafts."""
    brand_id = seed_demo_data_if_empty()
    return {"message": "Demo data seeded successfully", "brand_id": brand_id}

# ================= ROUND 3 ENDPOINTS =================

# ----------------- 1. VISUAL GOVERNANCE -----------------

@app.get("/api/brands/{brand_id}/visual-profile", response_model=VisualProfileResponse, tags=["Visual Governance"])
def get_visual_profile(brand_id: int):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    profile = crud.get_brand_visual_profile(brand_id)
    if not profile:
        # Generate default starter profile
        profile = crud.upsert_brand_visual_profile(brand_id, {
            "primary_colors": [
                {"hex": "#2563eb", "name": "Royal Cobalt", "role": "primary"},
                {"hex": "#0f172a", "name": "Deep Midnight Navy", "role": "primary"}
            ],
            "secondary_colors": [
                {"hex": "#10b981", "name": "Emerald Growth", "role": "secondary"},
                {"hex": "#6366f1", "name": "Electric Indigo", "role": "secondary"}
            ],
            "logo_rules": {"aspect_ratio_min": 0.5, "aspect_ratio_max": 3.8, "clearspace_ratio": 0.15, "min_resolution_px": 150},
            "typography_rules": {"primary_font": "Inter", "secondary_font": "Outfit", "max_type_scale": 2.5},
            "guidelines": "Ensure high contrast on dark backgrounds. Primary buttons must use #2563eb."
        })
    return profile

@app.put("/api/brands/{brand_id}/visual-profile", response_model=VisualProfileResponse, tags=["Visual Governance"])
def update_visual_profile(brand_id: int, payload: VisualProfileCreate):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    return crud.upsert_brand_visual_profile(brand_id, payload.model_dump())

@app.get("/api/brands/{brand_id}/visual-assets", response_model=List[VisualAssetResponse], tags=["Visual Governance"])
def get_visual_assets(brand_id: int):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    return crud.list_visual_assets(brand_id)

@app.post("/api/brands/{brand_id}/visual-assets/upload", response_model=VisualAssetResponse, tags=["Visual Governance"])
async def upload_visual_asset(brand_id: int, file: UploadFile = File(...)):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")

    # Validate file extension and MIME type
    allowed_extensions = {".png", ".jpg", ".jpeg", ".pptx"}
    file_ext = Path(file.filename or "").suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file_ext}'. Allowed formats: PNG, JPG, JPEG, PPTX."
        )

    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds 10MB limit (uploaded: {round(len(content) / (1024*1024), 2)}MB)."
        )

    # Generate safe unique filename
    safe_filename = f"asset_{brand_id}_{int(datetime.now(timezone.utc).timestamp())}_{Path(file.filename).name}"
    save_path = UPLOAD_DIR / safe_filename
    with open(save_path, "wb") as f:
        f.write(content)

    asset_type = "pptx" if file_ext == ".pptx" else "image"
    relative_url = f"/uploads/{safe_filename}"

    # Fetch brand visual identity guidelines
    v_profile = crud.get_brand_visual_profile(brand_id)
    if not v_profile:
        v_profile = crud.upsert_brand_visual_profile(brand_id, {
            "primary_colors": [{"hex": "#2563eb", "name": "Royal Cobalt", "role": "primary"}, {"hex": "#0f172a", "name": "Midnight Navy", "role": "primary"}],
            "secondary_colors": [{"hex": "#10b981", "name": "Emerald", "role": "secondary"}],
            "logo_rules": {"aspect_ratio_min": 0.5, "aspect_ratio_max": 3.8, "min_resolution_px": 100},
            "typography_rules": {"primary_font": "Inter", "secondary_font": "Outfit"}
        })

    # Run audit immediately
    if asset_type == "pptx":
        audit_res = audit_pptx_asset(str(save_path), v_profile, file.filename)
        width, height = 1920, 1080
    else:
        audit_res = audit_image_asset(str(save_path), v_profile, file.filename)
        width = audit_res.get("dimensions", {}).get("width", 800)
        height = audit_res.get("dimensions", {}).get("height", 600)

    asset = crud.create_visual_asset(
        brand_id=brand_id,
        filename=safe_filename,
        original_name=file.filename or safe_filename,
        mime_type=file.content_type or ("application/vnd.openxmlformats-officedocument.presentationml.presentation" if file_ext == ".pptx" else "image/png"),
        file_size=len(content),
        file_path=relative_url,
        width=width,
        height=height,
        asset_type=asset_type,
        audit_score=audit_res.get("score", 100.0),
        audit_status=audit_res.get("status", "passed"),
        dominant_colors=audit_res.get("dominant_colors", []),
        audit_results=audit_res
    )

    return asset

@app.post("/api/visual-assets/{asset_id}/audit", response_model=VisualAssetResponse, tags=["Visual Governance"])
def reaudit_visual_asset(asset_id: int):
    asset = crud.get_visual_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Visual asset #{asset_id} not found")

    brand_id = asset["brand_id"]
    v_profile = crud.get_brand_visual_profile(brand_id) or {}
    
    file_path = UPLOAD_DIR / asset["filename"]
    if not file_path.exists():
        # Use synthetic re-audit if physical file is absent
        audit_res = asset.get("audit_results") or {
            "score": 92.0, "status": "passed", "violations": [], "dominant_colors": asset.get("dominant_colors", [])
        }
        return asset

    if asset["asset_type"] == "pptx":
        audit_res = audit_pptx_asset(str(file_path), v_profile, asset["original_name"])
    else:
        audit_res = audit_image_asset(str(file_path), v_profile, asset["original_name"])

    updated = crud.update_visual_asset_audit(
        asset_id=asset_id,
        audit_score=audit_res["score"],
        audit_status=audit_res["status"],
        dominant_colors=audit_res.get("dominant_colors", []),
        audit_results=audit_res,
        width=audit_res.get("dimensions", {}).get("width"),
        height=audit_res.get("dimensions", {}).get("height")
    )
    return updated

@app.delete("/api/visual-assets/{asset_id}", tags=["Visual Governance"])
def delete_visual_asset(asset_id: int):
    asset = crud.get_visual_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Visual asset #{asset_id} not found")
    crud.delete_visual_asset(asset_id)
    return {"success": True, "message": f"Asset #{asset_id} removed"}

# ----------------- 2. BRAND VOICE INTELLIGENCE -----------------

@app.get("/api/brands/{brand_id}/voice-samples", response_model=List[VoiceSampleResponse], tags=["Brand Voice Intelligence"])
def get_voice_samples(brand_id: int):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    return crud.list_voice_samples(brand_id)

@app.post("/api/brands/{brand_id}/voice-samples", response_model=VoiceSampleResponse, status_code=status.HTTP_201_CREATED, tags=["Brand Voice Intelligence"])
def add_voice_sample(brand_id: int, payload: VoiceSampleCreate):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    
    words = len(payload.sample_text.strip().split())
    if words < 10:
        raise HTTPException(status_code=400, detail="Writing sample is too brief (minimum 10 words required).")

    sample = crud.create_voice_sample(
        brand_id=brand_id,
        title=payload.title,
        source=payload.source or "Marketing Sample",
        sample_text=payload.sample_text,
        word_count=words
    )
    return sample

@app.delete("/api/brands/{brand_id}/voice-samples/{sample_id}", tags=["Brand Voice Intelligence"])
def delete_voice_sample(brand_id: int, sample_id: int):
    success = crud.delete_voice_sample(sample_id)
    if not success:
        raise HTTPException(status_code=404, detail="Voice sample not found")
    return {"success": True, "message": f"Voice sample #{sample_id} deleted"}

@app.get("/api/brands/{brand_id}/voice-profile", response_model=VoiceProfileResponse, tags=["Brand Voice Intelligence"])
def get_voice_profile(brand_id: int):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    profile = crud.get_brand_voice_profile(brand_id)
    if not profile:
        samples = crud.list_voice_samples(brand_id)
        learned = generate_brand_voice_profile(samples, brand["name"])
        profile = crud.upsert_brand_voice_profile(brand_id, learned)
    return profile

@app.post("/api/brands/{brand_id}/voice-profile/generate", response_model=VoiceProfileResponse, tags=["Brand Voice Intelligence"])
def generate_voice_profile_endpoint(brand_id: int):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    samples = crud.list_voice_samples(brand_id)
    learned = generate_brand_voice_profile(samples, brand["name"])
    return crud.upsert_brand_voice_profile(brand_id, learned)

@app.post("/api/drafts/{draft_id}/voice-analysis", response_model=VoiceAnalysisResponse, tags=["Brand Voice Intelligence"])
def analyze_draft_voice(draft_id: int):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    brand_id = draft["brand_id"]
    profile = crud.get_brand_voice_profile(brand_id)
    if not profile:
        samples = crud.list_voice_samples(brand_id)
        brand = crud.get_brand_profile(brand_id) or {"name": "Brand"}
        profile = crud.upsert_brand_voice_profile(brand_id, generate_brand_voice_profile(samples, brand["name"]))

    analysis = compare_draft_to_voice_profile(draft["current_text"], profile)
    analysis["draft_id"] = draft_id
    analysis["brand_id"] = brand_id
    analysis["analyzed_at"] = datetime.now(timezone.utc).isoformat()
    return analysis

@app.post("/api/brands/{brand_id}/voice-analysis", response_model=VoiceAnalysisResponse, tags=["Brand Voice Intelligence"])
def analyze_custom_text_voice(brand_id: int, payload: Dict[str, str]):
    text = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")
    profile = crud.get_brand_voice_profile(brand_id)
    if not profile:
        samples = crud.list_voice_samples(brand_id)
        brand = crud.get_brand_profile(brand_id) or {"name": "Brand"}
        profile = crud.upsert_brand_voice_profile(brand_id, generate_brand_voice_profile(samples, brand["name"]))

    analysis = compare_draft_to_voice_profile(text, profile)
    analysis["draft_id"] = None
    analysis["brand_id"] = brand_id
    analysis["analyzed_at"] = datetime.now(timezone.utc).isoformat()
    return analysis

# ----------------- 3. CMS & HEADLESS INTEGRATIONS -----------------

@app.post("/api/integrations/cms/publish-check", response_model=CMSPublishCheckResponse, tags=["CMS Integrations"])
def check_cms_publication(payload: CMSPublishCheckRequest):
    brand = crud.get_brand_profile(payload.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand #{payload.brand_id} not found")

    result = evaluate_cms_publication(
        brand_id=payload.brand_id,
        cms_platform=payload.cms_platform,
        title=payload.title,
        channel=payload.channel,
        content=payload.content,
        author=payload.author,
        external_id=payload.external_id,
        metadata=payload.metadata
    )
    return result

@app.get("/api/integrations/cms/logs", response_model=List[CMSPublicationLogResponse], tags=["CMS Integrations"])
def get_cms_publication_logs(brand_id: Optional[int] = Query(None), limit: int = Query(50)):
    return crud.list_cms_publication_logs(brand_id=brand_id, limit=limit)

@app.get("/api/integrations/cms/adapters", tags=["CMS Integrations"])
def get_cms_adapters():
    return {
        "adapters": get_platform_adapters_info(),
        "gateway_endpoint": "/api/integrations/cms/publish-check",
        "documentation": "Connect any CMS webhook to pre-validate publication content against BrandRoute governance rules."
    }

