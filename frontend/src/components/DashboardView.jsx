import React from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  BookOpen,
  Award,
  Sparkles,
  Search,
  Filter,
  Layers,
  Check,
  Zap,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  Shield,
  HelpCircle,
  BarChart3,
  Users,
  Compass
} from 'lucide-react';

export default function DashboardView({
  brand,
  drafts = [],
  rules = [],
  facts = [],
  onSelectDraft,
  onOpenNewDraftModal,
  onNavigate
}) {
  // Compute metric stats
  const totalDrafts = drafts.length;
  const inReviewCount = drafts.filter(d => d.review_status === 'In Review').length;
  const approvedCount = drafts.filter(d => d.review_status === 'Approved').length;
  const changesCount = drafts.filter(d => d.review_status === 'Changes Requested').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* =========================================================
          HERO SECTION (Matching ServiceRoute Reference Headline)
          ========================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '10px' }}>
        {/* Top Outline Pill Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid #e4e4e7', borderRadius: '9999px', padding: '5px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', backdropFilter: 'blur(8px)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#52525b', letterSpacing: '-0.01em' }}>
            CPQ, Voice Governance & Factual Compliance for Enterprise B2B
          </span>
        </div>

        {/* Large Bold Headline */}
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.1rem, 4vw, 3.4rem)',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.035em',
          lineHeight: '1.12',
          maxWidth: '820px'
        }}>
          Run a Smarter, Governed Brand Operation
        </h1>

        {/* Subtitle Paragraph */}
        <p style={{
          fontSize: '1.05rem',
          color: '#52525b',
          lineHeight: '1.6',
          maxWidth: '680px',
          fontWeight: 400
        }}>
          All-in-one brand governance to audit tone, enforce terminology, verify SLA claims against corporate facts, and deliver exceptional, compliant communications.
        </p>

        {/* Pill Action Buttons Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', paddingTop: '6px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenNewDraftModal}
            style={{ padding: '11px 26px', fontSize: '0.92rem' }}
          >
            <Plus size={16} />
            <span>Submit Content Draft</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('audit')}
            style={{ padding: '11px 26px', fontSize: '0.92rem' }}
          >
            <span>See Product Tour</span>
          </button>

          {/* Product Hunt / Verification Badge on the Right */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e4e4e7', borderRadius: '9999px', padding: '6px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ff6154', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>P</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#09090b' }}>Featured on Product Hunt</span>
            <span style={{ fontSize: '0.7rem', color: '#71717a', background: '#f4f4f5', padding: '1px 6px', borderRadius: '4px' }}>TOP #1</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          EMBEDDED MOCKUP CONTAINER (The Centerpiece in Screenshot)
          ========================================================= */}
      <div className="mockup-surface">
        {/* Mockup Header (like "Revenue Reports" in image) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
              Governance Quality Reports
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#71717a', marginTop: '2px' }}>
              Continuous pre-publication compliance monitoring across active enterprise marketing drafts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('guidelines')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Filter size={13} />
              <span>Rules ({rules.length})</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('history')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Clock size={13} />
              <span>Audit Log</span>
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards in Horizontal Row (Matching $248,650, $196, $32,480, 87%) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '26px'
        }}>
          {/* Card 1: Total Revenue -> Total Drafts */}
          <div className="stat-kpi-card">
            <div className="stat-kpi-header">
              <span className="stat-kpi-label">Total Drafts</span>
              <div className="stat-kpi-icon-chip" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FileText size={16} />
              </div>
            </div>
            <div>
              <div className="stat-kpi-value">{totalDrafts}</div>
              <div style={{ marginTop: '4px' }}>
                <span className="stat-trend-tag stat-trend-green">
                  ↑ +100% In System
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Average Job Value -> In Editorial Review */}
          <div className="stat-kpi-card">
            <div className="stat-kpi-header">
              <span className="stat-kpi-label">In Editorial Review</span>
              <div className="stat-kpi-icon-chip" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Clock size={16} />
              </div>
            </div>
            <div>
              <div className="stat-kpi-value">{inReviewCount}</div>
              <div style={{ marginTop: '4px' }}>
                <span className="stat-trend-tag stat-trend-blue">
                  ↑ +18% Pending Signoff
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Outstanding -> Action Required */}
          <div className="stat-kpi-card">
            <div className="stat-kpi-header">
              <span className="stat-kpi-label">Action Required</span>
              <div className="stat-kpi-icon-chip" style={{ background: '#fffbeb', color: '#d97706' }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div>
              <div className="stat-kpi-value">{changesCount}</div>
              <div style={{ marginTop: '4px' }}>
                <span className="stat-trend-tag stat-trend-amber">
                  ! Attention
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Collection Rate -> Compliance Index */}
          <div className="stat-kpi-card">
            <div className="stat-kpi-header">
              <span className="stat-kpi-label">Compliance Index</span>
              <div className="stat-kpi-icon-chip" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div>
              <div className="stat-kpi-value">98.4%</div>
              <div style={{ marginTop: '4px' }}>
                <span className="stat-trend-tag stat-trend-green">
                  ✓ Certified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Trend Chart Container (Matching "Revenue Trend" from Screenshot) */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #f4f4f5',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '26px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>
                Brand Compliance & Verification Trend
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#71717a' }}>
                Continuous inspection across 12 calendar monitoring periods
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.76rem', color: '#71717a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }} />
                <span>Current Campaign</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#93c5fd' }} />
                <span>Historical SLA Target</span>
              </div>
            </div>
          </div>

          {/* Floating Tooltip Card (Matching the floating card from the screenshot) */}
          <div style={{
            position: 'absolute',
            top: '74px',
            right: '25%',
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            padding: '10px 16px',
            boxShadow: '0 16px 32px -4px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#71717a', fontWeight: 600 }}>May 2026 Audit</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>98.4% Score</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>0 Critical Blockers</div>
          </div>

          {/* Area / Bar Chart Visual Simulation */}
          <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #f4f4f5' }}>
            {[
              { month: 'Jan', val: 65, baseline: 50 },
              { month: 'Feb', val: 72, baseline: 55 },
              { month: 'Mar', val: 78, baseline: 60 },
              { month: 'Apr', val: 84, baseline: 65 },
              { month: 'May', val: 98, baseline: 75, highlight: true },
              { month: 'Jun', val: 90, baseline: 70 },
              { month: 'Jul', val: 88, baseline: 68 },
              { month: 'Aug', val: 92, baseline: 72 },
              { month: 'Sep', val: 94, baseline: 74 },
              { month: 'Oct', val: 91, baseline: 71 },
              { month: 'Nov', val: 95, baseline: 75 },
              { month: 'Dec', val: 98, baseline: 78 }
            ].map((col, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%', gap: '3px' }}>
                  {/* Current Bar */}
                  <div
                    style={{
                      width: '60%',
                      maxWidth: '32px',
                      height: `${col.val}%`,
                      background: col.highlight ? 'linear-gradient(180deg, #2563eb 0%, #3b82f6 100%)' : '#bfdbfe',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  {/* Target Bar */}
                  <div
                    style={{
                      width: '30%',
                      maxWidth: '16px',
                      height: `${col.baseline}%`,
                      background: '#e2e8f0',
                      borderRadius: '3px 3px 0 0'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: col.highlight ? '#09090b' : '#a1a1aa', fontWeight: col.highlight ? 700 : 500 }}>
                  {col.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Row of Mockup: Revenue by Service Type & Employee Performance */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {/* Box 1: Violations by Rule Category */}
          <div style={{ background: '#ffffff', border: '1px solid #f4f4f5', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09090b', marginBottom: '4px' }}>
              Governance by Rule Category
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: '14px' }}>
              Active rule distribution across brand guidelines
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                  <span style={{ fontWeight: 600 }}>Terminology & Casing</span>
                </div>
                <span style={{ color: '#71717a' }}>3 Rules Active</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                  <span style={{ fontWeight: 600 }}>Claims & SLA Commitments</span>
                </div>
                <span style={{ color: '#71717a' }}>3 Rules Active</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
                  <span style={{ fontWeight: 600 }}>Tone & Corporate Filler</span>
                </div>
                <span style={{ color: '#71717a' }}>2 Rules Active</span>
              </div>
            </div>
          </div>

          {/* Box 2: Voice Distribution with Segmented Bar (Matching "Employee Performance") */}
          <div style={{ background: '#ffffff', border: '1px solid #f4f4f5', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09090b', marginBottom: '4px' }}>
              Approved Voice Attributes
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: '14px' }}>
              Distribution of tone weights enforced across content drafts
            </p>

            {/* Segmented Progress Bar */}
            <div className="multi-segment-bar" style={{ marginBottom: '14px' }}>
              <div className="segment-blue" style={{ width: '40%' }} title="Authoritative (40%)" />
              <div className="segment-orange" style={{ width: '25%' }} title="Technically Precise (25%)" />
              <div className="segment-purple" style={{ width: '20%' }} title="Direct (20%)" />
              <div className="segment-green" style={{ width: '15%' }} title="Humble & Transparent (15%)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }} />
                <span>Authoritative: <strong>40%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f97316' }} />
                <span>Precise: <strong>25%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8b5cf6' }} />
                <span>Direct: <strong>20%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} />
                <span>Humble: <strong>15%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BENTO GRID: PIPELINE & CARDS (Matching Right Side of Image)
          ========================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1.3fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* COLUMN 1: Active Marketing Content Pipeline */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="column-header">
            <div className="column-title-wrap">
              <h3 className="column-label">
                Content Review Pipeline
              </h3>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('audit')}
            >
              <span>View All Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {drafts.map((draft) => {
              const statusClass = draft.review_status.toLowerCase().replace(' ', '-');
              return (
                <div
                  key={draft.id}
                  onClick={() => onSelectDraft(draft)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = '#d4d4d8';
                    e.currentTarget.style.transform = 'translateY(-1.5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ flex: '1 1 200px', minWidth: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#09090b', wordBreak: 'break-word' }}>
                        {draft.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#52525b', background: '#f4f4f5', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                        {draft.channel}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
                      Author: <strong style={{ color: '#52525b' }}>{draft.author}</strong> • Updated: {new Date(draft.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span className={`status-badge ${statusClass}`}>
                      {draft.review_status}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDraft(draft);
                      }}
                    >
                      <span>Audit</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Bento Cards (Dark Card + Floating Pill from Image) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dark Card (Directly mirrors the black card on the right side of screenshot) */}
          <div className="card-dark" style={{ position: 'relative' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
              One Unified Brand Platform
            </h4>
            <p style={{ fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '18px' }}>
              Continuous governance to enforce tone, terminology, and legal SLA accuracy before publication.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('guidelines')}
                style={{ background: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }}
              >
                <span>View Guidelines</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('audit')}
                style={{ background: '#ffffff', color: '#09090b', borderColor: '#ffffff' }}
              >
                <span>Open Studio</span>
              </button>
            </div>
          </div>

          {/* White Bento Card with Floating Badge */}
          <div className="card" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                Verified Corporate Facts
              </h4>
              <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#10b981', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                100% Truth Backed
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#52525b', lineHeight: '1.5', marginBottom: '16px' }}>
              Claims in marketing drafts are audited against official Delaware certificates, SOC-2 reports, and Master Service Agreements.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {facts.slice(0, 3).map((f) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f4f4f5' }}>
                  <span style={{ fontWeight: 600, color: '#09090b' }}>{f.fact_key}</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{f.verified_value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM INTEGRATIONS BAR (Directly from Bottom of Image)
          ========================================================= */}
      <div className="integrations-bar">
        <h3 className="integrations-title">
          Connected to the Tools You Already Use
        </h3>
        <p className="integrations-sub">
          Integrate instantly with marketing, CRM, editorial CMS, and collaboration tools.
        </p>

        <div className="integrations-logos">
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#0070ba' }}>PayPal</span>
          </div>
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#13b5ea' }}>xero</span>
          </div>
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#00a1e0' }}>salesforce</span>
          </div>
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#f26852' }}>gusto</span>
          </div>
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#635bff' }}>stripe</span>
          </div>
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#ff4a00' }}>zapier</span>
          </div>
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#e83e8c' }}>HubSpot</span>
          </div>
          <div className="integration-logo-item">
            <span style={{ fontWeight: 800, color: '#0a66c2' }}>LinkedIn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
