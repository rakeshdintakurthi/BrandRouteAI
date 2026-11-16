import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Trophy,
  Award,
  Sparkles,
  BarChart2,
  Activity,
  Check,
  ChevronRight,
  FileCheck2,
  Calendar,
  Layers,
  Search,
  Filter
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
  // Interactive Time-range states for charts
  const [barTimeRange, setBarTimeRange] = useState('7d'); // '7d', '30d', '90d'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredRadarPoint, setHoveredRadarPoint] = useState(null);
  const [selectedRadialFilter, setSelectedRadialFilter] = useState('all');

  // Compute stats
  const totalDrafts = drafts.length;
  const inReviewCount = drafts.filter(d => d.review_status === 'In Review').length;
  const approvedCount = drafts.filter(d => d.review_status === 'Approved').length;
  const changesCount = drafts.filter(d => d.review_status === 'Changes Requested').length;

  // Dynamic Bar Chart datasets
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

  // Helper to calculate radar point coordinates on a 200x200 canvas (center 100, 100, radius 70)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* =========================================================
          ROW 1: CONGRATULATIONS HERO + 2 MINI SPARKLINE CARDS
          ========================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.8fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Card 1: Congratulations Banner */}
        <div className="card card-congrats" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ maxWidth: '380px', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700, marginBottom: '6px' }}>
              Congratulations Rakesh! 🎉
            </h2>
            <p style={{ fontSize: '0.86rem', opacity: 0.95, lineHeight: '1.5', marginBottom: '16px' }}>
              You have achieved <strong style={{ textDecoration: 'underline' }}>98.4% brand governance accuracy</strong> today. All critical claims and legal SLAs are verified.
            </p>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onNavigate('audit')}
              style={{
                background: '#ffffff',
                color: '#7367f0',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                padding: '7px 16px',
                borderRadius: '6px'
              }}
            >
              <span>View Review Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ zIndex: 1, paddingRight: '10px' }}>
            <div style={{
              width: '82px',
              height: '82px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Trophy size={42} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Mini Sparkline Card 1 (Compliance Rate) */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#b9b9c3', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
              Compliance Rate
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#5e5873', fontFamily: 'var(--font-heading)' }}>
              78.6%
            </div>
          </div>

          {/* Interactive Purple Wave Sparkline */}
          <div style={{ marginTop: '12px', height: '60px', width: '100%' }}>
            <svg viewBox="0 0 160 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7367f0" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7367f0" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 25 10 50 28 T 100 15 T 160 25"
                fill="none"
                stroke="#7367f0"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0 35 Q 25 10 50 28 T 100 15 T 160 25 L 160 50 L 0 50 Z"
                fill="url(#purpleGrad)"
              />
              <circle cx="100" cy="15" r="4" fill="#7367f0" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 3: Mini Sparkline Card 2 (Verified Claims) */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#b9b9c3', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
              Verified Claims
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#5e5873', fontFamily: 'var(--font-heading)' }}>
              12.8k
            </div>
          </div>

          {/* Interactive Orange Wave Sparkline */}
          <div style={{ marginTop: '12px', height: '60px', width: '100%' }}>
            <svg viewBox="0 0 160 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff9f43" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ff9f43" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 25 Q 30 45 60 15 T 110 35 T 160 12"
                fill="none"
                stroke="#ff9f43"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0 25 Q 30 45 60 15 T 110 35 T 160 12 L 160 50 L 0 50 Z"
                fill="url(#orangeGrad)"
              />
              <circle cx="160" cy="12" r="4" fill="#ff9f43" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* =========================================================
          ROW 2: INTERACTIVE BAR CHART & SEMICIRCULAR GAUGE TRACKER
          ========================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Left Card: 2.7k Avg Audits Bar Chart */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#5e5873', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                  2.7k
                </div>
                <div style={{ fontSize: '0.8rem', color: '#b9b9c3', marginTop: '2px' }}>
                  Avg Audits Run • <span style={{ color: '#28c76f', fontWeight: 600 }}>+5.2% vs Last 7 Days</span>
                </div>
              </div>

              {/* Interactive Time Range Toggle Pills */}
              <div style={{ display: 'flex', gap: '4px', background: '#f8f8f8', padding: '3px', borderRadius: '6px', border: '1px solid #ebe9f1' }}>
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    type="button"
                    key={range}
                    onClick={() => setBarTimeRange(range)}
                    style={{
                      background: barTimeRange === range ? '#7367f0' : 'transparent',
                      color: barTimeRange === range ? '#ffffff' : '#6e6b7b',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '3px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Vertical Columns Bar Chart */}
            <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '14px', padding: '10px 0 6px', borderBottom: '1px solid #ebe9f1' }}>
              {activeBars.map((bar, idx) => {
                const heightPercent = Math.max(15, Math.round((bar.audits / maxBarValue) * 100));
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div style={{
                        position: 'absolute',
                        bottom: `${heightPercent + 8}%`,
                        background: '#5e5873',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '3px 7px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        zIndex: 10
                      }}>
                        {bar.audits} Audits ({bar.compliant} Passed)
                      </div>
                    )}

                    <div
                      style={{
                        width: '100%',
                        maxWidth: '24px',
                        height: `${heightPercent}%`,
                        background: isHovered
                          ? '#ff9f43'
                          : bar.active
                          ? '#7367f0'
                          : '#ece9fe',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.2s ease',
                        boxShadow: bar.active ? '0 2px 8px rgba(115, 103, 240, 0.4)' : 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: isHovered || bar.active ? '#7367f0' : '#b9b9c3', marginTop: '6px', fontWeight: bar.active ? 700 : 500 }}>
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Dual Progress Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: '#5e5873', fontWeight: 600 }}>Tone Compliance</span>
                <span style={{ color: '#7367f0', fontWeight: 700 }}>85%</span>
              </div>
              <div style={{ height: '6px', background: '#ece9fe', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: '#7367f0', borderRadius: '9999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: '#5e5873', fontWeight: 600 }}>Factual Precision</span>
                <span style={{ color: '#ff9f43', fontWeight: 700 }}>95%</span>
              </div>
              <div style={{ height: '6px', background: '#ffebd8', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '95%', height: '100%', background: '#ff9f43', borderRadius: '9999px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Support Tracker / Semicircular Radial Gauge */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#5e5873' }}>
                Compliance Tracker
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#b9b9c3' }}>Total verification checks completed</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#5e5873', fontFamily: 'var(--font-heading)' }}>
              163
            </div>
          </div>

          {/* Semicircular Dotted / Radial Gauge (Directly from Screenshot) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0' }}>
            <div style={{ position: 'relative', width: '220px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7367f0" />
                    <stop offset="50%" stopColor="#ff9f43" />
                    <stop offset="100%" stopColor="#ea5455" />
                  </linearGradient>
                </defs>
                {/* Background Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#ebe9f1"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="4 6"
                />
                {/* Active Colored Arc (83%) */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="4 6"
                  strokeDashoffset="35"
                />
              </svg>

              {/* Inside Gauge Text */}
              <div style={{ position: 'absolute', bottom: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.74rem', color: '#b9b9c3', fontWeight: 600, textTransform: 'uppercase' }}>
                  Completed Verification
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#5e5873', fontFamily: 'var(--font-heading)' }}>
                  83%
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Summary Stats (New Tickets: 29, Open Tickets: 63, Response: 1d) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', borderTop: '1px solid #ebe9f1', paddingTop: '14px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#b9b9c3', fontWeight: 600 }}>New Checks</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#5e5873' }}>29</div>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#b9b9c3', fontWeight: 600 }}>Open Issues</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ea5455' }}>2</div>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#b9b9c3', fontWeight: 600 }}>Avg Latency</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#28c76f' }}>1.2s</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ROW 3: 3-COLUMN BENTO: MULTI-RING DONUT, RADAR, & TIMELINE
          ========================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.15fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Card 1: Concentric Multi-Ring Donut Chart (Campaign Orders) */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 700, color: '#5e5873' }}>
              Campaign Quality Breakdown
            </h4>
            <span style={{ fontSize: '0.74rem', color: '#b9b9c3' }}>Active</span>
          </div>

          {/* Interactive Multi-Ring Concentric SVG Circles */}
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
            <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {/* Outer Ring: Approved (Purple, 85%) */}
              <circle cx="80" cy="80" r="68" fill="none" stroke="#ece9fe" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="68" fill="none" stroke="#7367f0" strokeWidth="8"
                strokeDasharray="427" strokeDashoffset="64" strokeLinecap="round"
              />

              {/* Middle Ring: In Review (Orange, 65%) */}
              <circle cx="80" cy="80" r="54" fill="none" stroke="#ffebd8" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="54" fill="none" stroke="#ff9f43" strokeWidth="8"
                strokeDasharray="339" strokeDashoffset="118" strokeLinecap="round"
              />

              {/* Inner Ring: Action Needed (Cyan, 35%) */}
              <circle cx="80" cy="80" r="40" fill="none" stroke="#d6f7fb" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="40" fill="none" stroke="#00cfe8" strokeWidth="8"
                strokeDasharray="251" strokeDashoffset="163" strokeLinecap="round"
              />
            </svg>

            {/* Center Label inside Donut */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5e5873', fontFamily: 'var(--font-heading)' }}>
                94%
              </div>
              <div style={{ fontSize: '0.65rem', color: '#b9b9c3', fontWeight: 700, textTransform: 'uppercase' }}>
                Health
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7367f0' }} />
                <span>Certified Approved</span>
              </div>
              <span style={{ fontWeight: 700, color: '#5e5873' }}>{approvedCount}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff9f43' }} />
                <span>In Review</span>
              </div>
              <span style={{ fontWeight: 700, color: '#5e5873' }}>{inReviewCount}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00cfe8' }} />
                <span>Revisions Needed</span>
              </div>
              <span style={{ fontWeight: 700, color: '#5e5873' }}>{changesCount}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Radar Polygon Chart (Sales Stats style) */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 700, color: '#5e5873' }}>
              Governance Dimensions
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00cfe8' }}>● Current</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7367f0' }}>● Target</span>
            </div>
          </div>

          {/* Interactive Radar Chart SVG */}
          <div style={{ width: '190px', height: '170px', margin: '0 auto', position: 'relative' }}>
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Concentric Guide Hexagons */}
              {[25, 50, 75, 100].map((step, idx) => {
                const pts = radarAxes.map(a => {
                  const p = getRadarPoint(a.angle, step);
                  return `${p.x},${p.y}`;
                }).join(' ');
                return (
                  <polygon
                    key={idx}
                    points={pts}
                    fill="none"
                    stroke="#ebe9f1"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                );
              })}

              {/* Axis Rays */}
              {radarAxes.map((axis, idx) => {
                const end = getRadarPoint(axis.angle, 100);
                return (
                  <line
                    key={idx}
                    x1="100" y1="100" x2={end.x} y2={end.y}
                    stroke="#ebe9f1" strokeWidth="1"
                  />
                );
              })}

              {/* Filled Polygon (Cyan with opacity) */}
              <polygon
                points={radarPolygonPoints}
                fill="rgba(0, 207, 232, 0.35)"
                stroke="#00cfe8"
                strokeWidth="2.5"
              />

              {/* Interactive Vertex Data Points */}
              {radarAxes.map((axis, idx) => {
                const pt = getRadarPoint(axis.angle, axis.value);
                const isHovered = hoveredRadarPoint === idx;

                return (
                  <g key={idx}>
                    <circle
                      cx={pt.x} cy={pt.y} r={isHovered ? 6 : 4}
                      fill="#7367f0" stroke="#ffffff" strokeWidth="2"
                      style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                      onMouseEnter={() => setHoveredRadarPoint(idx)}
                      onMouseLeave={() => setHoveredRadarPoint(null)}
                    />
                    {isHovered && (
                      <text
                        x={pt.x} y={pt.y - 10}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#5e5873"
                      >
                        {axis.label}: {axis.value}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#b9b9c3', marginTop: '6px' }}>
            Hover data points to inspect sub-scores
          </div>
        </div>

        {/* Card 3: Activity Timeline (Right Column) */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 700, color: '#5e5873' }}>
              Governance Timeline
            </h4>
            <span style={{ fontSize: '0.74rem', color: '#b9b9c3' }}>Live Feed</span>
          </div>

          {/* Vertical Timeline with Colored Node Dots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#ebe9f1' }} />

            {/* Event 1 (Purple: Legal Sign-off) */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#7367f0', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #7367f0', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5e5873' }}>SLA 99.95% Audit Passed</div>
                <div style={{ fontSize: '0.75rem', color: '#b9b9c3' }}>Master Service Agreement citation verified</div>
                <div style={{ fontSize: '0.7rem', color: '#7367f0', fontWeight: 600, marginTop: '2px' }}>12 mins ago</div>
              </div>
            </div>

            {/* Event 2 (Orange: AI Nuances Evaluated) */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ff9f43', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #ff9f43', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5e5873' }}>Tone Analysis Verified</div>
                <div style={{ fontSize: '0.75rem', color: '#b9b9c3' }}>Gemini evaluated author's whitepaper draft</div>
                <div style={{ fontSize: '0.7rem', color: '#ff9f43', fontWeight: 600, marginTop: '2px' }}>45 mins ago</div>
              </div>
            </div>

            {/* Event 3 (Red: Blocked Prohibited Claim) */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ea5455', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #ea5455', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5e5873' }}>Critical Finding Resolved</div>
                <div style={{ fontSize: '0.75rem', color: '#b9b9c3' }}>Replaced "100% zero downtime" with SLA terms</div>
                <div style={{ fontSize: '0.7rem', color: '#ea5455', fontWeight: 600, marginTop: '2px' }}>2 hours ago</div>
              </div>
            </div>

            {/* Event 4 (Green: Approved for Release) */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#28c76f', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #28c76f', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5e5873' }}>Q4 Campaign Approved</div>
                <div style={{ fontSize: '0.75rem', color: '#b9b9c3' }}>Sign-off signed by Compliance Officer</div>
                <div style={{ fontSize: '0.7rem', color: '#28c76f', fontWeight: 600, marginTop: '2px' }}>Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ROW 4: MARKETING CONTENT PIPELINE LIST
          ========================================================= */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#5e5873' }}>
              Marketing Content In Pipeline
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#b9b9c3' }}>
              Review active campaign documents against approved tone, legal claims, and facts
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenNewDraftModal}
            >
              <Plus size={14} />
              <span>Submit Content Draft</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('audit')}
            >
              <span>Open Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {drafts.map((draft) => {
            const statusClass = draft.review_status.toLowerCase().replace(' ', '-');
            return (
              <div
                key={draft.id}
                onClick={() => onSelectDraft(draft)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #ebe9f1',
                  borderRadius: '6px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafc';
                  e.currentTarget.style.borderColor = '#7367f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#ebe9f1';
                }}
              >
                <div style={{ flex: '1 1 240px', minWidth: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#5e5873' }}>
                      {draft.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#7367f0', background: '#ece9fe', padding: '1px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {draft.channel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#b9b9c3' }}>
                    Author: <strong style={{ color: '#6e6b7b' }}>{draft.author}</strong> • Updated: {new Date(draft.updated_at).toLocaleDateString()}
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
                    <span>Audit Draft</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
