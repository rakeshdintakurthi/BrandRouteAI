// API Client for BrandProof FastAPI Backend

const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorMsg = `Server error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // System
  getAppInfo: () => request('/'),
  getHealth: () => request('/health'),
  seedDemo: () => request('/api/seed', { method: 'POST' }),

  // Brands
  getBrands: () => request('/api/brands'),
  getBrand: (id) => request(`/api/brands/${id}`),
  createBrand: (data) => request('/api/brands', { method: 'POST', body: JSON.stringify(data) }),

  // Rules
  getRules: (brandId) => request(`/api/brands/${brandId}/rules`),
  createRule: (data) => request('/api/rules', { method: 'POST', body: JSON.stringify(data) }),
  deleteRule: (ruleId) => request(`/api/rules/${ruleId}`, { method: 'DELETE' }),

  // Facts
  getFacts: (brandId) => request(`/api/brands/${brandId}/facts`),
  createFact: (data) => request('/api/facts', { method: 'POST', body: JSON.stringify(data) }),
  deleteFact: (factId) => request(`/api/facts/${factId}`, { method: 'DELETE' }),

  // Drafts
  getDrafts: (brandId) => request(brandId ? `/api/drafts?brand_id=${brandId}` : '/api/drafts'),
  getDraft: (draftId) => request(`/api/drafts/${draftId}`),
  createDraft: (data) => request('/api/drafts', { method: 'POST', body: JSON.stringify(data) }),
  updateDraft: (draftId, currentText, editorNotes = null) =>
    request(`/api/drafts/${draftId}`, {
      method: 'PUT',
      body: JSON.stringify({ current_text: currentText, editor_notes: editorNotes }),
    }),

  // Governance Analysis
  analyzeDraft: (draftId, runAi = true) =>
    request(`/api/drafts/${draftId}/analyze?run_ai=${runAi}`, { method: 'POST' }),
  getFindings: (draftId) => request(`/api/drafts/${draftId}/findings`),
  getTrustReport: (draftId) => request(`/api/drafts/${draftId}/trust-report`),

  // Correction Action (Accept / Reject / Edit)
  applyFindingAction: (findingId, action, customCorrection = null) =>
    request(`/api/findings/${findingId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, custom_correction: customCorrection }),
    }),

  // Review Workflow
  transitionReview: (draftId, toStatus, reviewerName, notes = null) =>
    request(`/api/drafts/${draftId}/review-transition`, {
      method: 'POST',
      body: JSON.stringify({
        to_status: toStatus,
        reviewer_name: reviewerName,
        notes: notes,
      }),
    }),
  getReviewHistory: (draftId) => request(`/api/drafts/${draftId}/review-history`),

  // ================= ROUND 3 API ENDPOINTS =================

  // 1. Visual Governance
  getVisualProfile: (brandId) => request(`/api/brands/${brandId}/visual-profile`),
  updateVisualProfile: (brandId, profileData) =>
    request(`/api/brands/${brandId}/visual-profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  getVisualAssets: (brandId) => request(`/api/brands/${brandId}/visual-assets`),
  uploadVisualAsset: async (brandId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${API_BASE}/api/brands/${brandId}/visual-assets/upload`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      let errStr = `Upload failed (${res.status})`;
      try {
        const j = await res.json();
        errStr = j.detail || errStr;
      } catch {}
      throw new Error(errStr);
    }
    return await res.json();
  },
  reauditVisualAsset: (assetId) =>
    request(`/api/visual-assets/${assetId}/audit`, { method: 'POST' }),
  deleteVisualAsset: (assetId) =>
    request(`/api/visual-assets/${assetId}`, { method: 'DELETE' }),

  // 2. Brand Voice Intelligence
  getVoiceSamples: (brandId) => request(`/api/brands/${brandId}/voice-samples`),
  addVoiceSample: (brandId, sampleData) =>
    request(`/api/brands/${brandId}/voice-samples`, {
      method: 'POST',
      body: JSON.stringify(sampleData),
    }),
  deleteVoiceSample: (brandId, sampleId) =>
    request(`/api/brands/${brandId}/voice-samples/${sampleId}`, { method: 'DELETE' }),
  getVoiceProfile: (brandId) => request(`/api/brands/${brandId}/voice-profile`),
  generateVoiceProfile: (brandId) =>
    request(`/api/brands/${brandId}/voice-profile/generate`, { method: 'POST' }),
  analyzeDraftVoice: (draftId) =>
    request(`/api/drafts/${draftId}/voice-analysis`, { method: 'POST' }),
  analyzeCustomTextVoice: (brandId, text) =>
    request(`/api/brands/${brandId}/voice-analysis`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // 3. CMS Integrations
  checkCMSPublication: (payload) =>
    request('/api/integrations/cms/publish-check', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCMSLogs: (brandId) =>
    request(brandId ? `/api/integrations/cms/logs?brand_id=${brandId}` : '/api/integrations/cms/logs'),
  getCMSAdapters: () => request('/api/integrations/cms/adapters'),
};
