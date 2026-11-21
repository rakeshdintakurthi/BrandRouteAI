import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import {
  Palette,
  UploadCloud,
  FileImage,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Trash2,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';

export default function VisualGovernanceView({ selectedBrand, onToast }) {
  const [activeTab, setActiveTab] = useState('assets'); // 'assets' | 'config'
  const [visualProfile, setVisualProfile] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Visual Identity Config Form State
  const [primaryColors, setPrimaryColors] = useState([]);
  const [secondaryColors, setSecondaryColors] = useState([]);
  const [logoRules, setLogoRules] = useState({ aspect_ratio_min: 0.5, aspect_ratio_max: 3.5, clearspace_ratio: 0.15, min_resolution_px: 150 });
  const [typographyRules, setTypographyRules] = useState({ primary_font: 'Inter', secondary_font: 'Outfit', max_type_scale: 2.5 });
  const [guidelines, setGuidelines] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedBrand) {
      loadVisualData(selectedBrand.id);
    }
  }, [selectedBrand]);

  const loadVisualData = async (brandId) => {
    setIsLoading(true);
    try {
      const [profileData, assetsData] = await Promise.all([
        api.getVisualProfile(brandId).catch(() => null),
        api.getVisualAssets(brandId).catch(() => [])
      ]);

      if (profileData) {
        setVisualProfile(profileData);
        setPrimaryColors(profileData.primary_colors || []);
        setSecondaryColors(profileData.secondary_colors || []);
        setLogoRules(profileData.logo_rules || { aspect_ratio_min: 0.5, aspect_ratio_max: 3.5, clearspace_ratio: 0.15, min_resolution_px: 150 });
        setTypographyRules(profileData.typography_rules || { primary_font: 'Inter', secondary_font: 'Outfit', max_type_scale: 2.5 });
        setGuidelines(profileData.guidelines || '');
      }

      setAssets(assetsData || []);
      if (assetsData && assetsData.length > 0) {
        setSelectedAsset(assetsData[0]);
      } else {
        setSelectedAsset(null);
      }
    } catch (err) {
      console.error('Failed to load visual data:', err);
      onToast('danger', 'Failed to load visual governance data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBrand) return;

    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds maximum limit of 10MB.');
      onToast('danger', 'File exceeds 10MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      const newAsset = await api.uploadVisualAsset(selectedBrand.id, file);
      setAssets(prev => [newAsset, ...prev]);
      setSelectedAsset(newAsset);
      onToast('success', `Uploaded and audited '${file.name}' successfully!`);
    } catch (err) {
      const msg = err.message || 'Asset upload failed';
      setUploadError(msg);
      onToast('danger', msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReaudit = async (assetId) => {
    try {
      const updated = await api.reauditVisualAsset(assetId);
      setAssets(prev => prev.map(a => a.id === assetId ? updated : a));
      if (selectedAsset?.id === assetId) setSelectedAsset(updated);
      onToast('success', 'Visual audit updated successfully.');
    } catch (err) {
      onToast('danger', 'Re-audit failed: ' + err.message);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Delete this visual asset?')) return;
    try {
      await api.deleteVisualAsset(assetId);
      const remaining = assets.filter(a => a.id !== assetId);
      setAssets(remaining);
      setSelectedAsset(remaining.length > 0 ? remaining[0] : null);
      onToast('info', 'Asset deleted.');
    } catch (err) {
      onToast('danger', 'Failed to delete asset.');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!selectedBrand) return;
    setIsSavingConfig(true);
    try {
      const updated = await api.updateVisualProfile(selectedBrand.id, {
        primary_colors: primaryColors,
        secondary_colors: secondaryColors,
        logo_rules: logoRules,
        typography_rules: typographyRules,
        guidelines: guidelines
      });
      setVisualProfile(updated);
      onToast('success', 'Brand visual guidelines saved successfully.');
    } catch (err) {
      onToast('danger', 'Failed to save visual guidelines: ' + err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const addColorItem = (type) => {
    const newItem = { hex: '#3b82f6', name: 'New Color', role: type };
    if (type === 'primary') setPrimaryColors([...primaryColors, newItem]);
    else setSecondaryColors([...secondaryColors, newItem]);
  };

  const removeColorItem = (type, index) => {
    if (type === 'primary') setPrimaryColors(primaryColors.filter((_, i) => i !== index));
    else setSecondaryColors(secondaryColors.filter((_, i) => i !== index));
  };

  const updateColorItem = (type, index, field, value) => {
    if (type === 'primary') {
      const updated = [...primaryColors];
      updated[index][field] = value;
      setPrimaryColors(updated);
    } else {
      const updated = [...secondaryColors];
      updated[index][field] = value;
      setSecondaryColors(updated);
    }
  };

  const passedCount = assets.filter(a => a.audit_status === 'passed').length;
  const avgScore = assets.length > 0 ? Math.round(assets.reduce((acc, a) => acc + (a.audit_score || 0), 0) / assets.length) : 100;

  return (
    <div className="view-container animate-fade-in">
      {/* Top Header Card */}
      <div className="dashboard-hero-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '1px solid #312e81' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(115, 103, 240, 0.2)', border: '1px solid rgba(115, 103, 240, 0.4)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              <Palette size={14} /> MULTIMODAL GOVERNANCE ENGINE
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
              Visual & Layout Governance
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '650px', lineHeight: '1.5' }}>
              Audits marketing imagery, brand color adherence, typography hierarchy, logo bounds, and presentation slide decks against official brand standards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: avgScore >= 80 ? '#4ade80' : '#fbbf24' }}>{avgScore}%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Avg Visual Score</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff' }}>{passedCount} / {assets.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assets Approved</div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.25rem' }}>
          <button
            onClick={() => setActiveTab('assets')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              background: activeTab === 'assets' ? '#7367f0' : 'transparent',
              color: activeTab === 'assets' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FileImage size={16} /> Asset Audits & Slide Decks ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              background: activeTab === 'config' ? '#7367f0' : 'transparent',
              color: activeTab === 'config' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <SlidersHorizontal size={16} /> Visual Identity Standards
          </button>
        </div>
      </div>

      {activeTab === 'assets' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Asset Upload & List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Upload Box */}
            <div className="card" style={{ padding: '1.25rem', border: '2px dashed #cbd5e1', textAlign: 'center', background: '#fafafc' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".png,.jpg,.jpeg,.pptx"
                style={{ display: 'none' }}
              />
              <UploadCloud size={36} color="#7367f0" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>Upload Brand Asset</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                PNG, JPG, JPEG or PPTX slide decks (Max 10MB)
              </p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Analyzing Multimodal Asset...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Choose File to Audit</span>
                  </>
                )}
              </button>
              {uploadError && (
                <div style={{ marginTop: '0.75rem', color: '#ef4444', fontSize: '0.75rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '6px' }}>
                  {uploadError}
                </div>
              )}
            </div>

            {/* Asset List */}
            <div className="card" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Audited Assets ({assets.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '520px', overflowY: 'auto' }}>
                {assets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No visual assets uploaded yet. Upload a banner or slide deck above.
                  </div>
                ) : (
                  assets.map(asset => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const isPassed = asset.audit_status === 'passed';
                    const isFailed = asset.audit_status === 'failed';
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #7367f0' : '1px solid #e2e8f0',
                          background: isSelected ? '#f5f3ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {asset.asset_type === 'pptx' ? (
                            <Presentation size={22} color="#f97316" />
                          ) : (
                            <FileImage size={22} color="#7367f0" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {asset.original_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{Math.round(asset.file_size / 1024)} KB</span>
                            <span>•</span>
                            <span style={{ textTransform: 'uppercase' }}>{asset.asset_type}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '999px',
                            background: isPassed ? '#dcfce7' : isFailed ? '#fee2e2' : '#fef3c7',
                            color: isPassed ? '#166534' : isFailed ? '#991b1b' : '#92400e'
                          }}>
                            {Math.round(asset.audit_score)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Visual Audit Inspection Report */}
          {selectedAsset ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Inspection Summary Card */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                        {selectedAsset.original_name}
                      </h2>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: selectedAsset.audit_status === 'passed' ? '#dcfce7' : selectedAsset.audit_status === 'failed' ? '#fee2e2' : '#fef3c7',
                        color: selectedAsset.audit_status === 'passed' ? '#166534' : selectedAsset.audit_status === 'failed' ? '#991b1b' : '#92400e'
                      }}>
                        {selectedAsset.audit_status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Dimensions: {selectedAsset.width} × {selectedAsset.height} px • Type: {selectedAsset.asset_type.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleReaudit(selectedAsset.id)}
                      title="Re-run visual compliance audit"
                    >
                      <RefreshCw size={14} /> Re-audit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => handleDeleteAsset(selectedAsset.id)}
                      title="Delete asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Score & KPI Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: `conic-gradient(#7367f0 ${selectedAsset.audit_score * 3.6}deg, #e2e8f0 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}>
                      <div style={{ width: '100%', height: '100%', background: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem', color: '#1e293b' }}>
                        {Math.round(selectedAsset.audit_score)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>COMPLIANCE SCORE</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: selectedAsset.audit_score >= 80 ? '#16a34a' : '#d97706' }}>
                        {selectedAsset.audit_score >= 85 ? 'Full Compliance' : selectedAsset.audit_score >= 60 ? 'Requires Review' : 'Critical Violations'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>PALETTE MATCH</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                      {selectedAsset.dominant_colors.filter(c => c.is_approved).length} / {selectedAsset.dominant_colors.length} Approved
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>VIOLATIONS DETECTED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: (selectedAsset.audit_results?.violations?.length || 0) > 0 ? '#ef4444' : '#16a34a' }}>
                      {selectedAsset.audit_results?.violations?.length || 0} issues
                    </div>
                  </div>
                </div>

                {/* Dominant Color Palette Extracted */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={16} color="#7367f0" /> Extracted Dominant Palette vs Approved Brand Rules
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {selectedAsset.dominant_colors.map((c, i) => (
                      <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', background: '#ffffff', textAlign: 'center' }}>
                        <div style={{ height: '36px', borderRadius: '6px', background: c.hex, border: '1px solid rgba(0,0,0,0.1)', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>{c.hex.toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0' }}>{c.percentage}% canvas</div>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '999px',
                          background: c.is_approved ? '#dcfce7' : '#fee2e2',
                          color: c.is_approved ? '#166534' : '#991b1b'
                        }}>
                          {c.is_approved ? 'APPROVED' : 'UNAPPROVED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Violations & Governance Recommendations */}
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>
                    Visual Rule Checks & Actionable Guidance
                  </h4>
                  {(!selectedAsset.audit_results?.violations || selectedAsset.audit_results.violations.length === 0) ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#166534' }}>
                      <CheckCircle2 size={20} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        Zero visual violations detected. Asset conforms to color, typography, and resolution guidelines.
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedAsset.audit_results.violations.map((v, idx) => {
                        const isCrit = v.severity === 'critical';
                        const isHigh = v.severity === 'high';
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              border: isCrit ? '1px solid #f87171' : isHigh ? '1px solid #fdba74' : '1px solid #e2e8f0',
                              background: isCrit ? '#fef2f2' : isHigh ? '#fffbeb' : '#ffffff'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isCrit ? '#991b1b' : isHigh ? '#9a3412' : '#1e293b' }}>
                                {v.title}
                              </span>
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                                background: isCrit ? '#fee2e2' : isHigh ? '#ffedd5' : '#e0e7ff',
                                color: isCrit ? '#991b1b' : isHigh ? '#9a3412' : '#3730a3'
                              }}>
                                {v.severity}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                              {v.explanation}
                            </p>
                            <div style={{ fontSize: '0.75rem', color: '#0f766e', background: 'rgba(20, 184, 166, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                              <strong>Recommendation:</strong> {v.recommendation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* PPTX Slide-by-Slide Breakdown if applicable */}
                {selectedAsset.asset_type === 'pptx' && selectedAsset.audit_results?.slide_reports && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Presentation size={16} color="#f97316" /> Slide Deck Inspection ({selectedAsset.audit_results.slide_reports.length} slides)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      {selectedAsset.audit_results.slide_reports.map((s, idx) => (
                        <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', background: s.violations_count === 0 ? '#f0fdf4' : '#fffbeb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>Slide {s.slide_number}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '999px', background: s.violations_count === 0 ? '#bbf7d0' : '#fed7aa', color: s.violations_count === 0 ? '#166534' : '#9a3412' }}>
                              {s.violations_count === 0 ? 'COMPLIANT' : `${s.violations_count} ISSUES`}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Words: {s.text_word_count}</div>
                          {s.detected_fonts?.length > 0 && (
                            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem' }}>Fonts: {s.detected_fonts.join(', ')}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Palette size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
              <h3>No Asset Selected</h3>
              <p style={{ fontSize: '0.875rem' }}>Select an asset from the left to inspect its visual compliance report or upload a new one.</p>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: Visual Identity Configuration Form */
        <form onSubmit={handleSaveConfig} className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
              Brand Visual Guidelines Configuration
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Define approved hex palettes, typography pairings, and layout constraints for {selectedBrand?.name || 'the brand'}.
            </p>
          </div>

          {/* Primary Colors */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>Primary Brand Colors</label>
              <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => addColorItem('primary')}>
                + Add Primary Color
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {primaryColors.map((col, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <input
                    type="color"
                    value={col.hex}
                    onChange={(e) => updateColorItem('primary', idx, 'hex', e.target.value)}
                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={col.hex}
                    onChange={(e) => updateColorItem('primary', idx, 'hex', e.target.value)}
                    style={{ width: '80px', padding: '0.35rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={col.name}
                    onChange={(e) => updateColorItem('primary', idx, 'name', e.target.value)}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.8rem' }}
                  />
                  <button type="button" onClick={() => removeColorItem('primary', idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>Secondary & Accent Colors</label>
              <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => addColorItem('secondary')}>
                + Add Secondary Color
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {secondaryColors.map((col, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <input
                    type="color"
                    value={col.hex}
                    onChange={(e) => updateColorItem('secondary', idx, 'hex', e.target.value)}
                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={col.hex}
                    onChange={(e) => updateColorItem('secondary', idx, 'hex', e.target.value)}
                    style={{ width: '80px', padding: '0.35rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={col.name}
                    onChange={(e) => updateColorItem('secondary', idx, 'name', e.target.value)}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.8rem' }}
                  />
                  <button type="button" onClick={() => removeColorItem('secondary', idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Typography & Layout Rules Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Typography Guidelines</h4>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Primary Font Family</label>
                <input
                  type="text"
                  value={typographyRules.primary_font}
                  onChange={(e) => setTypographyRules({ ...typographyRules, primary_font: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Secondary / Display Font</label>
                <input
                  type="text"
                  value={typographyRules.secondary_font}
                  onChange={(e) => setTypographyRules({ ...typographyRules, secondary_font: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Logo & Aspect Ratio Bounds</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Min Ratio</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logoRules.aspect_ratio_min}
                    onChange={(e) => setLogoRules({ ...logoRules, aspect_ratio_min: parseFloat(e.target.value) || 0.5 })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Max Ratio</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logoRules.aspect_ratio_max}
                    onChange={(e) => setLogoRules({ ...logoRules, aspect_ratio_max: parseFloat(e.target.value) || 3.5 })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Min Asset Resolution (px)</label>
                <input
                  type="number"
                  value={logoRules.min_resolution_px}
                  onChange={(e) => setLogoRules({ ...logoRules, min_resolution_px: parseInt(e.target.value, 10) || 100 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>

          {/* Written Guidelines */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>
              Written Layout & Creative Guidelines
            </label>
            <textarea
              rows={3}
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              placeholder="e.g. Maintain 15% clearspace padding around logos. Ensure high visual contrast for CTA buttons..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSavingConfig}
            >
              {isSavingConfig ? 'Saving Standards...' : 'Save Visual Identity Standards'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
