import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  BarChart2,
  Activity,
  Check,
  ChevronRight,
  FileCheck2,
  Layers,
  Search,
  Filter,
  TrendingUp,
  Cpu,
  ChevronDown,
  Compass,
  Zap,
  Radio
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
  const [barTimeRange, setBarTimeRange] = useState('7d'); // '7d', '30d', '90d'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [overviewRange, setOverviewRange] = useState('Today');

  // Compute stats
  const totalDrafts = drafts.length;
  const inReviewCount = drafts.filter(d => d.review_status === 'In Review').length;
  const approvedCount = drafts.filter(d => d.review_status === 'Approved').length;
  const changesCount = drafts.filter(d => d.review_status === 'Changes Requested').length;
  const openIssuesCount = drafts.reduce((acc, d) => acc + (d.review_status === 'Changes Requested' ? 2 : 0), 0);

  // Dynamic Bar Chart datasets (Nexora Style: Striped Inactive, Solid Orange Active)
  const barDataSets = {
    '7d': [
      { label: 'Mon', audits: 32, compliant: 28 },
      { label: 'Tue', audits: 48, compliant: 44 },
      { label: 'Wed', audits: 39, compliant: 35 },
      { label: 'Thu', audits: 85, compliant: 79, active: true },
      { label: 'Fri', audits: 62, compliant: 58 },
      { label: 'Sat', audits: 24, compliant: 22 },
      { label: 'Sun', audits: 18, compliant: 18 }
    ],
    '30d': [
      { label: 'W1', audits: 210, compliant: 195 },
      { label: 'W2', audits: 280, compliant: 260 },
      { label: 'W3', audits: 340, compliant: 320, active: true },
      { label: 'W4', audits: 290, compliant: 275 }
    ],
    '90d': [
      { label: 'Month 1', audits: 820, compliant: 780 },
      { label: 'Month 2', audits: 960, compliant: 910, active: true },
      { label: 'Month 3', audits: 890, compliant: 850 }
    ]
  };

  const activeBars = barDataSets[barTimeRange] || barDataSets['7d'];
  const maxBarValue = Math.max(...activeBars.map(b => b.audits));

  // Radar chart dimensions
  const radarAxes = [
    { label: 'Tone Voice', value: 92, angle: 0 },
    { label: 'SLA Claims', value: 98, angle: 60 },
    { label: 'Terminology', value: 88, angle: 120 },
    { label: 'Legal Facts', value: 96, angle: 180 },
    { label: 'Casing Exact', value: 90, angle: 240 },
    { label: 'Brevity Style', value: 84, angle: 300 }
  ];

  const getRadarPoint = (angleDeg, valuePercent) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const r = (valuePercent / 100) * 70;
    return {
      x: 100 + r * Math.cos(rad),
      y: 100 + r * Math.sin(rad)
    };
  };

  const radarPolygonPoints = radarAxes
    .map(axis => {
      const pt = getRadarPoint(axis.angle, axis.value);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const reviewProgressPct = totalDrafts > 0 ? Math.round(((approvedCount + inReviewCount) / totalDrafts) * 100) : 74;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">

      {/* =========================================================
          TOP FLOATING CALLOUT: CONGRATULATIONS RAKESH
          ========================================================= */}
      <div className="nexora-greeting-card glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2A44', letterSpacing: '-0.02em', marginBottom: '2px' }}>
              Congratulations Rakesh! 🎉
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#6B7A99', lineHeight: '1.4' }}>
              BrandRoute AI achieved <strong style={{ color: '#1F2A44' }}>98.4% brand compliance fidelity</strong> across all active channels for <strong>{brand?.name || 'AetherCloud'}</strong>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-pill-orange"
            onClick={onOpenNewDraftModal}
          >
            <Plus size={16} />
            <span>Submit New Draft</span>
          </button>
          <button
            type="button"
            className="btn-pill-white"
            onClick={() => onNavigate('audit')}
          >
            <span>Review Studio</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* =========================================================
          ROW 1: FREE-FLOATING CARD CLUSTER (NEXORA REFERENCE LAYOUT)
          ========================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.3fr 1fr',
        gap: '20px',
        alignItems: 'stretch'
      }} className="dashboard-grid">

        {/* 1. COMMAND OVERVIEW CARD */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2A44' }}>Command Overview</h3>
              <p style={{ fontSize: '0.74rem', color: '#6B7A99' }}>Governance throughput</p>
            </div>
            <select
              value={overviewRange}
              onChange={(e) => setOverviewRange(e.target.value)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCE6F5',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1F2A44',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(60,100,160,0.04)'
              }}
            >
              <option value="Today">Today</option>
              <option value="7 Days">7 Days</option>
              <option value="30 Days">30 Days</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Stat Row 1 */}
            <div className="stat-row-item">
              <div className="stat-icon-tile">
                <ShieldCheck size={20} />
              </div>
              <div className="stat-info-left">
                <div className="stat-label-title">Compliance Rate</div>
                <div className="stat-subtext-muted">Total governed releases</div>
              </div>
              <div className="stat-value-right">
                <span>98.4%</span>
                <span className="stat-trend-up">↑</span>
              </div>
            </div>

            {/* Stat Row 2 */}
            <div className="stat-row-item">
              <div className="stat-icon-tile" style={{ color: '#3B82F6', background: '#E8F1FC' }}>
                <CheckCircle2 size={20} />
              </div>
              <div className="stat-info-left">
                <div className="stat-label-title">Verified Claims</div>
                <div className="stat-subtext-muted">{facts.length} active certified facts</div>
              </div>
              <div className="stat-value-right">
                <span>100%</span>
                <span className="stat-trend-up">↑</span>
              </div>
            </div>

            {/* Stat Row 3 */}
            <div className="stat-row-item">
              <div className="stat-icon-tile" style={{ color: '#28C76F', background: '#E8F9EE' }}>
                <FileText size={20} />
              </div>
              <div className="stat-info-left">
                <div className="stat-label-title">Active Audits</div>
                <div className="stat-subtext-muted">{totalDrafts} publications analyzed</div>
              </div>
              <div className="stat-value-right">
                <span>{totalDrafts}</span>
                <span className="stat-trend-up">↑</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CENTER SCENE CALLOUT + REVIEW DETAILS CARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Floating Leader Callout: Active Reviews Progress */}
          <div className="scene-leader-callout glass-card">
            <span className="leader-dot" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={14} color="#FF6A1A" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1F2A44' }}>Active Reviews Progress</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FF6A1A' }}>{reviewProgressPct}%</span>
            </div>

            {/* Orange Progress Bar with Knob */}
            <div className="orange-progress-bar">
              <div className="orange-progress-fill" style={{ width: `${reviewProgressPct}%` }}>
                <span className="progress-knob" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#6B7A99' }}>
              <span>{approvedCount} Approved Publications</span>
              <span>{inReviewCount} In Compliance Review</span>
            </div>
          </div>

          {/* Review Details (Tracking Details Style Card) */}
          <div className="glass-card" style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ACTIVE REVIEW DISPATCH
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2A44' }}>
                  Review ID: #BP-4892
                </h4>
              </div>
              <span className="status-badge in-review" style={{ background: '#FFF3EB', color: '#FF6A1A', border: '1px solid #FFD0B3' }}>
                In review
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2EDFA' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#6B7A99', display: 'block' }}>TARGET PROFILE</span>
                <strong style={{ fontSize: '0.84rem', color: '#1F2A44' }}>{brand?.name || 'AetherCloud'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#6B7A99', display: 'block' }}>AUDIT DESTINATION</span>
                <strong style={{ fontSize: '0.84rem', color: '#1F2A44' }}>Global Press & CMS</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SYSTEM ALERTS CARD */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2A44' }}>System Alerts</h3>
              <p style={{ fontSize: '0.74rem', color: '#6B7A99' }}>Governance telemetry</p>
            </div>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28C76F', boxShadow: '0 0 6px #28C76F' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="alert-tile-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1F2A44' }}>Open Review Issues</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7A99' }}>Action required in drafts</div>
                </div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: '9999px' }}>
                {changesCount > 0 ? `${changesCount} Flagged` : '0 Critical'}
              </span>
            </div>

            <div className="alert-tile-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EBF2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1F2A44' }}>Engine Latency</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7A99' }}>Deterministic rule pass</div>
                </div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB', background: '#EBF2FE', padding: '2px 8px', borderRadius: '9999px' }}>
                24ms
              </span>
            </div>

            <div className="alert-tile-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6A1A' }}>
                  <Cpu size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1F2A44' }}>AI Vision & Fallback</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7A99' }}>Local engine certified</div>
                </div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF6A1A', background: '#FFF3EB', padding: '2px 8px', borderRadius: '9999px' }}>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ROW 2: PERFORMANCE INSIGHTS (STRIPED BARS) + SNAPSHOT + GAUGE
          ========================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: '20px',
        alignItems: 'stretch'
      }} className="dashboard-grid">

        {/* 1. PERFORMANCE INSIGHTS (Bar Chart with Striped Inactive & Solid Orange Active) */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2A44' }}>Performance Insights</h3>
              <p style={{ fontSize: '0.74rem', color: '#6B7A99' }}>Audited releases vs compliance</p>
            </div>
            {/* Time range pills */}
            <div style={{ display: 'flex', gap: '4px', background: '#EBF2FA', padding: '3px', borderRadius: '9999px' }}>
              {['7d', '30d', '90d'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBarTimeRange(t)}
                  style={{
                    border: 'none',
                    background: barTimeRange === t ? 'var(--accent-gradient)' : 'transparent',
                    color: barTimeRange === t ? '#FFFFFF' : '#6B7A99',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="bar-chart-container">
            {activeBars.map((bar, i) => {
              const heightPct = Math.max(15, Math.round((bar.audits / maxBarValue) * 100));
              const isHovered = hoveredBarIndex === i;
              const isActive = bar.active || isHovered;
              return (
                <div
                  key={i}
                  className="bar-column"
                  onMouseEnter={() => setHoveredBarIndex(i)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {isActive && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF6A1A', marginBottom: '2px' }}>
                      {bar.audits}
                    </span>
                  )}
                  <div
                    className={`bar-pill ${isActive ? 'solid-active' : 'striped-inactive'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="bar-label">{bar.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #EBF2FA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#6B7A99' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gradient)' }} />
              <span>Active Batch</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#6B7A99' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#DCE7F5' }} />
              <span>Historical Cadence</span>
            </div>
          </div>
        </div>

        {/* 2. RULES & FACTS SNAPSHOT (Inventory Snapshot Style) */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2A44' }}>Rules & Facts Snapshot</h3>
              <p style={{ fontSize: '0.74rem', color: '#6B7A99' }}>Policy constraints inventory</p>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF6A1A' }}>
              {rules.length + facts.length}
            </span>
          </div>

          <div style={{ marginTop: '12px' }}>
            <div className="stepped-bar-row">
              <span className="stepped-label">Terminology</span>
              <div className="stepped-track">
                <div className="stepped-fill" style={{ width: '85%' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1F2A44' }}>{rules.filter(r => r.category === 'Terminology').length || 3}</span>
            </div>

            <div className="stepped-bar-row">
              <span className="stepped-label">SLA Claims</span>
              <div className="stepped-track">
                <div className="stepped-fill" style={{ width: '70%' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1F2A44' }}>{rules.filter(r => r.category.includes('Claims')).length || 2}</span>
            </div>

            <div className="stepped-bar-row">
              <span className="stepped-label">Tone & Style</span>
              <div className="stepped-track">
                <div className="stepped-fill" style={{ width: '60%' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1F2A44' }}>{rules.filter(r => r.category.includes('Tone')).length || 2}</span>
            </div>

            <div className="stepped-bar-row">
              <span className="stepped-label">Legal Facts</span>
              <div className="stepped-track">
                <div className="stepped-fill" style={{ width: '92%' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1F2A44' }}>{facts.length}</span>
            </div>
          </div>
        </div>

        {/* 3. COMPLIANCE TRACKER GAUGE (Orange to Peach Gradient Arc) */}
        <div className="glass-card" style={{ padding: '22px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2A44' }}>Compliance Tracker</h3>
            <p style={{ fontSize: '0.74rem', color: '#6B7A99' }}>Governance health index</p>
          </div>

          {/* Semicircle Gauge (Nexora Orange-Peach Arc) */}
          <div style={{ position: 'relative', width: '150px', height: '95px', marginTop: '10px' }}>
            <svg width="150" height="95" viewBox="0 0 150 95">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6A1A" />
                  <stop offset="100%" stopColor="#FFB27A" />
                </linearGradient>
              </defs>
              {/* Background Arc */}
              <path
                d="M 20 85 A 55 55 0 0 1 130 85"
                fill="none"
                stroke="#E2EDFA"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Active Orange-Peach Arc */}
              <path
                d="M 20 85 A 55 55 0 0 1 130 85"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="12"
                strokeDasharray="172.7"
                strokeDashoffset="14"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1F2A44' }}>98.4%</span>
              <span style={{ display: 'block', fontSize: '0.68rem', color: '#28C76F', fontWeight: 700 }}>EXCEPTIONAL</span>
            </div>
          </div>

          <p style={{ fontSize: '0.74rem', color: '#6B7A99', marginTop: '8px' }}>
            Zero unresolved critical claims detected.
          </p>
        </div>
      </div>

      {/* =========================================================
          ROW 3: GOVERNED MARKETING DRAFTS LIST (GLASS TILES)
          ========================================================= */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1F2A44' }}>
              Governed Marketing Publications
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#6B7A99' }}>
              Editorial queue with deterministic rule validation and human sign-off
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-pill-orange"
              onClick={onOpenNewDraftModal}
            >
              <Plus size={15} />
              <span>Submit Draft</span>
            </button>
            <button
              type="button"
              className="btn-pill-white"
              onClick={() => onNavigate('audit')}
            >
              <span>Open Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {drafts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#6B7A99' }}>
              No drafts in queue. Click "Submit Draft" above to begin.
            </div>
          ) : (
            drafts.map((draft) => {
              const statusClass = draft.review_status.toLowerCase().replace(' ', '-');
              return (
                <div
                  key={draft.id}
                  onClick={() => onSelectDraft(draft)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.82)',
                    border: '1px solid rgba(220, 230, 245, 0.9)',
                    borderRadius: '16px',
                    padding: '14px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#FFB27A';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.82)';
                    e.currentTarget.style.borderColor = 'rgba(220, 230, 245, 0.9)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ flex: '1 1 260px', minWidth: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1F2A44' }}>
                        {draft.title}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        color: '#FF6A1A',
                        background: '#FFF3EB',
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        fontWeight: 700
                      }}>
                        {draft.channel}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#6B7A99' }}>
                      Author: <strong style={{ color: '#1F2A44' }}>{draft.author}</strong> • Last Updated: {new Date(draft.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span className={`status-badge ${statusClass}`}>
                      {draft.review_status}
                    </span>
                    <button
                      type="button"
                      className="btn-pill-orange btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDraft(draft);
                      }}
                    >
                      <span>Audit Draft</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
