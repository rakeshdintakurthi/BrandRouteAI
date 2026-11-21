from backend.crud import (
    create_brand_profile,
    create_brand_rule,
    create_brand_fact,
    create_content_draft,
    list_brand_profiles,
    list_content_drafts,
    get_brand_visual_profile,
    upsert_brand_visual_profile,
    list_visual_assets,
    create_visual_asset,
    list_voice_samples,
    create_voice_sample,
    get_brand_voice_profile,
    upsert_brand_voice_profile,
    list_cms_publication_logs,
    create_cms_publication_log
)
from backend.models import (
    BrandProfileCreate,
    BrandRuleCreate,
    BrandFactCreate,
    ContentDraftCreate
)

def _ensure_round3_showcase(brand_id: int):
    # 1. Visual Governance Profile
    if not get_brand_visual_profile(brand_id):
        upsert_brand_visual_profile(brand_id, {
            "primary_colors": [
                {"hex": "#2563eb", "name": "Royal Cobalt", "role": "primary"},
                {"hex": "#0f172a", "name": "Deep Midnight Navy", "role": "primary"}
            ],
            "secondary_colors": [
                {"hex": "#10b981", "name": "Emerald Growth", "role": "secondary"},
                {"hex": "#6366f1", "name": "Electric Indigo", "role": "secondary"},
                {"hex": "#f8fafc", "name": "Slate Cloud", "role": "neutral"}
            ],
            "logo_rules": {
                "aspect_ratio_min": 0.5,
                "aspect_ratio_max": 3.8,
                "clearspace_ratio": 0.15,
                "min_resolution_px": 150
            },
            "typography_rules": {
                "primary_font": "Inter",
                "secondary_font": "Outfit",
                "max_type_scale": 2.5
            },
            "guidelines": "Maintain clean 16:9 or 1:1 layouts. Use Royal Cobalt for hero CTA buttons and Deep Midnight Navy for primary background cards. Ensure 15% clearspace padding around the brand glyph."
        })

    # 2. Visual Assets (Showcase Assets)
    existing_assets = list_visual_assets(brand_id)
    if not existing_assets:
        create_visual_asset(
            brand_id=brand_id,
            filename="aethercloud-hero-banner.png",
            original_name="AetherCloud_Q4_Launch_Banner.png",
            mime_type="image/png",
            file_size=248000,
            file_path="/uploads/aethercloud-hero-banner.png",
            width=1200,
            height=630,
            asset_type="image",
            audit_score=94.5,
            audit_status="passed",
            dominant_colors=[
                {"hex": "#0f172a", "percentage": 48.2, "is_approved": True, "nearest_approved_hex": "#0f172a", "delta_e": 0.0},
                {"hex": "#2563eb", "percentage": 34.6, "is_approved": True, "nearest_approved_hex": "#2563eb", "delta_e": 0.0},
                {"hex": "#f8fafc", "percentage": 17.2, "is_approved": True, "nearest_approved_hex": "#f8fafc", "delta_e": 0.0}
            ],
            audit_results={
                "score": 94.5,
                "status": "passed",
                "dimensions": {"width": 1200, "height": 630, "aspect_ratio": 1.9},
                "violations": [
                    {
                        "category": "Layout / Aspect Ratio",
                        "severity": "low",
                        "title": "Aspect Ratio Near Guideline Limit (1.9:1)",
                        "explanation": "Standard 16:9 banner is 1.78:1. Aspect ratio 1.9:1 is accepted for Twitter/OG card format but verify cropping on mobile screens.",
                        "recommendation": "Confirm text safe zone boundaries."
                    }
                ],
                "color_deviations": [],
                "slide_reports": []
            }
        )
        create_visual_asset(
            brand_id=brand_id,
            filename="unapproved-social-graphic.png",
            original_name="Promo_Discount_Graphic_Draft.png",
            mime_type="image/png",
            file_size=184000,
            file_path="/uploads/unapproved-social-graphic.png",
            width=800,
            height=800,
            asset_type="image",
            audit_score=52.0,
            audit_status="failed",
            dominant_colors=[
                {"hex": "#ff3b30", "percentage": 42.0, "is_approved": False, "nearest_approved_hex": "#2563eb", "delta_e": 242.0},
                {"hex": "#ffcc00", "percentage": 31.0, "is_approved": False, "nearest_approved_hex": "#10b981", "delta_e": 168.0},
                {"hex": "#111827", "percentage": 27.0, "is_approved": True, "nearest_approved_hex": "#0f172a", "delta_e": 12.0}
            ],
            audit_results={
                "score": 52.0,
                "status": "failed",
                "dimensions": {"width": 800, "height": 800, "aspect_ratio": 1.0},
                "violations": [
                    {
                        "category": "Color Deviation",
                        "severity": "critical",
                        "title": "Unapproved Dominant Hue (#ff3b30) Detected",
                        "explanation": "Neon red (#ff3b30) occupies 42% of the canvas. This clashes with AetherCloud's serene cyber-blue enterprise identity.",
                        "recommendation": "Replace neon red background with approved #2563eb or #0f172a.",
                        "detected_value": "#ff3b30",
                        "expected_value": "#2563eb"
                    },
                    {
                        "category": "Color Deviation",
                        "severity": "high",
                        "title": "Unapproved Secondary Accent (#ffcc00) Detected",
                        "explanation": "Vibrant yellow (#ffcc00) is not registered in the brand color palette.",
                        "recommendation": "Use Emerald #10b981 or Electric Indigo #6366f1 for accent highlights.",
                        "detected_value": "#ffcc00",
                        "expected_value": "#10b981"
                    }
                ],
                "color_deviations": [],
                "slide_reports": []
            }
        )

    # 3. Brand Voice Historical Samples & Learned Voice Profile
    existing_samples = list_voice_samples(brand_id)
    if not existing_samples:
        s1 = create_voice_sample(
            brand_id=brand_id,
            title="AetherCloud Technical Architecture & Zero-Trust Whitepaper",
            source="Official 2024 Whitepaper",
            sample_text="AetherCloud delivers deterministic orchestration across distributed multi-cloud topologies. By leveraging hardware-attested cryptographic verification, our architecture guarantees provable execution integrity without compromising low-latency transaction throughput. Enterprise engineering teams maintain granular policy enforcement across containerized microservices.",
            word_count=39
        )
        s2 = create_voice_sample(
            brand_id=brand_id,
            title="SLA Compliance & Service Delivery Framework",
            source="Customer Service Agreement",
            sample_text="Our infrastructure commitment guarantees 99.95% operational availability under standard enterprise SLA contracts. Redundant multi-region failover protocols execute autonomously within 400 milliseconds of anomaly detection. We uphold transparent metrics and rigorous audit accountability for all tier-1 banking institutions.",
            word_count=38
        )
        s3 = create_voice_sample(
            brand_id=brand_id,
            title="Executive Strategy: Provable Cloud Governance",
            source="Annual Shareholder & Customer Letter",
            sample_text="In an era of automated cyber threats, deterministic brand and cloud governance is no longer optional. Organizations require verifiable evidence rather than speculative marketing assurances. AetherCloud provides the continuous compliance backbone that empowers engineering leaders to innovate fearlessly.",
            word_count=36
        )

    if not get_brand_voice_profile(brand_id):
        upsert_brand_voice_profile(brand_id, {
            "sample_count": 3,
            "total_words": 113,
            "formality_score": 78.5,
            "avg_sentence_length": 17.2,
            "vocab_complexity": 72.0,
            "active_voice_ratio": 91.5,
            "tone_attributes": ["Executive", "Authoritative", "Technically Precise", "Action-Oriented"],
            "preferred_terms": ["governance", "deterministic", "orchestration", "architecture", "enterprise", "compliance", "infrastructure"],
            "style_guidelines": [
                "Target average sentence length is 15-19 words for crisp executive cadence.",
                "Maintain a high formality index (75-85/100). Eliminate casual contractions and slang.",
                "Keep active voice constructions above 88% to preserve authoritative momentum.",
                "Anchor all claims in verifiable engineering facts and documented SLA figures."
            ]
        })

    # 4. CMS Publication Logs
    existing_logs = list_cms_publication_logs(brand_id, limit=5)
    if not existing_logs:
        create_cms_publication_log(
            brand_id=brand_id,
            cms_platform="WordPress",
            title="Announcing Zero-Trust Kubernetes Federation",
            channel="Engineering Blog",
            external_id="wp_post_4819",
            author="David Chen",
            decision="ALLOW",
            allowed=1,
            blockers=[],
            findings_summary={"critical": 0, "high": 0, "medium": 1, "low": 1, "total": 2},
            payload_preview="Today we are pleased to unveil zero-trust federated clusters across AetherCloud regions. Engineered with AES-256-GCM..."
        )
        create_cms_publication_log(
            brand_id=brand_id,
            cms_platform="HubSpot",
            title="Q4 Enterprise Promotional Campaign",
            channel="Marketing Landing Page",
            external_id="hs_page_9912",
            author="Alex Morgan",
            decision="BLOCK",
            allowed=0,
            blockers=[
                "Critical Violation [prohibited_claim]: Absolute Claim: '100% Guaranteed Zero Downtime' (\"100% guaranteed zero downtime\")",
                "Critical Violation [prohibited_claim]: Superlative Claim: 'cheapest in the world' (\"cheapest in the world\")",
                "High Severity Threshold Exceeded: 2 high-severity brand violations detected."
            ],
            findings_summary={"critical": 2, "high": 2, "medium": 1, "low": 0, "total": 5},
            payload_preview="AetherCloud is the cheapest in the world and provides 100% guaranteed zero downtime for enterprise clusters..."
        )


def _ensure_showcase_drafts(brand_id: int):
    existing_drafts = list_content_drafts(brand_id)
    existing_titles = {d["title"] for d in existing_drafts}

    showcase_drafts = [
        ContentDraftCreate(
            brand_id=brand_id,
            title="AetherCloud Enterprise Architecture Overview",
            channel="Technical Whitepaper",
            author="Elena Rostova (Principal Solutions Architect)",
            original_text="""AetherCloud delivers zero-trust orchestration for modern enterprise workloads. Founded in 2021 and headquartered in Austin, Texas, our infrastructure provides a 99.95% uptime SLA backed by AES-256-GCM encryption. Built on the AetherMesh Fabric, teams achieve seamless interoperability and provable compliance without sacrificing delivery velocity."""
        ),
        ContentDraftCreate(
            brand_id=brand_id,
            title="AetherCloud Product Release Notes — Terminology Demo",
            channel="Blog Post",
            author="David Chen (Marketing Lead)",
            original_text="""We are excited to share new updates for Aethercloud customers! Our engineering team has integrated Brandproof governance directly into the CloudMesh engine to help distributed teams collaborate faster across hybrid environments."""
        ),
        ContentDraftCreate(
            brand_id=brand_id,
            title="Q4 Promotional Campaign — Claims & Compliance Demo",
            channel="Landing Page & Social",
            author="Alex Morgan (Growth Marketer)",
            original_text="""AetherCloud is the cheapest in the world and provides 100% guaranteed zero downtime for enterprise clusters. Unlike legacy vendors, our security architecture is completely risk-free and offers game-changer synergy across all environments."""
        ),
        ContentDraftCreate(
            brand_id=brand_id,
            title="Corporate Trust & Fact Verification Briefing",
            channel="Press Release",
            author="Marcus Vance (Senior Evangelist)",
            original_text="""Since AetherCloud was founded in 2018, we have protected tier-1 banking infrastructure with military-grade 128-bit encryption and a 100% uptime guarantee for all enterprise customers."""
        ),
        ContentDraftCreate(
            brand_id=brand_id,
            title="Q4 Product Launch Announcement & Whitepaper Summary",
            channel="Press Release & Blog",
            author="Sarah Lin (Product Marketing Lead)",
            original_text="""We are thrilled to unveil our latest security innovation! Since Aethercloud was founded in 2018, our mission has been to disrupt the industry with revolutionary technology.

Our new CloudMesh orchestration engine provides 100% guaranteed zero downtime for mission-critical Kubernetes workloads. Unlike competitors, our platform is completely risk-free and the cheapest in the world.

With military-grade 128-bit encryption, your data is completely protected. This release represents tremendous synergy across our infrastructure stack, and our engineers are confident that this release is a true game-changer for DevOps teams worldwide."""
        ),
    ]

    for d in showcase_drafts:
        if d.title not in existing_titles:
            create_content_draft(d)

def seed_demo_data_if_empty():
    existing = list_brand_profiles()
    if existing:
        brand_id = existing[0]["id"]
        _ensure_showcase_drafts(brand_id)
        _ensure_round3_showcase(brand_id)
        return brand_id

    # 1. Create Demo Brand Profile: "AetherCloud"
    profile_data = BrandProfileCreate(
        name="AetherCloud",
        tagline="Autonomous, provable enterprise cloud security.",
        description="AetherCloud provides zero-trust governance and infrastructure orchestration for enterprise engineering teams.",
        industry="Enterprise Cloud Infrastructure & Cybersecurity",
        tone_attributes=["Authoritative", "Technically Precise", "Direct", "Humble & Transparent"]
    )
    profile = create_brand_profile(profile_data)
    brand_id = profile["id"]

    # 2. Approved Brand Rules
    rules = [
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="terminology",
            category="Terminology",
            title="Brand Casing: AetherCloud",
            description="Always spell AetherCloud with camel case 'AetherCloud'. Never use 'Aethercloud', 'aethercloud', or 'Aether Cloud'.",
            pattern_or_term="Aethercloud",
            preferred_term="AetherCloud",
            severity="high",
            rationale="Consistent capitalization builds recognized enterprise brand equity."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="terminology",
            category="Terminology",
            title="Brand Casing: BrandRoute AI",
            description="The governance suite is named 'BrandRoute AI'. Do not spell as 'Brandroute' or 'Brandproof'.",
            pattern_or_term="Brandproof",
            preferred_term="BrandRoute AI",
            severity="high",
            rationale="Protects trademark and official product naming integrity."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="terminology",
            category="Terminology",
            title="Deprecated Product Name: Legacy CloudMesh",
            description="'CloudMesh' is our decommissioned 2022 product. Use 'AetherMesh Fabric' for current architecture.",
            pattern_or_term="CloudMesh",
            preferred_term="AetherMesh Fabric",
            severity="critical",
            rationale="CloudMesh has been officially retired; customer contracts now reference AetherMesh Fabric."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="prohibited_claim",
            category="Claims & Compliance",
            title="No Absolute Uptime Guarantees",
            description="Never claim '100% guaranteed zero downtime' or 'unbreakable reliability'. All SLAs have maintenance windows.",
            pattern_or_term="100% guaranteed zero downtime",
            preferred_term="industry-leading 99.95% financially-backed SLA",
            severity="critical",
            rationale="Legal and SLA commitments: No cloud system can guarantee absolute 100% perpetual uptime."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="prohibited_claim",
            category="Claims & Compliance",
            title="Prohibited Superlative: 'Cheapest in the world'",
            description="AetherCloud does not compete on bottom-tier pricing. Prohibit unverified price superiority claims.",
            pattern_or_term="cheapest in the world",
            preferred_term="most cost-effective enterprise TCO",
            severity="high",
            rationale="Positions brand as cheap rather than enterprise-tier premium value."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="prohibited_claim",
            category="Claims & Compliance",
            title="Prohibited Safety Claim: 'Completely risk-free'",
            description="Compliance disallows claiming cybersecurity software is 'completely risk-free' or '100% unhackable'.",
            pattern_or_term="completely risk-free",
            preferred_term="architected with defence-in-depth risk mitigation",
            severity="critical",
            rationale="Regulatory compliance prevents unverified absolute security claims."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="voice",
            category="Tone & Style",
            title="Ban Empty Buzzwords: 'Synergy'",
            description="Avoid empty corporate buzzwords like 'synergy' or 'synergistic'. Speak directly about architectural integration.",
            pattern_or_term="synergy",
            preferred_term="seamless interoperability",
            severity="low",
            rationale="Enterprise engineers value technical clarity over empty corporate rhetoric."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="voice",
            category="Tone & Style",
            title="Avoid Cliché: 'Game-changer'",
            description="Replace hyperbolic marketing tropes like 'game-changer' with concrete performance metrics.",
            pattern_or_term="game-changer",
            preferred_term="high-impact architectural leap",
            severity="medium",
            rationale="Brand tone must remain humble, authoritative, and fact-focused."
        ),
    ]
    for r in rules:
        create_brand_rule(r)

    # 3. Approved Brand Facts
    facts = [
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="founded_year",
            fact_statement="AetherCloud was founded in 2021 by a team of distributed systems engineers.",
            verified_value="2021",
            evidence_source="Delaware Certificate of Incorporation #639201"
        ),
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="sla_uptime",
            fact_statement="Official enterprise uptime commitment under Master Services Agreement is 99.95%.",
            verified_value="99.95%",
            evidence_source="AetherCloud Master Services Agreement SLA Addendum v4"
        ),
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="encryption_standard",
            fact_statement="All data at rest and in transit is encrypted using AES-256-GCM and TLS 1.3.",
            verified_value="AES-256-GCM",
            evidence_source="SOC-2 Type II Audit Report & ISO 27001 Certification"
        ),
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="headquarters",
            fact_statement="AetherCloud global headquarters is located in Austin, Texas.",
            verified_value="Austin, Texas",
            evidence_source="Official Corporate Registry 2024"
        )
    ]
    for f in facts:
        create_brand_fact(f)

    # 4. Create Demonstration Showcase Drafts (Phase 4 Requirement)
    _ensure_showcase_drafts(brand_id)
    _ensure_round3_showcase(brand_id)

    return brand_id

