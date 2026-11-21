import json
import logging
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timezone
from backend.rules_engine import analyze_draft_with_rules
import backend.crud as crud

logger = logging.getLogger("brandproof.cms_gateway")

SUPPORTED_PLATFORMS = {
    "WordPress": {
        "status": "fully_integrated_and_simulated",
        "description": "WordPress REST API & Publish Hook adapter with pre-flight brand validation.",
        "version": "v2",
        "auth_methods": ["Application Passwords", "OAuth2", "Webhook HMAC"]
    },
    "Webflow": {
        "status": "fully_integrated_and_simulated",
        "description": "Webflow CMS API collection item publish interceptor.",
        "version": "v1",
        "auth_methods": ["Bearer Token", "Site Webhook"]
    },
    "Contentful": {
        "status": "fully_integrated_and_simulated",
        "description": "Contentful Webhook payload validator with pre-publish blocker.",
        "version": "v1",
        "auth_methods": ["Content Management Token", "Secret Signature"]
    },
    "HubSpot": {
        "status": "fully_integrated_and_simulated",
        "description": "HubSpot Marketing Hub & CMS Blog post pre-publish review gateway.",
        "version": "v3",
        "auth_methods": ["Private App Token", "OAuth2"]
    },
    "Custom": {
        "status": "generic_rest_webhook",
        "description": "Generic pre-publication webhook gateway for headless or custom CMS architectures.",
        "version": "v1",
        "auth_methods": ["API Key Header", "HMAC SHA256"]
    }
}

def evaluate_cms_publication(
    brand_id: int,
    cms_platform: str,
    title: str,
    channel: str,
    content: str,
    author: str,
    external_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates a pre-publication request from any CMS.
    Applies strict brand governance policies:
    - Any CRITICAL finding -> AUTOMATIC BLOCK.
    - Two or more HIGH findings -> AUTOMATIC BLOCK.
    - 0 Critical & <= 1 High -> ALLOW with warnings.
    - All decisions are recorded into SQLite audit trail.
    """
    # 1. Fetch brand rules and verified facts
    brand_rules = crud.list_brand_rules(brand_id)
    brand_facts = crud.list_brand_facts(brand_id)
    
    # 2. Run deterministic rule engine
    findings = analyze_draft_with_rules(content, brand_rules, brand_facts)
    
    # 3. Categorize findings
    critical_findings = [f for f in findings if f["severity"] == "critical"]
    high_findings = [f for f in findings if f["severity"] == "high"]
    medium_findings = [f for f in findings if f["severity"] == "medium"]
    low_findings = [f for f in findings if f["severity"] == "low"]
    
    blockers = []
    for f in critical_findings:
        blockers.append(f"Critical Violation [{f['rule_type']}]: {f['title']} (\"{f['evidence']}\")")
        
    if len(high_findings) >= 2:
        blockers.append(f"High Severity Threshold Exceeded: {len(high_findings)} high-severity brand violations detected.")
        
    allowed = (len(critical_findings) == 0 and len(high_findings) < 2)
    decision = "ALLOW" if allowed else "BLOCK"
    
    summary = (
        f"Publication approved for {cms_platform}. Content conforms to verified brand guidelines."
        if allowed
        else f"Publication BLOCKED on {cms_platform}. {len(blockers)} blocking policy violation(s) require editorial resolution."
    )
    
    # Findings summary
    findings_summary = {
        "critical": len(critical_findings),
        "high": len(high_findings),
        "medium": len(medium_findings),
        "low": len(low_findings),
        "total": len(findings)
    }
    
    # Format finding objects for response
    now_iso = datetime.now(timezone.utc).isoformat()
    formatted_findings = []
    for idx, f in enumerate(findings, start=1):
        formatted_findings.append({
            "id": idx,
            "draft_id": 0,
            "rule_id": f.get("rule_id"),
            "fact_id": f.get("fact_id"),
            "finding_source": f.get("finding_source", "rule_engine"),
            "rule_type": f.get("rule_type", "rule"),
            "severity": f.get("severity", "medium"),
            "title": f.get("title", ""),
            "explanation": f.get("explanation", ""),
            "evidence": f.get("evidence", ""),
            "matched_text": f.get("matched_text"),
            "start_char": f.get("start_char"),
            "end_char": f.get("end_char"),
            "suggested_correction": f.get("suggested_correction"),
            "status": "open",
            "user_applied_text": None,
            "created_at": now_iso
        })
        
    # Record in SQLite publication log
    log_record = crud.create_cms_publication_log(
        brand_id=brand_id,
        cms_platform=cms_platform,
        title=title,
        channel=channel,
        external_id=external_id,
        author=author,
        decision=decision,
        allowed=1 if allowed else 0,
        blockers=blockers,
        findings_summary=findings_summary,
        payload_preview=content[:300]
    )
    
    return {
        "decision": decision,
        "allowed": allowed,
        "summary": summary,
        "blockers": blockers,
        "critical_count": len(critical_findings),
        "high_count": len(high_findings),
        "medium_count": len(medium_findings),
        "low_count": len(low_findings),
        "findings": formatted_findings,
        "audit_log_id": log_record["id"],
        "cms_platform": cms_platform,
        "checked_at": now_iso
    }

def get_platform_adapters_info() -> Dict[str, Any]:
    return SUPPORTED_PLATFORMS
