import os
import pytest
from fastapi.testclient import TestClient

# Use a test database file
os.environ["DATABASE_PATH"] = "test_brandproof.db"

from backend.main import app
from backend.database import init_db, get_db_path
from backend.seed_data import seed_demo_data_if_empty

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    db_path = get_db_path()
    if "test_brandproof" in db_path and os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass
    init_db()
    seed_demo_data_if_empty()
    yield
    if "test_brandproof" in db_path and os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass
    # Cleanup test db if desired
    db_path = get_db_path()
    if "test_brandproof" in db_path and os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass

client = TestClient(app)

def test_app_info():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "BrandRoute" in data["name"]
    assert "deterministic" in data["features"][0].lower()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_brand_profile_lifecycle():
    # Create brand
    payload = {
        "name": "TestCorp Global",
        "tagline": "Next-gen enterprise software",
        "description": "Provider of secure enterprise solutions",
        "industry": "Software",
        "tone_attributes": ["Professional", "Concise", "Empathetic"]
    }
    create_res = client.post("/api/brands", json=payload)
    assert create_res.status_code == 201
    brand = create_res.json()
    brand_id = brand["id"]
    assert brand["name"] == "TestCorp Global"
    assert "Professional" in brand["tone_attributes"]

    # Retrieve brand
    get_res = client.get(f"/api/brands/{brand_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "TestCorp Global"

def test_rules_and_facts_creation():
    # Fetch demo brand
    brands = client.get("/api/brands").json()
    assert len(brands) > 0
    brand_id = brands[0]["id"]

    # Create new rule
    rule_payload = {
        "brand_id": brand_id,
        "rule_type": "terminology",
        "category": "Terminology",
        "title": "Spell AI Suite with Capitals",
        "description": "Always capitalize AI Suite",
        "pattern_or_term": "ai suite",
        "preferred_term": "AI Suite",
        "severity": "medium",
        "rationale": "Product branding guideline"
    }
    rule_res = client.post("/api/rules", json=rule_payload)
    assert rule_res.status_code == 201
    assert rule_res.json()["pattern_or_term"] == "ai suite"

    # Create new fact
    fact_payload = {
        "brand_id": brand_id,
        "fact_key": "customer_count",
        "fact_statement": "AetherCloud serves over 1,500 enterprise customers globally.",
        "verified_value": "1,500+",
        "evidence_source": "Annual Investor Report 2024"
    }
    fact_res = client.post("/api/facts", json=fact_payload)
    assert fact_res.status_code == 201
    assert fact_res.json()["fact_key"] == "customer_count"

def test_draft_submission_and_rule_engine_findings():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    draft_payload = {
        "brand_id": brand_id,
        "title": "Press Release for Cloud Engine",
        "channel": "Press Release",
        "author": "Marketer Jane",
        "original_text": "Since Aethercloud was founded in 2018, we deliver 100% guaranteed zero downtime with CloudMesh."
    }
    draft_res = client.post("/api/drafts", json=draft_payload)
    assert draft_res.status_code == 201
    draft = draft_res.json()
    draft_id = draft["id"]
    assert draft["review_status"] == "Draft"

    # Analyze draft (deterministic mode, run_ai=False to avoid external API calls)
    analysis_res = client.post(f"/api/drafts/{draft_id}/analyze?run_ai=false")
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()
    assert analysis["total_findings"] >= 3

    # Check that seeded violations were caught:
    # 1. Terminology: 'Aethercloud' casing
    # 2. Terminology: 'CloudMesh' deprecated product
    # 3. Prohibited Claim: '100% guaranteed zero downtime'
    # 4. Factual conflict: 'founded in 2018' vs 2021
    finding_titles = [f["title"].lower() for f in analysis["findings"]]
    matched_texts = [f["matched_text"] for f in analysis["findings"] if f["matched_text"]]

    assert any("aethercloud" in m.lower() for m in matched_texts)
    assert any("cloudmesh" in m.lower() for m in matched_texts)
    assert any("100% guaranteed zero downtime" in m.lower() for m in matched_texts)
    assert any("founding year" in t for t in finding_titles)

    # Check evidence linking
    for f in analysis["findings"]:
        assert len(f["evidence"]) > 0
        assert f["severity"] in ["critical", "high", "medium", "low"]

def test_finding_correction_acceptance_and_rejection():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    draft_payload = {
        "brand_id": brand_id,
        "title": "Blog test",
        "channel": "Blog",
        "author": "Author A",
        "original_text": "We love CloudMesh because it has great synergy."
    }
    draft = client.post("/api/drafts", json=draft_payload).json()
    draft_id = draft["id"]

    # Run analysis
    client.post(f"/api/drafts/{draft_id}/analyze?run_ai=false")
    findings = client.get(f"/api/drafts/{draft_id}/findings").json()

    # Find the CloudMesh finding
    cloudmesh_finding = next((f for f in findings if "cloudmesh" in (f["matched_text"] or "").lower()), None)
    assert cloudmesh_finding is not None
    assert cloudmesh_finding["suggested_correction"] == "AetherMesh Fabric"

    # Accept the correction
    action_res = client.post(
        f"/api/findings/{cloudmesh_finding['id']}/action",
        json={"action": "accept"}
    )
    assert action_res.status_code == 200
    res_data = action_res.json()
    assert res_data["finding"]["status"] == "accepted"
    # Verify draft text was updated in SQLite!
    assert "AetherMesh Fabric" in res_data["draft"]["current_text"]
    assert "CloudMesh" not in res_data["draft"]["current_text"]

    # Test reject action on another finding (e.g. synergy)
    synergy_finding = next((f for f in findings if "synergy" in (f["matched_text"] or "").lower()), None)
    if synergy_finding:
        reject_res = client.post(
            f"/api/findings/{synergy_finding['id']}/action",
            json={"action": "reject"}
        )
        assert reject_res.status_code == 200
        assert reject_res.json()["finding"]["status"] == "rejected"
        # Content remains unchanged
        assert "synergy" in reject_res.json()["draft"]["current_text"]

def test_review_status_governance_workflow():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # Create a clean draft with no critical issues
    clean_draft_payload = {
        "brand_id": brand_id,
        "title": "Clean Press Release",
        "channel": "PR",
        "author": "Compliant Writer",
        "original_text": "AetherCloud was founded in 2021 and delivers high-performance cloud orchestration."
    }
    draft = client.post("/api/drafts", json=clean_draft_payload).json()
    draft_id = draft["id"]

    # 1. Invalid jump: Draft directly to Approved (should fail)
    bad_jump = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Approved", "reviewer_name": "Boss"}
    )
    assert bad_jump.status_code == 400
    assert "Invalid transition" in bad_jump.json()["detail"]

    # 2. Valid transition: Draft -> In Review
    t1 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "In Review", "reviewer_name": "Writer", "notes": "Ready for editorial review"}
    )
    assert t1.status_code == 200
    assert t1.json()["draft"]["review_status"] == "In Review"

    # 3. Valid transition: In Review -> Changes Requested
    t2 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Changes Requested", "reviewer_name": "Editor", "notes": "Please verify quotes"}
    )
    assert t2.status_code == 200
    assert t2.json()["draft"]["review_status"] == "Changes Requested"

    # 4. Valid transition: Changes Requested -> In Review
    t3 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "In Review", "reviewer_name": "Writer", "notes": "Quotes verified"}
    )
    assert t3.status_code == 200
    assert t3.json()["draft"]["review_status"] == "In Review"

    # 5. Valid transition: In Review -> Approved
    t4 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Approved", "reviewer_name": "Compliance Officer", "notes": "All checks passed"}
    )
    assert t4.status_code == 200
    assert t4.json()["draft"]["review_status"] == "Approved"

    # 6. Check history trail
    history = client.get(f"/api/drafts/{draft_id}/review-history").json()
    assert len(history) >= 4
    assert history[-1]["to_status"] == "Approved"
    assert history[-1]["changed_by"] == "Compliance Officer"

def test_prevent_approval_with_unresolved_critical_finding():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # Draft with critical finding
    critical_draft = client.post("/api/drafts", json={
        "brand_id": brand_id,
        "title": "Risky Draft",
        "channel": "Ad",
        "author": "Marketer",
        "original_text": "This software is completely risk-free and CloudMesh is active."
    }).json()
    draft_id = critical_draft["id"]

    # Analyze to trigger critical finding
    client.post(f"/api/drafts/{draft_id}/analyze?run_ai=false")

    # Transition to In Review
    client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "In Review", "reviewer_name": "Editor"}
    )

    # Attempt to Approve while critical finding is still open
    approve_attempt = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Approved", "reviewer_name": "Manager"}
    )
    assert approve_attempt.status_code == 400
    assert "unresolved critical finding" in approve_attempt.json()["detail"].lower()

def test_brand_trust_report_calculation_and_approval_readiness():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # 1. Create a draft with a critical prohibited claim and casing error
    draft_payload = {
        "brand_id": brand_id,
        "title": "Trust Report Test Draft",
        "channel": "Press Release",
        "author": "Governance Tester",
        "original_text": "Aethercloud provides 100% guaranteed zero downtime with CloudMesh."
    }
    draft = client.post("/api/drafts", json=draft_payload).json()
    draft_id = draft["id"]

    # 2. Audit draft
    client.post(f"/api/drafts/{draft_id}/analyze?run_ai=false")

    # 3. Retrieve Trust Report in initial state (critical issues present)
    report_res = client.get(f"/api/drafts/{draft_id}/trust-report")
    assert report_res.status_code == 200
    report = report_res.json()

    assert report["draft_id"] == draft_id
    assert report["unresolved_by_severity"]["critical"] >= 2  # CloudMesh & 100% zero downtime
    assert report["total_unresolved"] >= 3
    assert report["is_approval_blocked"] is True
    assert "Blocked" in report["publication_readiness"]
    assert len(report["blockers"]) >= 1
    assert "critical finding" in report["blockers"][0].lower()
    assert len(report["evidence_references"]) >= 3
    assert "persisted sqlite findings" in report["calculation_basis"].lower()

    # 4. Resolve findings via corrections
    findings = client.get(f"/api/drafts/{draft_id}/findings").json()
    for f in findings:
        client.post(f"/api/findings/{f['id']}/action", json={"action": "accept" if f.get("suggested_correction") else "reject"})

    # 5. Transition to In Review
    client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "In Review", "reviewer_name": "QA Lead"}
    )

    # 6. Check updated Trust Report: critical count should be 0, ready for approval!
    report_after = client.get(f"/api/drafts/{draft_id}/trust-report").json()
    assert report_after["unresolved_by_severity"]["critical"] == 0
    assert report_after["total_unresolved"] == 0
    assert report_after["resolved_summary"]["total_resolved"] >= 3
    assert report_after["is_approval_blocked"] is False
    assert report_after["publication_readiness"] == "Ready for Human Approval"

    # 7. Approve draft and verify final report state
    client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Approved", "reviewer_name": "Compliance Officer", "notes": "Approved with zero blockers"}
    )
    final_report = client.get(f"/api/drafts/{draft_id}/trust-report").json()
    assert final_report["review_status"] == "Approved"
    assert final_report["publication_readiness"] == "Approved for Publication"
    assert final_report["is_approval_blocked"] is False

# ================= ROUND 3 TEST SUITE =================

def test_visual_governance_profile():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # 1. Get visual profile
    res = client.get(f"/api/brands/{brand_id}/visual-profile")
    assert res.status_code == 200
    data = res.json()
    assert len(data["primary_colors"]) >= 1
    assert data["primary_colors"][0]["hex"].startswith("#")

    # 2. Update visual profile
    update_payload = {
        "primary_colors": [
            {"hex": "#1d4ed8", "name": "Deep Blue", "role": "primary"},
            {"hex": "#0f172a", "name": "Midnight", "role": "primary"}
        ],
        "secondary_colors": [
            {"hex": "#10b981", "name": "Emerald", "role": "secondary"}
        ],
        "logo_rules": {
            "aspect_ratio_min": 0.5,
            "aspect_ratio_max": 3.5,
            "clearspace_ratio": 0.15,
            "min_resolution_px": 200
        },
        "typography_rules": {
            "primary_font": "Inter",
            "secondary_font": "Outfit",
            "max_type_scale": 2.5
        },
        "guidelines": "Updated brand visual identity rules."
    }
    update_res = client.put(f"/api/brands/{brand_id}/visual-profile", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["primary_colors"][0]["hex"] == "#1d4ed8"

def test_visual_asset_upload_and_validation():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # 1. Invalid file format rejection
    invalid_file = ("document.txt", b"Invalid content", "text/plain")
    res = client.post(
        f"/api/brands/{brand_id}/visual-assets/upload",
        files={"file": invalid_file}
    )
    assert res.status_code == 400
    assert "Unsupported file type" in res.json()["detail"]

    # 2. Valid image upload (synthetic 10x10 PNG)
    # 1x1 transparent png bytes
    tiny_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    upload_res = client.post(
        f"/api/brands/{brand_id}/visual-assets/upload",
        files={"file": ("test_logo.png", tiny_png, "image/png")}
    )
    assert upload_res.status_code == 200
    asset_data = upload_res.json()
    assert asset_data["brand_id"] == brand_id
    assert asset_data["asset_type"] == "image"
    assert "audit_score" in asset_data
    assert len(asset_data["dominant_colors"]) >= 1

    # 3. Retrieve assets list
    list_res = client.get(f"/api/brands/{brand_id}/visual-assets")
    assert list_res.status_code == 200
    assert any(a["id"] == asset_data["id"] for a in list_res.json())

def test_brand_voice_samples_and_profile():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # 1. Add voice sample
    sample_payload = {
        "title": "Cloud Governance Case Study",
        "source": "2024 Customer Report",
        "sample_text": "AetherCloud provides zero-trust governance architecture across mission-critical enterprise environments. Our platform guarantees deterministic enforcement of corporate policy without degrading high-throughput data processing operations."
    }
    create_res = client.post(f"/api/brands/{brand_id}/voice-samples", json=sample_payload)
    assert create_res.status_code == 201
    sample = create_res.json()
    assert sample["word_count"] > 15

    # 2. Re-generate voice profile
    gen_res = client.post(f"/api/brands/{brand_id}/voice-profile/generate")
    assert gen_res.status_code == 200
    profile = gen_res.json()
    assert profile["brand_id"] == brand_id
    assert profile["formality_score"] > 50.0
    assert profile["active_voice_ratio"] > 70.0
    assert len(profile["tone_attributes"]) >= 1

    # 3. Validation rejection on too brief sample
    bad_res = client.post(f"/api/brands/{brand_id}/voice-samples", json={"title": "Too short", "sample_text": "Too few words."})
    assert bad_res.status_code in (400, 422)

def test_brand_voice_draft_analysis():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # Compare conversational/informal text against learned formal brand voice
    informal_text = {
        "text": "Hey guys! We are super pumped to show off our crazy cool new cloud stuff that's totally gonna blow your minds. Don't worry about anything, it's pretty much awesome."
    }
    res = client.post(f"/api/brands/{brand_id}/voice-analysis", json=informal_text)
    assert res.status_code == 200
    analysis = res.json()
    assert analysis["consistency_score"] < 80.0
    assert len(analysis["deviations"]) >= 1
    # Check that formality deviation was flagged
    assert any("formality" in d["metric"].lower() for d in analysis["deviations"])

def test_cms_gateway_publication_allow_and_block():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # 1. Test Block on Critical Unresolved Findings (100% zero downtime + cheapest in the world)
    blocked_payload = {
        "brand_id": brand_id,
        "cms_platform": "WordPress",
        "title": "Disruptive Cloud Launch",
        "channel": "Blog",
        "content": "AetherCloud is the cheapest in the world and provides 100% guaranteed zero downtime for enterprise clusters.",
        "author": "Marketer"
    }
    block_res = client.post("/api/integrations/cms/publish-check", json=blocked_payload)
    assert block_res.status_code == 200
    data = block_res.json()
    assert data["decision"] == "BLOCK"
    assert data["allowed"] is False
    assert len(data["blockers"]) >= 1
    assert data["critical_count"] >= 1
    assert data["audit_log_id"] > 0

    # 2. Test Allow on Compliant Content
    allowed_payload = {
        "brand_id": brand_id,
        "cms_platform": "HubSpot",
        "title": "Enterprise Cloud Architecture Update",
        "channel": "Press Release",
        "content": "AetherCloud was founded in 2021 and delivers high-reliability zero-trust governance with a 99.95% uptime SLA backed by AES-256-GCM encryption.",
        "author": "Elena Rostova"
    }
    allow_res = client.post("/api/integrations/cms/publish-check", json=allowed_payload)
    assert allow_res.status_code == 200
    allow_data = allow_res.json()
    assert allow_data["decision"] == "ALLOW"
    assert allow_data["allowed"] is True
    assert len(allow_data["blockers"]) == 0

    # 3. Retrieve CMS publication audit logs
    logs_res = client.get(f"/api/integrations/cms/logs?brand_id={brand_id}")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 2
    # Verify both ALLOW and BLOCK records are present in SQLite audit log
    decisions = {l["decision"] for l in logs}
    assert "BLOCK" in decisions
    assert "ALLOW" in decisions

    # 4. Adapters info
    adapters_res = client.get("/api/integrations/cms/adapters")
    assert adapters_res.status_code == 200
    adapters = adapters_res.json()["adapters"]
    assert "WordPress" in adapters
    assert "Contentful" in adapters
    assert "Webflow" in adapters
    assert "HubSpot" in adapters

