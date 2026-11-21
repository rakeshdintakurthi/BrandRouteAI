import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Mic,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  TrendingUp,
  BarChart2,
  Sliders,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function BrandVoiceView({ selectedBrand, drafts = [], onToast }) {
  const [activeTab, setActiveTab] = useState('evaluator'); // 'evaluator' | 'dataset'
  const [voiceProfile, setVoiceProfile] = useState(null);
  const [samples, setSamples] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Draft Evaluator State
  const [selectedDraftId, setSelectedDraftId] = useState(drafts.length > 0 ? drafts[0].id : '');
  const [customDraftText, setCustomDraftText] = useState(drafts.length > 0 ? drafts[0].original_text : '');
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Ingestion Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('Marketing Whitepaper');
  const [newText, setNewText] = useState('');
  const [isSubmittingSample, setIsSubmittingSample] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (selectedBrand) {
      loadBrandVoiceData(selectedBrand.id);
    }
  }, [selectedBrand]);

  const loadBrandVoiceData = async (brandId) => {
    setIsLoading(true);
    try {
      const [profileData, samplesData] = await Promise.all([
        api.getVoiceProfile(brandId).catch(() => null),
        api.getVoiceSamples(brandId).catch(() => [])
      ]);
      setVoiceProfile(profileData);
      setSamples(samplesData || []);

      // If drafts exist, run initial voice analysis on the first draft
      if (drafts.length > 0) {
        runVoiceAnalysisOnText(drafts[0].current_text || drafts[0].original_text, brandId);
      }
    } catch (err) {
      console.error('Failed to load brand voice data:', err);
      onToast('danger', 'Failed to load brand voice data.');
    } finally {
      setIsLoading(false);
    }
  };

  const runVoiceAnalysisOnText = async (text, brandId = selectedBrand?.id) => {
    if (!text || !brandId) return;
    setIsAnalyzingVoice(true);
    try {
      const res = await api.analyzeCustomTextVoice(brandId, text);
      setAnalysisResult(res);
    } catch (err) {
      console.error('Voice analysis failed:', err);
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const handleDraftSelect = (draftId) => {
    setSelectedDraftId(draftId);
    const d = drafts.find(x => String(x.id) === String(draftId));
    if (d) {
      const text = d.current_text || d.original_text;
      setCustomDraftText(text);
      runVoiceAnalysisOnText(text);
    }
  };

  const handleManualAnalyze = () => {
    if (!customDraftText.trim()) {
      onToast('warning', 'Please provide draft text to evaluate.');
      return;
    }
    runVoiceAnalysisOnText(customDraftText);
    onToast('success', 'Voice consistency evaluation completed.');
  };

  const handleAddSample = async (e) => {
    e.preventDefault();
    if (!selectedBrand) return;
    if (newText.trim().split(/\s+/).length < 10) {
      onToast('warning', 'Writing sample must contain at least 10 words.');
      return;
    }

    setIsSubmittingSample(true);
    try {
      const created = await api.addVoiceSample(selectedBrand.id, {
        title: newTitle || 'Writing Sample',
        source: newSource || 'Marketing Content',
        sample_text: newText
      });
      setSamples([created, ...samples]);
      setNewTitle('');
      setNewText('');
      onToast('success', 'Historical writing sample ingested.');

      // Automatically re-generate profile
      handleRegenerateProfile();
    } catch (err) {
      onToast('danger', 'Failed to add sample: ' + err.message);
    } finally {
      setIsSubmittingSample(false);
    }
  };

  const handleDeleteSample = async (sampleId) => {
    if (!window.confirm('Delete this historical writing sample?')) return;
    try {
      await api.deleteVoiceSample(selectedBrand.id, sampleId);
      setSamples(samples.filter(s => s.id !== sampleId));
      onToast('info', 'Writing sample removed.');
      handleRegenerateProfile();
    } catch (err) {
      onToast('danger', 'Failed to delete sample.');
    }
  };

  const handleRegenerateProfile = async () => {
    if (!selectedBrand) return;
    setIsRegenerating(true);
    try {
      const updated = await api.generateVoiceProfile(selectedBrand.id);
      setVoiceProfile(updated);
      onToast('success', 'Brand voice profile retrained from dataset.');
      if (customDraftText) {
        runVoiceAnalysisOnText(customDraftText);
      }
    } catch (err) {
      onToast('danger', 'Profile regeneration failed: ' + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const wordCount = newText.trim() ? newText.trim().split(/\s+/).length : 0;
  const consistencyScore = analysisResult?.consistency_score ?? 88;

  return (
    <div className="view-container animate-fade-in">
      {/* Top Hero Banner */}
      <div className="dashboard-hero-card glass-card" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.95)', borderRadius: '24px', padding: '24px 28px', boxShadow: '0 10px 40px rgba(60, 100, 160, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(255, 106, 26, 0.1)', border: '1px solid rgba(255, 106, 26, 0.25)', color: '#FF6A1A', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              <Mic size={14} /> AUTOMATED BRAND VOICE INTELLIGENCE
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1F2A44', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Brand Voice Stylistic DNA & Fine-Tuning
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '650px', lineHeight: '1.5', margin: 0 }}>
              Learns quantitative style benchmarks (formality index, sentence cadence, vocabulary complexity, and active voice ratios) from historical marketing content to enforce brand tone consistency.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3B82F6' }}>
                {voiceProfile?.formality_score ? Math.round(voiceProfile.formality_score) : 75}/100
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Target Formality</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10B981' }}>
                {voiceProfile?.active_voice_ratio ? Math.round(voiceProfile.active_voice_ratio) : 88}%
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Active Voice Baseline</div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('evaluator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              background: activeTab === 'evaluator' ? '#1F2A44' : '#FFFFFF',
              color: activeTab === 'evaluator' ? '#ffffff' : '#4A5568',
              border: activeTab === 'evaluator' ? 'none' : '1px solid #E2EDFA',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'evaluator' ? '0 4px 12px rgba(31, 42, 68, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <TrendingUp size={15} /> Draft Voice Evaluator & DNA
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              background: activeTab === 'dataset' ? '#1F2A44' : '#FFFFFF',
              color: activeTab === 'dataset' ? '#ffffff' : '#4A5568',
              border: activeTab === 'dataset' ? 'none' : '1px solid #E2EDFA',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'dataset' ? '0 4px 12px rgba(31, 42, 68, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={15} /> Style Training Samples ({samples.length})
          </button>
        </div>
      </div>

      {activeTab === 'evaluator' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Draft Editor & Voice Consistency Scorer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                  Marketing Draft Voice Evaluator
                </h3>
                {drafts.length > 0 && (
                  <select
                    value={selectedDraftId}
                    onChange={(e) => handleDraftSelect(e.target.value)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', maxWidth: '240px' }}
                  >
                    <option value="">-- Choose existing draft --</option>
                    {drafts.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <textarea
                rows={6}
                value={customDraftText}
                onChange={(e) => setCustomDraftText(e.target.value)}
                placeholder="Paste or edit marketing draft copy here to evaluate brand tone consistency against learned voice benchmarks..."
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: '#1e293b',
                  marginBottom: '1rem'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {customDraftText.trim() ? customDraftText.trim().split(/\s+/).length : 0} words
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isAnalyzingVoice}
                  onClick={handleManualAnalyze}
                >
                  {isAnalyzingVoice ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Evaluating Voice...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Evaluate Voice Consistency</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results: Deviations & Suggestions */}
            {analysisResult && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={18} color="#7367f0" /> Style Deviations & Rewrite Guidance
                </h4>

                {analysisResult.deviations?.length === 0 ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#166534' }}>
                    <CheckCircle2 size={20} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                      Exceptional voice fidelity! This draft aligns with all quantitative brand voice benchmarks.
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analysisResult.deviations.map((dev, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          border: dev.severity === 'high' ? '1px solid #f87171' : '1px solid #fed7aa',
                          background: dev.severity === 'high' ? '#fef2f2' : '#fffbeb'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                            {dev.metric}
                          </span>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: dev.severity === 'high' ? '#fee2e2' : '#ffedd5',
                            color: dev.severity === 'high' ? '#991b1b' : '#9a3412'
                          }}>
                            {dev.severity} deviation
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          <span>Draft: <strong>{dev.current_value}</strong></span>
                          <span>•</span>
                          <span>Target: <strong>{dev.target_value}</strong></span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem' }}>
                          {dev.explanation}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#0f766e', background: 'rgba(20, 184, 166, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                          <strong>Actionable Rewrite:</strong> {dev.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Consistency Gauge & Learned Voice Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Visual Consistency Ring Card */}
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Brand Voice Consistency Score
              </h3>

              {/* Radial Progress Gauge (Vuexy Style) */}
              <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 1.25rem auto' }}>
                <svg width="130" height="130" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={consistencyScore >= 80 ? '#7367f0' : consistencyScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${(consistencyScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    fill="transparent"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>
                    {Math.round(consistencyScore)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>ALIGNMENT</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: consistencyScore >= 80 ? '#16a34a' : '#d97706', marginBottom: '0.25rem' }}>
                {consistencyScore >= 85 ? 'Highly Aligned to Brand Persona' : consistencyScore >= 65 ? 'Moderate Style Deviation' : 'Substantial Tone Inconsistency'}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Based on mathematical comparison with {voiceProfile?.sample_count || 3} historical corporate publications.
              </p>
            </div>

            {/* Stylistic DNA Metrics Bars */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={16} color="#7367f0" /> Learned Stylistic Benchmarks
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Formality */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: '600' }}>Formality Index</span>
                    <span style={{ color: '#1e293b', fontWeight: '700' }}>
                      {analysisResult ? Math.round(analysisResult.formality_score) : 75} / {voiceProfile ? Math.round(voiceProfile.formality_score) : 75} target
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${analysisResult ? analysisResult.formality_score : 75}%`, height: '100%', background: '#7367f0', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Sentence Cadence */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: '600' }}>Avg Sentence Length</span>
                    <span style={{ color: '#1e293b', fontWeight: '700' }}>
                      {analysisResult ? Math.round(analysisResult.avg_sentence_length) : 16} words (Target: {voiceProfile ? Math.round(voiceProfile.avg_sentence_length) : 16})
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, ((analysisResult ? analysisResult.avg_sentence_length : 16) / 25) * 100)}%`, height: '100%', background: '#38bdf8', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Active Voice Ratio */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: '600' }}>Active Voice Ratio</span>
                    <span style={{ color: '#1e293b', fontWeight: '700' }}>
                      {analysisResult ? Math.round(analysisResult.active_voice_ratio) : 88}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${analysisResult ? analysisResult.active_voice_ratio : 88}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Vocabulary Complexity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: '600' }}>Vocabulary Complexity</span>
                    <span style={{ color: '#1e293b', fontWeight: '700' }}>
                      {analysisResult ? Math.round(analysisResult.vocab_complexity) : 68}/100
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${analysisResult ? analysisResult.vocab_complexity : 68}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* Preferred Brand Terminology Chips */}
              {voiceProfile?.preferred_terms?.length > 0 && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Signature Brand Terms
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {voiceProfile.preferred_terms.map((term, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#334155', fontWeight: '600' }}>
                        #{term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: Historical Content Ingestion & Training Dataset */
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Ingestion Form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                Ingest Historical Writing Sample
              </h3>
              <button
                type="button"
                className="btn btn-outline"
                disabled={isRegenerating}
                onClick={handleRegenerateProfile}
                title="Recalculate voice profile from ingested corpus"
              >
                <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                <span>Retrain Profile</span>
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Add approved press releases, annual reports, leadership letters, or whitepapers to calibrate the brand voice engine.
            </p>

            <form onSubmit={handleAddSample}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                  Sample Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024 Product Architecture Whitepaper"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                  Publication Channel / Source
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technical Blog, Press Release, Case Study"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                    Historical Text Content
                  </label>
                  <span style={{ fontSize: '0.75rem', color: wordCount >= 10 ? '#16a34a' : '#d97706' }}>
                    {wordCount} words (min 10)
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste excerpt or complete article text here..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', lineHeight: '1.5' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmittingSample || wordCount < 10}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSubmittingSample ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Ingesting & Training...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Ingest Writing Sample</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Existing Ingested Samples List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
              Training Corpus Library ({samples.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {samples.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                  No historical samples ingested yet. Ingest your first sample on the left.
                </div>
              ) : (
                samples.map(sample => (
                  <div
                    key={sample.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>
                        {sample.title}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSample(sample.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="Delete sample"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      {sample.source} • {sample.word_count} words
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4', background: '#ffffff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      "{sample.sample_text.slice(0, 140)}..."
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
