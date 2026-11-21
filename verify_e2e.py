import httpx

def test_full_e2e_flow():
    client = httpx.Client(base_url='http://127.0.0.1:8000')

    # 1. Health & Info
    info = client.get('/').json()
    health = client.get('/health').json()
    print('[1] Backend Info:', info['name'], '| Version:', info['version'], '| Health:', health['status'])
    assert health['status'] == 'healthy'

    # 2. Brand & Rules & Facts
    brands = client.get('/api/brands').json()
    assert len(brands) > 0
    brand_id = brands[0]['id']
    rules = client.get(f'/api/brands/{brand_id}/rules').json()
    facts = client.get(f'/api/brands/{brand_id}/facts').json()
    print(f'[2] Brand: "{brands[0]["name"]}" | Rules: {len(rules)} | Facts: {len(facts)}')
    assert len(rules) >= 5
    assert len(facts) >= 3

    # 3. Create isolated test draft for verification (preserves demo drafts intact)
    test_draft = client.post('/api/drafts', json={
        'brand_id': brand_id,
        'title': 'E2E Automated Verification Test Draft',
        'channel': 'Press Release',
        'author': 'QA Automated Auditor',
        'original_text': 'Since Aethercloud was founded in 2018, our CloudMesh engine provides 100% guaranteed zero downtime. Our platform is completely risk-free and cheapest in the world. With military-grade 128-bit encryption, we drive incredible synergy.'
    }).json()
    draft_id = test_draft['id']
    draft_title = test_draft["title"]
    print(f'[3] Created isolated E2E test draft #{draft_id}: "{draft_title}"')

    # 4. Audit
    analysis = client.post(f'/api/drafts/{draft_id}/analyze?run_ai=false').json()
    print(f'[4] Audit completed! Total findings: {analysis["total_findings"]}')
    assert analysis["total_findings"] >= 4
    for f in analysis['findings']:
        print(f'   - [{f["severity"].upper()}] {f["title"]} -> Matched: "{f.get("matched_text")}"')

    # 5. Accept a correction
    cloudmesh_finding = next((f for f in analysis['findings'] if 'CloudMesh' in (f.get('matched_text') or '')), None)
    assert cloudmesh_finding is not None
    action_res = client.post(f'/api/findings/{cloudmesh_finding["id"]}/action', json={'action': 'accept'}).json()
    print('[5] Accepted correction for CloudMesh:', action_res['message'])
    updated_draft = client.get(f'/api/drafts/{draft_id}').json()
    assert 'AetherMesh Fabric' in updated_draft['current_text']
    assert 'CloudMesh' not in updated_draft['current_text']
    print('   -> Verified "AetherMesh Fabric" is successfully written to database!')

    # 6. Workflow transitions
    t1 = client.post(
        f'/api/drafts/{draft_id}/review-transition',
        json={'to_status': 'In Review', 'reviewer_name': 'Reviewer Lead', 'notes': 'Starting brand compliance audit'}
    ).json()
    print('[6] Transitioned to In Review:', t1['message'])

    # 7. Attempt approval with open critical findings (must fail)
    bad_app = client.post(
        f'/api/drafts/{draft_id}/review-transition',
        json={'to_status': 'Approved', 'reviewer_name': 'Boss'}
    )
    assert bad_app.status_code == 400
    err_detail = bad_app.json()['detail']
    print(f'[7] Attempted Approve with critical findings: status={bad_app.status_code}, detail="{err_detail}"')
    assert 'unresolved critical finding' in err_detail.lower()

    # 8. Resolve remaining open findings
    remaining = client.get(f'/api/drafts/{draft_id}/findings').json()
    for rem in remaining:
        if rem['status'] == 'open':
            client.post(
                f'/api/findings/{rem["id"]}/action',
                json={'action': 'accept' if rem.get('suggested_correction') else 'reject'}
            )
    print('[8] Resolved all remaining findings.')

    # 9. Now transition to Approved
    t2 = client.post(
        f'/api/drafts/{draft_id}/review-transition',
        json={'to_status': 'Approved', 'reviewer_name': 'Compliance Officer', 'notes': 'All governance checks passed.'}
    ).json()
    print('[9] Approved successfully after resolving findings:', t2['message'])

    # 10. History check & Trust Report Verification
    history = client.get(f'/api/drafts/{draft_id}/review-history').json()
    print(f'[10] Review history trail has {len(history)} entries. Final status: {history[-1]["to_status"]}')
    assert history[-1]['to_status'] == 'Approved'

    trust_report = client.get(f'/api/drafts/{draft_id}/trust-report').json()
    print(f'[10.1] Brand Trust Report: readiness="{trust_report["publication_readiness"]}", blockers={len(trust_report["blockers"])}, total_resolved={trust_report["resolved_summary"]["total_resolved"]}')
    assert trust_report['publication_readiness'] == 'Approved for Publication'
    assert trust_report['is_approval_blocked'] is False
    assert len(trust_report['blockers']) == 0
    assert trust_report['total_unresolved'] == 0
    assert trust_report['resolved_summary']['total_resolved'] > 0

    # 11. Test Frontend Dev Server HTML (if running)
    try:
        frontend_res = httpx.get('http://localhost:5173', timeout=3.0)
        assert frontend_res.status_code == 200
        assert ('BrandRoute' in frontend_res.text or 'BrandProof' in frontend_res.text or 'VeriBrand' in frontend_res.text)
        print('[11] Frontend server is serving BrandRoute AI UI on http://localhost:5173 (HTTP 200)')
    except Exception as e:
        print('[11] Note: Frontend dev server not active or reachable at port 5173 (non-fatal for backend e2e)')

    # 12. Round 3 Improvement 1: Visual Governance E2E
    v_profile = client.get(f'/api/brands/{brand_id}/visual-profile').json()
    print(f'[12] Visual Governance: Profile has {len(v_profile.get("primary_colors", []))} primary colors')
    assert len(v_profile.get("primary_colors", [])) >= 1
    v_assets = client.get(f'/api/brands/{brand_id}/visual-assets').json()
    print(f'     -> Found {len(v_assets)} visual assets in database')
    assert len(v_assets) >= 1

    # 13. Round 3 Improvement 3: Brand Voice Intelligence E2E
    voice_profile = client.get(f'/api/brands/{brand_id}/voice-profile').json()
    print(f'[13] Brand Voice DNA: Target Formality={voice_profile["formality_score"]}, Active Voice={voice_profile["active_voice_ratio"]}%')
    assert voice_profile['formality_score'] > 0
    voice_analysis = client.post(f'/api/brands/{brand_id}/voice-analysis', json={
        'text': 'AetherCloud delivers zero-trust orchestration for modern enterprise workloads with deterministic enforcement across distributed systems. Our infrastructure provides a provable 99.95% uptime SLA backed by AES-256-GCM encryption and SOC-2 Type II audit compliance.'
    }).json()
    print(f'     -> Custom text consistency score: {voice_analysis["consistency_score"]}%')
    assert voice_analysis['consistency_score'] >= 75.0

    # 14. Round 3 Improvement 2: CMS Webhook Gateway E2E
    cms_block = client.post('/api/integrations/cms/publish-check', json={
        'brand_id': brand_id,
        'cms_platform': 'WordPress',
        'title': 'Blocked Promo',
        'channel': 'Blog',
        'content': 'AetherCloud is the cheapest in the world and provides 100% guaranteed zero downtime.',
        'author': 'Marketer'
    }).json()
    print(f'[14.1] CMS Webhook Gate: Decision="{cms_block["decision"]}", Blockers={len(cms_block["blockers"])}')
    assert cms_block['decision'] == 'BLOCK'
    assert cms_block['allowed'] is False

    cms_allow = client.post('/api/integrations/cms/publish-check', json={
        'brand_id': brand_id,
        'cms_platform': 'HubSpot',
        'title': 'Compliant Release',
        'channel': 'Blog',
        'content': 'AetherCloud was founded in 2021 and delivers high-reliability zero-trust governance with a 99.95% uptime SLA.',
        'author': 'Engineer'
    }).json()
    print(f'[14.2] CMS Webhook Gate: Decision="{cms_allow["decision"]}", Allowed={cms_allow["allowed"]}')
    assert cms_allow['decision'] == 'ALLOW'
    assert cms_allow['allowed'] is True

    print('\n=============================================')
    print('ALL ROUND 3 E2E INTEGRATION CHECKS PASSED!')
    print('=============================================')

if __name__ == '__main__':
    test_full_e2e_flow()
