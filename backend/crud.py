import json
from typing import Optional, List, Dict, Any, Tuple
import sqlite3
from backend.database import get_db_connection
from backend.models import (
    BrandProfileCreate,
    BrandRuleCreate,
    BrandFactCreate,
    ContentDraftCreate,
    ReviewStatusType,
)

# ----------------- BRAND PROFILES -----------------

def create_brand_profile(profile: BrandProfileCreate) -> Dict[str, Any]:
    profile_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        tone_json = json.dumps(profile.tone_attributes or [])
        cursor.execute(
            """
            INSERT INTO brand_profiles (name, tagline, description, industry, tone_attributes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (profile.name, profile.tagline, profile.description, profile.industry, tone_json)
        )
        profile_id = cursor.lastrowid
    return get_brand_profile(profile_id)

def get_brand_profile(profile_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_profiles WHERE id = ?", (profile_id,))
        row = cursor.fetchone()
        if not row:
            return None
        data = dict(row)
        data["tone_attributes"] = json.loads(data["tone_attributes"]) if data.get("tone_attributes") else []
        return data

def list_brand_profiles() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_profiles ORDER BY name ASC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["tone_attributes"] = json.loads(d["tone_attributes"]) if d.get("tone_attributes") else []
            result.append(d)
        return result

# ----------------- BRAND RULES -----------------

def create_brand_rule(rule: BrandRuleCreate) -> Dict[str, Any]:
    rule_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO brand_rules (
                brand_id, rule_type, category, title, description,
                pattern_or_term, preferred_term, severity, rationale
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                rule.brand_id, rule.rule_type, rule.category, rule.title, rule.description,
                rule.pattern_or_term, rule.preferred_term, rule.severity, rule.rationale
            )
        )
        rule_id = cursor.lastrowid
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_rules WHERE id = ?", (rule_id,))
        return dict(cursor.fetchone())

def list_brand_rules(brand_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_rules WHERE brand_id = ? ORDER BY severity DESC, id ASC", (brand_id,))
        return [dict(r) for r in cursor.fetchall()]

def delete_brand_rule(rule_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM brand_rules WHERE id = ?", (rule_id,))
        return cursor.rowcount > 0

# ----------------- BRAND FACTS -----------------

def create_brand_fact(fact: BrandFactCreate) -> Dict[str, Any]:
    fact_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO brand_facts (brand_id, fact_key, fact_statement, verified_value, evidence_source)
            VALUES (?, ?, ?, ?, ?)
            """,
            (fact.brand_id, fact.fact_key, fact.fact_statement, fact.verified_value, fact.evidence_source)
        )
        fact_id = cursor.lastrowid
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_facts WHERE id = ?", (fact_id,))
        return dict(cursor.fetchone())

def list_brand_facts(brand_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_facts WHERE brand_id = ? ORDER BY id ASC", (brand_id,))
        return [dict(r) for r in cursor.fetchall()]

def delete_brand_fact(fact_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM brand_facts WHERE id = ?", (fact_id,))
        return cursor.rowcount > 0

# ----------------- CONTENT DRAFTS -----------------

def create_content_draft(draft: ContentDraftCreate) -> Dict[str, Any]:
    draft_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO content_drafts (
                brand_id, title, channel, author, original_text, current_text, review_status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Draft')
            """,
            (
                draft.brand_id, draft.title, draft.channel, draft.author,
                draft.original_text, draft.original_text
            )
        )
        draft_id = cursor.lastrowid
        cursor.execute(
            """
            INSERT INTO review_history (draft_id, from_status, to_status, changed_by, notes)
            VALUES (?, 'None', 'Draft', ?, 'Initial content draft created')
            """,
            (draft_id, draft.author)
        )
    return get_content_draft(draft_id)

def get_content_draft(draft_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM content_drafts WHERE id = ?", (draft_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def list_content_drafts(brand_id: Optional[int] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if brand_id:
            cursor.execute("SELECT * FROM content_drafts WHERE brand_id = ? ORDER BY id DESC", (brand_id,))
        else:
            cursor.execute("SELECT * FROM content_drafts ORDER BY id DESC")
        return [dict(r) for r in cursor.fetchall()]

def update_draft_text(draft_id: int, new_text: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE content_drafts
            SET current_text = ?, reviewer_notes = COALESCE(?, reviewer_notes), updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (new_text, notes, draft_id)
        )
    return get_content_draft(draft_id)

# ----------------- REVIEW WORKFLOW -----------------

VALID_TRANSITIONS = {
    "Draft": ["In Review"],
    "In Review": ["Changes Requested", "Approved", "Rejected", "Draft"],
    "Changes Requested": ["Draft", "In Review"],
    "Rejected": ["Draft"],
    "Approved": ["Draft"],  # allow reopening if edits are necessary
}

def transition_review_status(
    draft_id: int,
    to_status: ReviewStatusType,
    reviewer_name: str,
    notes: Optional[str] = None
) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    draft = get_content_draft(draft_id)
    if not draft:
        return False, f"Draft with ID {draft_id} not found", None

    current_status = draft["review_status"]

    if current_status == to_status:
        return False, f"Draft is already in status '{to_status}'", draft

    allowed = VALID_TRANSITIONS.get(current_status, [])
    if to_status not in allowed:
        return (
            False,
            f"Invalid transition from '{current_status}' to '{to_status}'. Allowed transitions: {', '.join(allowed) or 'None'}",
            draft
        )

    # Check for approval guards:
    if to_status == "Approved":
        open_criticals = get_open_findings_by_severity(draft_id, ["critical"])
        if open_criticals:
            count = len(open_criticals)
            return (
                False,
                f"Cannot approve draft: There {'is' if count == 1 else 'are'} {count} unresolved critical finding(s). Please review and resolve them before final approval.",
                draft
            )

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE content_drafts
            SET review_status = ?, reviewer_notes = COALESCE(?, reviewer_notes), updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (to_status, notes, draft_id)
        )
        cursor.execute(
            """
            INSERT INTO review_history (draft_id, from_status, to_status, changed_by, notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (draft_id, current_status, to_status, reviewer_name, notes)
        )

    updated_draft = get_content_draft(draft_id)
    return True, f"Successfully changed status to '{to_status}'", updated_draft

def get_review_history(draft_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM review_history WHERE draft_id = ? ORDER BY id ASC", (draft_id,))
        return [dict(r) for r in cursor.fetchall()]

# ----------------- ANALYSIS FINDINGS -----------------

def clear_open_findings(draft_id: int):
    """Clears previous findings for a draft when re-analyzing."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM analysis_findings WHERE draft_id = ?", (draft_id,))

def save_findings(draft_id: int, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        for f in findings:
            cursor.execute(
                """
                INSERT INTO analysis_findings (
                    draft_id, rule_id, fact_id, finding_source, rule_type,
                    severity, title, explanation, evidence, matched_text,
                    start_char, end_char, suggested_correction, status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
                """,
                (
                    draft_id,
                    f.get("rule_id"),
                    f.get("fact_id"),
                    f.get("finding_source", "rule_engine"),
                    f.get("rule_type", "rule"),
                    f.get("severity", "medium"),
                    f.get("title", ""),
                    f.get("explanation", ""),
                    f.get("evidence", ""),
                    f.get("matched_text"),
                    f.get("start_char"),
                    f.get("end_char"),
                    f.get("suggested_correction"),
                )
            )
    return get_draft_findings(draft_id)

def get_draft_findings(draft_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM analysis_findings
            WHERE draft_id = ?
            ORDER BY
                CASE severity
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END,
                id ASC
            """,
            (draft_id,)
        )
        return [dict(r) for r in cursor.fetchall()]

def get_open_findings_by_severity(draft_id: int, severities: List[str]) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        placeholders = ",".join("?" for _ in severities)
        cursor.execute(
            f"""
            SELECT * FROM analysis_findings
            WHERE draft_id = ? AND status = 'open' AND severity IN ({placeholders})
            """,
            (draft_id, *severities)
        )
        return [dict(r) for r in cursor.fetchall()]

def apply_finding_action(
    finding_id: int,
    action: str,  # "accept", "reject", "edit"
    custom_correction: Optional[str] = None
) -> Tuple[bool, str, Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM analysis_findings WHERE id = ?", (finding_id,))
        finding_row = cursor.fetchone()
        if not finding_row:
            return False, f"Finding {finding_id} not found", None, None

        finding = dict(finding_row)
        draft_id = finding["draft_id"]
        cursor.execute("SELECT * FROM content_drafts WHERE id = ?", (draft_id,))
        draft_row = cursor.fetchone()
        if not draft_row:
            return False, f"Draft {draft_id} not found", None, None

        draft = dict(draft_row)
        current_text = draft["current_text"]

        applied_text = None
        new_status = finding["status"]

        if action == "reject":
            new_status = "rejected"
            cursor.execute(
                "UPDATE analysis_findings SET status = ? WHERE id = ?",
                (new_status, finding_id)
            )
            finding["status"] = new_status
            return True, "Finding rejected by reviewer", finding, draft

        elif action == "accept":
            new_status = "accepted"
            correction = finding.get("suggested_correction")
            matched = finding.get("matched_text")
            if not correction or not matched:
                return False, "Finding does not have a valid matched text and suggested correction", None, None

            if matched in current_text:
                updated_text = current_text.replace(matched, correction, 1)
                cursor.execute(
                    "UPDATE content_drafts SET current_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (updated_text, draft_id)
                )
                draft["current_text"] = updated_text
                applied_text = correction
            else:
                return False, f"The original text segment '{matched}' was not found in the current draft. It may have already been modified.", None, None

        elif action == "edit":
            new_status = "edited"
            if not custom_correction:
                return False, "Custom correction text is required for 'edit' action", None, None
            matched = finding.get("matched_text")
            if matched and matched in current_text:
                updated_text = current_text.replace(matched, custom_correction, 1)
                cursor.execute(
                    "UPDATE content_drafts SET current_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (updated_text, draft_id)
                )
                draft["current_text"] = updated_text
                applied_text = custom_correction
            else:
                return False, f"The original text segment '{matched}' was not found in the current draft.", None, None

        cursor.execute(
            "UPDATE analysis_findings SET status = ?, user_applied_text = ? WHERE id = ?",
            (new_status, applied_text, finding_id)
        )
        finding["status"] = new_status
        finding["user_applied_text"] = applied_text

        action_label = "accepted" if new_status == "accepted" else ("edited" if new_status == "edited" else new_status)
        return True, f"Correction successfully {action_label} into draft content", finding, draft

# ----------------- BRAND TRUST REPORT -----------------

def generate_brand_trust_report(draft_id: int) -> Optional[Dict[str, Any]]:
    from datetime import datetime, timezone

    draft = get_content_draft(draft_id)
    if not draft:
        return None

    findings = get_draft_findings(draft_id)

    unresolved_by_sev = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    unresolved_by_cat = {
        "terminology": 0,
        "voice_and_tone": 0,
        "fact_conflicts": 0,
        "prohibited_claims": 0,
    }
    resolved_summary = {
        "accepted": 0,
        "edited": 0,
        "dismissed": 0,
        "total_resolved": 0,
    }

    evidence_refs = []
    open_findings = []

    for f in findings:
        status = f.get("status", "open")
        sev = str(f.get("severity", "medium")).lower()
        rtype = str(f.get("rule_type", "voice")).lower()

        if status == "open":
            open_findings.append(f)
            if sev in unresolved_by_sev:
                unresolved_by_sev[sev] += 1

            if rtype in ("terminology", "preferred_wording"):
                unresolved_by_cat["terminology"] += 1
            elif rtype == "voice":
                unresolved_by_cat["voice_and_tone"] += 1
            elif rtype == "fact":
                unresolved_by_cat["fact_conflicts"] += 1
            elif rtype == "prohibited_claim":
                unresolved_by_cat["prohibited_claims"] += 1

            evidence_refs.append({
                "id": f["id"],
                "title": f["title"],
                "rule_type": f["rule_type"],
                "severity": f["severity"],
                "matched_text": f.get("matched_text"),
                "explanation": f["explanation"],
                "evidence": f["evidence"],
                "suggested_correction": f.get("suggested_correction"),
                "status": status,
            })
        elif status == "accepted":
            resolved_summary["accepted"] += 1
        elif status == "edited":
            resolved_summary["edited"] += 1
        elif status == "rejected":
            resolved_summary["dismissed"] += 1

    resolved_summary["total_resolved"] = (
        resolved_summary["accepted"] +
        resolved_summary["edited"] +
        resolved_summary["dismissed"]
    )

    total_unresolved = len(open_findings)
    critical_count = unresolved_by_sev["critical"]
    review_status = draft.get("review_status", "Draft")

    blockers = []
    if critical_count > 0:
        blockers.append(
            f"{critical_count} unresolved critical finding(s) detected. Must be resolved before publication approval."
        )

    if review_status == "Draft":
        blockers.append("Content is currently in 'Draft' state. Must be submitted for human review.")
    elif review_status == "Changes Requested":
        blockers.append("Reviewer has requested changes. Revisions must be submitted for re-review.")
    elif review_status == "Rejected":
        blockers.append("Draft was rejected by compliance reviewer. Reopen as draft to revise.")

    # Determine transparent publication-readiness status
    if review_status == "Approved":
        readiness = "Approved for Publication"
        is_blocked = False
    elif critical_count > 0:
        readiness = "Blocked — Critical Issues Present"
        is_blocked = True
    elif review_status == "In Review" and critical_count == 0:
        readiness = "Ready for Human Approval"
        is_blocked = False
    elif review_status == "Changes Requested":
        readiness = "Action Required — Changes Requested"
        is_blocked = True
    elif review_status == "Rejected":
        readiness = "Rejected by Reviewer"
        is_blocked = True
    else:  # Draft
        readiness = "Draft — Ready for Review Submission"
        is_blocked = True

    now_str = datetime.now(timezone.utc).isoformat()

    return {
        "draft_id": draft_id,
        "draft_title": draft["title"],
        "review_status": review_status,
        "publication_readiness": readiness,
        "is_approval_blocked": is_blocked,
        "blockers": blockers,
        "unresolved_by_severity": unresolved_by_sev,
        "total_unresolved": total_unresolved,
        "unresolved_by_category": unresolved_by_cat,
        "resolved_summary": resolved_summary,
        "evidence_references": evidence_refs,
        "calculation_basis": (
            "Computed deterministically from persisted SQLite findings and verified governance rules. "
            "A draft with 1 or more unresolved critical findings is mathematically blocked from publication approval."
        ),
        "generated_at": now_str,
    }

# ================= ROUND 3 CRUD FUNCTIONS =================

# --- Visual Governance Profiles & Assets ---

def get_brand_visual_profile(brand_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_visual_profiles WHERE brand_id = ?", (brand_id,))
        row = cursor.fetchone()
        if not row:
            return None
        data = dict(row)
        data["primary_colors"] = json.loads(data["primary_colors"]) if data.get("primary_colors") else []
        data["secondary_colors"] = json.loads(data["secondary_colors"]) if data.get("secondary_colors") else []
        data["logo_rules"] = json.loads(data["logo_rules"]) if data.get("logo_rules") else {}
        data["typography_rules"] = json.loads(data["typography_rules"]) if data.get("typography_rules") else {}
        return data

def upsert_brand_visual_profile(brand_id: int, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        primary_json = json.dumps(profile_data.get("primary_colors") or [])
        secondary_json = json.dumps(profile_data.get("secondary_colors") or [])
        logo_json = json.dumps(profile_data.get("logo_rules") or {})
        typo_json = json.dumps(profile_data.get("typography_rules") or {})
        guidelines = profile_data.get("guidelines")

        cursor.execute("SELECT id FROM brand_visual_profiles WHERE brand_id = ?", (brand_id,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                """
                UPDATE brand_visual_profiles
                SET primary_colors = ?, secondary_colors = ?, logo_rules = ?, typography_rules = ?, guidelines = ?, updated_at = CURRENT_TIMESTAMP
                WHERE brand_id = ?
                """,
                (primary_json, secondary_json, logo_json, typo_json, guidelines, brand_id)
            )
        else:
            cursor.execute(
                """
                INSERT INTO brand_visual_profiles (brand_id, primary_colors, secondary_colors, logo_rules, typography_rules, guidelines)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (brand_id, primary_json, secondary_json, logo_json, typo_json, guidelines)
            )
    return get_brand_visual_profile(brand_id)

def create_visual_asset(
    brand_id: int,
    filename: str,
    original_name: str,
    mime_type: str,
    file_size: int,
    file_path: str,
    width: int = 0,
    height: int = 0,
    asset_type: str = "image",
    audit_score: float = 100.0,
    audit_status: str = "pending",
    dominant_colors: Optional[List[Dict[str, Any]]] = None,
    audit_results: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        colors_json = json.dumps(dominant_colors or [])
        results_json = json.dumps(audit_results or {})
        cursor.execute(
            """
            INSERT INTO visual_assets (
                brand_id, filename, original_name, mime_type, file_size, file_path,
                width, height, asset_type, audit_score, audit_status, dominant_colors, audit_results
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                brand_id, filename, original_name, mime_type, file_size, file_path,
                width, height, asset_type, audit_score, audit_status, colors_json, results_json
            )
        )
        asset_id = cursor.lastrowid
    return get_visual_asset(asset_id)

def get_visual_asset(asset_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM visual_assets WHERE id = ?", (asset_id,))
        row = cursor.fetchone()
        if not row:
            return None
        data = dict(row)
        data["dominant_colors"] = json.loads(data["dominant_colors"]) if data.get("dominant_colors") else []
        data["audit_results"] = json.loads(data["audit_results"]) if data.get("audit_results") else {}
        return data

def list_visual_assets(brand_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM visual_assets WHERE brand_id = ? ORDER BY id DESC", (brand_id,))
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["dominant_colors"] = json.loads(d["dominant_colors"]) if d.get("dominant_colors") else []
            d["audit_results"] = json.loads(d["audit_results"]) if d.get("audit_results") else {}
            result.append(d)
        return result

def update_visual_asset_audit(
    asset_id: int,
    audit_score: float,
    audit_status: str,
    dominant_colors: List[Dict[str, Any]],
    audit_results: Dict[str, Any],
    width: Optional[int] = None,
    height: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        colors_json = json.dumps(dominant_colors)
        results_json = json.dumps(audit_results)
        if width is not None and height is not None:
            cursor.execute(
                """
                UPDATE visual_assets
                SET audit_score = ?, audit_status = ?, dominant_colors = ?, audit_results = ?, width = ?, height = ?
                WHERE id = ?
                """,
                (audit_score, audit_status, colors_json, results_json, width, height, asset_id)
            )
        else:
            cursor.execute(
                """
                UPDATE visual_assets
                SET audit_score = ?, audit_status = ?, dominant_colors = ?, audit_results = ?
                WHERE id = ?
                """,
                (audit_score, audit_status, colors_json, results_json, asset_id)
            )
    return get_visual_asset(asset_id)

def delete_visual_asset(asset_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM visual_assets WHERE id = ?", (asset_id,))
        return cursor.rowcount > 0

# --- Brand Voice Intelligence ---

def create_voice_sample(brand_id: int, title: str, source: str, sample_text: str, word_count: int) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO brand_voice_samples (brand_id, title, source, sample_text, word_count)
            VALUES (?, ?, ?, ?, ?)
            """,
            (brand_id, title, source, sample_text, word_count)
        )
        sample_id = cursor.lastrowid
        cursor.execute("SELECT * FROM brand_voice_samples WHERE id = ?", (sample_id,))
        return dict(cursor.fetchone())

def list_voice_samples(brand_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_voice_samples WHERE brand_id = ? ORDER BY id DESC", (brand_id,))
        return [dict(r) for r in cursor.fetchall()]

def delete_voice_sample(sample_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM brand_voice_samples WHERE id = ?", (sample_id,))
        return cursor.rowcount > 0

def get_brand_voice_profile(brand_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_voice_profiles WHERE brand_id = ?", (brand_id,))
        row = cursor.fetchone()
        if not row:
            return None
        data = dict(row)
        data["tone_attributes"] = json.loads(data["tone_attributes"]) if data.get("tone_attributes") else []
        data["preferred_terms"] = json.loads(data["preferred_terms"]) if data.get("preferred_terms") else []
        data["style_guidelines"] = json.loads(data["style_guidelines"]) if data.get("style_guidelines") else []
        return data

def upsert_brand_voice_profile(brand_id: int, profile_dict: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        tone_json = json.dumps(profile_dict.get("tone_attributes") or [])
        terms_json = json.dumps(profile_dict.get("preferred_terms") or [])
        guidelines_json = json.dumps(profile_dict.get("style_guidelines") or [])
        
        cursor.execute("SELECT id FROM brand_voice_profiles WHERE brand_id = ?", (brand_id,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                """
                UPDATE brand_voice_profiles
                SET sample_count = ?, total_words = ?, formality_score = ?, avg_sentence_length = ?,
                    vocab_complexity = ?, active_voice_ratio = ?, tone_attributes = ?, preferred_terms = ?,
                    style_guidelines = ?, updated_at = CURRENT_TIMESTAMP
                WHERE brand_id = ?
                """,
                (
                    profile_dict.get("sample_count", 0),
                    profile_dict.get("total_words", 0),
                    profile_dict.get("formality_score", 70.0),
                    profile_dict.get("avg_sentence_length", 16.0),
                    profile_dict.get("vocab_complexity", 65.0),
                    profile_dict.get("active_voice_ratio", 85.0),
                    tone_json,
                    terms_json,
                    guidelines_json,
                    brand_id
                )
            )
        else:
            cursor.execute(
                """
                INSERT INTO brand_voice_profiles (
                    brand_id, sample_count, total_words, formality_score, avg_sentence_length,
                    vocab_complexity, active_voice_ratio, tone_attributes, preferred_terms, style_guidelines
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    brand_id,
                    profile_dict.get("sample_count", 0),
                    profile_dict.get("total_words", 0),
                    profile_dict.get("formality_score", 70.0),
                    profile_dict.get("avg_sentence_length", 16.0),
                    profile_dict.get("vocab_complexity", 65.0),
                    profile_dict.get("active_voice_ratio", 85.0),
                    tone_json,
                    terms_json,
                    guidelines_json
                )
            )
    return get_brand_voice_profile(brand_id)

# --- CMS Gateway & Publication Logs ---

def create_cms_publication_log(
    brand_id: int,
    cms_platform: str,
    title: str,
    channel: str,
    external_id: Optional[str],
    author: Optional[str],
    decision: str,
    allowed: int,
    blockers: List[str],
    findings_summary: Dict[str, Any],
    payload_preview: Optional[str]
) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        blockers_json = json.dumps(blockers)
        summary_json = json.dumps(findings_summary)
        cursor.execute(
            """
            INSERT INTO cms_publication_logs (
                brand_id, cms_platform, title, channel, external_id, author,
                decision, allowed, blockers, findings_summary, payload_preview
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                brand_id, cms_platform, title, channel, external_id, author,
                decision, allowed, blockers_json, summary_json, payload_preview
            )
        )
        log_id = cursor.lastrowid
        cursor.execute("SELECT * FROM cms_publication_logs WHERE id = ?", (log_id,))
        row = cursor.fetchone()
        data = dict(row)
        data["blockers"] = json.loads(data["blockers"])
        data["findings_summary"] = json.loads(data["findings_summary"])
        return data

def list_cms_publication_logs(brand_id: Optional[int] = None, limit: int = 50) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if brand_id:
            cursor.execute(
                "SELECT * FROM cms_publication_logs WHERE brand_id = ? ORDER BY id DESC LIMIT ?",
                (brand_id, limit)
            )
        else:
            cursor.execute(
                "SELECT * FROM cms_publication_logs ORDER BY id DESC LIMIT ?",
                (limit,)
            )
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["blockers"] = json.loads(d["blockers"]) if d.get("blockers") else []
            d["findings_summary"] = json.loads(d["findings_summary"]) if d.get("findings_summary") else {}
            result.append(d)
        return result


