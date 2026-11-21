import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Globe,
  Share2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Code,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';

const CMS_PLATFORMS = [
  { id: 'WordPress', name: 'WordPress REST API', version: 'v2', desc: 'Pre-publish REST interceptor for WordPress core & VIP.' },
  { id: 'Webflow', name: 'Webflow CMS', version: 'v1', desc: 'Collection item publication validator before staging & production.' },
  { id: 'Contentful', name: 'Contentful Headless', version: 'v1', desc: 'Entry state machine gate for content model publications.' },
  { id: 'HubSpot', name: 'HubSpot Marketing Hub', version: 'v3', desc: 'Blog & landing page pre-flight compliance checkpoint.' },
  { id: 'Custom', name: 'Generic Webhook Gateway', version: 'v1', desc: 'Secure REST webhook for custom headless microservices.' }
];

const PRESETS = [
  {
    label: 'Compliant Release (Will Pass)',
    title: 'AetherCloud Launches Zero-Trust High-Availability Architecture',
    channel: 'Corporate Blog',
    author: 'Elena Rostova',
    content: 'AetherCloud was founded in 2021 and delivers zero-trust orchestration for modern enterprise workloads. Our infrastructure provides a 99.95% uptime SLA backed by AES-256-GCM encryption and SOC-2 Type II audit compliance.'
  },
  {
    label: 'Violations Demo (Will Block)',
    title: 'Q4 Revolutionary Cloud Disruptor Promotion',
    channel: 'Marketing Landing Page',
    author: 'Alex Morgan',
    content: 'AetherCloud is the cheapest in the world and provides 100% guaranteed zero downtime for enterprise clusters. Unlike legacy vendors, our security architecture is completely risk-free and offers game-changer synergy across all environments.'
  }
];

export default function CMSIntegrationsView({ selectedBrand, onToast }) {
  const [selectedPlatform, setSelectedPlatform] = useState('WordPress');
  const [title, setTitle] = useState(PRESETS[0].title);
  const [channel, setChannel] = useState(PRESETS[0].channel);
  const [author, setAuthor] = useState(PRESETS[0].author);
  const [content, setContent] = useState(PRESETS[0].content);
  const [externalId, setExternalId] = useState('post_wp_8820');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (selectedBrand) {
      loadPublicationLogs(selectedBrand.id);
    }
  }, [selectedBrand]);

  const loadPublicationLogs = async (brandId) => {
    setIsLoadingLogs(true);
    try {
      const logData = await api.getCMSLogs(brandId);
      setLogs(logData || []);
    } catch (err) {
      console.error('Failed to load CMS publication logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setChannel(preset.channel);
    setAuthor(preset.author);
    setContent(preset.content);
    setPublishResult(null);
  };

  const handleValidateAndPublish = async (e) => {
    e.preventDefault();
    if (!selectedBrand) return;
    if (!content.trim()) {
      onToast('warning', 'Content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.checkCMSPublication({
        brand_id: selectedBrand.id,
        cms_platform: selectedPlatform,
        title: title || 'Untitled Post',
        channel: channel || 'CMS',
        content: content,
        author: author || 'CMS Author',
        external_id: externalId || `cms_${Date.now()}`
      });

      setPublishResult(res);
      if (res.allowed) {
        onToast('success', `Publication Approved! Content successfully validated for ${selectedPlatform}.`);
      } else {
        onToast('danger', `Publication BLOCKED! ${res.blockers.length} critical policy violation(s) detected.`);
      }

      // Refresh audit logs
      loadPublicationLogs(selectedBrand.id);
    } catch (err) {
      onToast('danger', 'CMS publish checkpoint failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="view-container animate-fade-in">
      {/* Top Hero Banner */}
      <div className="dashboard-hero-card glass-card" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.95)', borderRadius: '24px', padding: '24px 28px', boxShadow: '0 10px 40px rgba(60, 100, 160, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(255, 106, 26, 0.1)', border: '1px solid rgba(255, 106, 26, 0.25)', color: '#FF6A1A', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              <Share2 size={14} /> HEADLESS GOVERNANCE CHECKPOINT
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1F2A44', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              CMS & Headless Publishing Gate
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '650px', lineHeight: '1.5', margin: 0 }}>
              Intercepts pre-publication attempts from WordPress, Webflow, Contentful, and custom headless CMSs. Automatically blocks content containing unresolved critical claims, fact deviations, or unapproved terminology.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16A34A' }}>ACTIVE</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Webhook Gateway</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1F2A44' }}>{logs.length}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Audited Releases</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Tools Ribbon (Image 1 Style Inspiration) */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', background: '#fafafc', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
          Certified CMS & Publishing Connectors
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          {CMS_PLATFORMS.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                opacity: selectedPlatform === p.id ? 1 : 0.65,
                transform: selectedPlatform === p.id ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                background: selectedPlatform === p.id ? '#ede9fe' : 'transparent',
                border: selectedPlatform === p.id ? '1px solid #c4b5fd' : '1px solid transparent'
              }}
            >
              <Globe size={18} color={selectedPlatform === p.id ? '#7367f0' : '#64748b'} />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: selectedPlatform === p.id ? '#5b21b6' : '#475569' }}>
                {p.id}
              </span>
              <span style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#64748b' }}>
                {p.version}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Split: Simulator on Left, Response & Decision on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start', marginBottom: '2rem' }}>
        {/* Left Column: Simulated CMS Content Editor */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={18} color="#7367f0" /> Simulated {selectedPlatform} Publisher
            </h3>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {PRESETS.map((pr, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(pr)}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    color: '#475569',
                    fontWeight: '600'
                  }}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleValidateAndPublish}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Post Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Channel / Slug</label>
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>External Document ID</label>
                <input
                  type="text"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>
                Post Body Content (WYSIWYG / Markdown)
              </label>
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Draft article content to submit through brand governance webhook..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', lineHeight: '1.5' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Validating Against BrandProof Policy...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Validate & Publish via Webhook Gate</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Webhook Allow / Block Decision Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {publishResult ? (
            <div
              className="card"
              style={{
                padding: '1.5rem',
                border: publishResult.allowed ? '2px solid #22c55e' : '2px solid #ef4444',
                background: publishResult.allowed ? '#f0fdf4' : '#fef2f2'
              }}
            >
              {/* Decision Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {publishResult.allowed ? (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={28} color="#16a34a" />
                  </div>
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={28} color="#dc2626" />
                  </div>
                )}
                <div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    background: publishResult.allowed ? '#22c55e' : '#ef4444',
                    color: '#ffffff'
                  }}>
                    DECISION: {publishResult.decision}
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginTop: '0.25rem' }}>
                    {publishResult.allowed ? 'Content Approved for Publication' : 'Publication Blocked by Brand Policy'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', marginBottom: '1rem' }}>
                {publishResult.summary}
              </p>

              {/* Blockers list if blocked */}
              {publishResult.blockers?.length > 0 && (
                <div style={{ marginBottom: '1rem', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Blocking Policy Violations ({publishResult.blockers.length})
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#7f1d1d', lineHeight: '1.4' }}>
                    {publishResult.blockers.map((b, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Findings Summary Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>
                  Critical: <strong>{publishResult.critical_count}</strong>
                </span>
                <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>
                  High: <strong>{publishResult.high_count}</strong>
                </span>
                <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>
                  Medium/Low: <strong>{publishResult.medium_count + publishResult.low_count}</strong>
                </span>
                <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>
                  Log #{publishResult.audit_log_id}
                </span>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
              <ShieldCheck size={42} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Awaiting Publication Test</h3>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Click "Validate & Publish" to simulate a live webhook publication attempt and view the real-time governance decision.
              </p>
            </div>
          )}

          {/* Webhook Payload Details Card */}
          <div className="card" style={{ padding: '1rem 1.25rem', background: '#0f172a', color: '#e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                Gateway Endpoint
              </span>
              <span style={{ fontSize: '0.7rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                POST /api/integrations/cms/publish-check
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Requires <code>brand_id</code>, <code>content</code>, and <code>title</code>. Returns HTTP 200 with <code>decision: "ALLOW" | "BLOCK"</code> and structured blocker details.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Table: Publication Audit History Log */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
              Traceable Publication Audit Log
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Persistent record of all incoming CMS publishing requests and automated enforcement decisions in SQLite.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            disabled={isLoadingLogs}
            onClick={() => loadPublicationLogs(selectedBrand?.id)}
          >
            <RefreshCw size={14} className={isLoadingLogs ? 'animate-spin' : ''} />
            <span>Refresh Audit Log</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Decision</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Platform</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Post Title</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Channel</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Author</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Blockers</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No publication events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const isAllow = log.decision === 'ALLOW';
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          background: isAllow ? '#dcfce7' : '#fee2e2',
                          color: isAllow ? '#166534' : '#991b1b'
                        }}>
                          {log.decision}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: '#334155' }}>
                        {log.cms_platform}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: '#1e293b' }}>
                        {log.title}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>
                        {log.channel}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>
                        {log.author || 'Anonymous'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: isAllow ? '#16a34a' : '#ef4444', fontSize: '0.8rem' }}>
                        {log.blockers && log.blockers.length > 0 ? `${log.blockers.length} Blocker(s)` : 'None (Compliant)'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
