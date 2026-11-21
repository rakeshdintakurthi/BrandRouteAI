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
  Zap,
  Check,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Circle,
  AlertCircle
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
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Configure brand visual palette & logo bounds', done: true },
    { id: 2, label: 'Deploy deterministic regex & claims rules', done: true },
    { id: 3, label: 'Calibrate automated brand voice stylistic DNA', done: true },
    { id: 4, label: 'Set up pre-publish CMS approval workflows', done: false },
  ]);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const completedCount = checklist.filter(i => i.done).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  // Compute stats from live data
  const totalDrafts = drafts.length;
  const approvedCount = drafts.filter(d => d.review_status === 'Approved').length;
  const inReviewCount = drafts.filter(d => d.review_status === 'In Review').length;
  const changesCount = drafts.filter(d => d.review_status === 'Changes Requested').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">

      {/* =========================================================
          HERO GREETING (OpsPulse Reference: Image 3)
          ========================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2A44', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Welcome Back, Rakesh
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#6B7A99' }}>
            Your AI brand governance control room — monitoring tone, claims, costs, and compliance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #DCE6F5',
            color: '#1F2A44'
          }}>
            Brand: <strong>{brand?.name || 'AetherCloud'}</strong>
          </span>
        </div>
      </div>

      {/* =========================================================
          ROW 1: GETTING STARTED + COMPLIANCE PULSE GAUGE (Image 3)
          ========================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }} className="dashboard-grid">

        {/* 1. GETTING STARTED CHECKLIST CARD */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1F2A44' }}>Getting Started</h3>
            <button type="button" style={{ background: 'none', border: 'none', color: '#9AA7BD', cursor: 'pointer' }}>
              <MoreHorizontal size={18} />
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#6B7A99', marginBottom: '14px' }}>
            The list below highlights the key governance milestones verified for enterprise publishing
          </p>

          {/* Progress Bar with Green Gradient & Percentage */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{ flex: 1, height: '8px', borderRadius: '9999px', background: '#E2EDFA', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #28C76F 0%, #10B981 100%)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#28C76F' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Checklist items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item.done ? (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#D5F6E3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#28C76F' }}>
                    <Check size={13} strokeWidth={3} />
                  </div>
                ) : (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #CBD5E1' }} />
                )}
                <span style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: item.done ? '#1F2A44' : '#6B7A99',
                  textDecoration: item.done ? 'none' : 'none'
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. COMPLIANCE PULSE (Segmented Arch Gauge - Image 3) */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1F2A44' }}>Compliance pulse</h3>
            <button type="button" style={{ background: 'none', border: 'none', color: '#9AA7BD', cursor: 'pointer' }}>
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Three-Segmented Gauge SVG */}
          <div style={{ position: 'relative', width: '200px', height: '110px', margin: '10px auto 4px auto' }}>
            <svg width="200" height="110" viewBox="0 0 200 110">
              {/* Segment 1: Orange (Left arc) */}
              <path
                d="M 25 100 A 75 75 0 0 1 65 37"
                fill="none"
                stroke="#FF6A1A"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Segment 2: Green (Top center arc) */}
              <path
                d="M 75 30 A 75 75 0 0 1 125 30"
                fill="none"
                stroke="#28C76F"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Segment 3: Blue (Right arc) */}
              <path
                d="M 135 37 A 75 75 0 0 1 175 100"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', bottom: '2px', left: '0', right: '0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#6B7A99', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                Policy Coverage
              </span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1F2A44', lineHeight: '1.1' }}>
                98%
              </span>
            </div>
          </div>

          {/* Subrows with Active / Draft status pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px solid #EBF2FA', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#4A5568', fontWeight: 600 }}>Data Privacy & SLA (DAT-001)</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#D5F6E3', color: '#16A34A' }}>
                Active
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#4A5568', fontWeight: 600 }}>Approval Gates & Facts (APR-002)</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#D5F6E3', color: '#16A34A' }}>
                Active
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#4A5568', fontWeight: 600 }}>Prohibited Claims Filter (SEC-003)</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#FFF3EB', color: '#EA580C' }}>
                Enforced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ROW 2: 4 METRIC SPARKLINE CARDS (Image 3)
          ========================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Token Throughput */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6B7A99' }}>Token / Words</span>
            <MoreHorizontal size={16} color="#9AA7BD" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2A44', lineHeight: '1.2' }}>
            2.4M
          </div>
          <div style={{ fontSize: '0.72rem', color: '#28C76F', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑ 18%</span>
            <span style={{ color: '#9AA7BD', fontWeight: 500 }}>Compare from last 24hrs</span>
          </div>

          {/* Bar sparkline */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px', marginTop: '12px' }}>
            {[35, 50, 20, 65, 80, 45, 90, 70, 85, 60, 95, 40, 75, 85, 100].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i % 4 === 0 ? '#FF6A1A' : '#28C76F',
                  borderRadius: '2px',
                  opacity: 0.85
                }}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Cost Savings */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6B7A99' }}>Governance Cost</span>
            <MoreHorizontal size={16} color="#9AA7BD" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2A44', lineHeight: '1.2' }}>
            $127
          </div>
          <div style={{ fontSize: '0.72rem', color: '#28C76F', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↓ 15%</span>
            <span style={{ color: '#9AA7BD', fontWeight: 500 }}>Compare from last 24hrs</span>
          </div>

          {/* Curve Area Sparkline */}
          <div style={{ height: '36px', marginTop: '12px' }}>
            <svg width="100%" height="36" viewBox="0 0 100 36" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#28C76F" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#28C76F" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 32 Q 25 30, 45 22 T 85 8 L 100 24 L 100 36 L 0 36 Z"
                fill="url(#curveGrad)"
              />
              <path
                d="M 0 32 Q 25 30, 45 22 T 85 8 L 100 24"
                fill="none"
                stroke="#28C76F"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6B7A99' }}>Success Rate</span>
            <MoreHorizontal size={16} color="#9AA7BD" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2A44', lineHeight: '1.2' }}>
            98.4%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#28C76F', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑ 2.4%</span>
            <span style={{ color: '#9AA7BD', fontWeight: 500 }}>Compare from last month</span>
          </div>

          {/* Bar sparkline */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px', marginTop: '12px' }}>
            {[45, 60, 40, 75, 85, 60, 95, 80, 90, 85, 100, 70, 85, 90, 98].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: '#28C76F',
                  borderRadius: '2px',
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        </div>

        {/* Card 4: P95 Latency */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6B7A99' }}>P95 Latency</span>
            <MoreHorizontal size={16} color="#9AA7BD" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2A44', lineHeight: '1.2' }}>
            24ms
          </div>
          <div style={{ fontSize: '0.72rem', color: '#FF6A1A', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↓ 12%</span>
            <span style={{ color: '#9AA7BD', fontWeight: 500 }}>Compare from last month</span>
          </div>

          {/* Multi-color sparkline */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px', marginTop: '12px' }}>
            {[30, 40, 60, 50, 70, 85, 60, 40, 75, 90, 65, 80, 55, 45, 30].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i % 3 === 0 ? '#FF6A1A' : '#FFC107',
                  borderRadius: '2px',
                  opacity: 0.85
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          ROW 3: 30-DAY QUALITY FORECAST + LIVE RUNS STREAM TABLE (Image 3)
          ========================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }} className="dashboard-grid">

        {/* 1. 30-DAY FORECAST & PIPELINE SEGMENTS */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7A99', display: 'block' }}>
              30-day Quality & Review Forecast
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1F2A44', margin: '4px 0 2px 0' }}>
              99.2%
            </div>
            <p style={{ fontSize: '0.74rem', color: '#28C76F', fontWeight: 600 }}>
              ↑ Projected compliance fidelity for next 30 days
            </p>
          </div>

          {/* Segmented Progress Bar matching Image 3 (Blue 60%, Orange 30%, Green 45%) */}
          <div style={{ margin: '20px 0 14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: '#3B82F6' }}>60% Compliant</span>
              <span style={{ color: '#FF6A1A' }}>30% In Review</span>
              <span style={{ color: '#28C76F' }}>45% Approved</span>
            </div>

            <div style={{ display: 'flex', gap: '4px', height: '14px', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '45%', background: '#3B82F6', borderRadius: '9999px 0 0 9999px' }} />
              <div style={{ width: '25%', background: '#FF6A1A' }} />
              <div style={{ width: '30%', background: '#28C76F', borderRadius: '0 9999px 9999px 0' }} />
            </div>

            {/* Legend dots */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.72rem', color: '#6B7A99' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3B82F6' }} /> Unused
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF6A1A' }} /> Used
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#28C76F' }} /> Reserved
              </span>
            </div>
          </div>

          {/* Bottom Alert / Confidence Box */}
          <div style={{
            background: 'rgba(255, 193, 7, 0.12)',
            border: '1px solid rgba(255, 193, 7, 0.35)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 600 }}>
              <AlertCircle size={15} color="#D97706" />
              <span>Confidence:</span>
            </div>
            <strong style={{ color: '#92400E' }}>98% vs last month</strong>
          </div>
        </div>

        {/* 2. LIVE RUNS STREAM TABLE (Image 3) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28C76F', boxShadow: '0 0 6px #28C76F' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2A44' }}>Live Runs Stream</h3>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#E2EDFA', color: '#3B82F6' }}>
              Last 50
            </span>
          </div>

          {/* Live Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EBF2FA', color: '#9AA7BD', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 6px' }}>Name</th>
                  <th style={{ padding: '8px 6px' }}>Time</th>
                  <th style={{ padding: '8px 6px' }}>Latency</th>
                  <th style={{ padding: '8px 6px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {drafts.slice(0, 5).map((draft, idx) => {
                  const isBlocked = draft.review_status === 'Changes Requested';
                  const isApproved = draft.review_status === 'Approved';
                  return (
                    <tr
                      key={draft.id}
                      onClick={() => onSelectDraft(draft)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 6px', fontWeight: 700, color: '#1F2A44' }}>
                        {draft.title.length > 28 ? draft.title.slice(0, 28) + '...' : draft.title}
                      </td>
                      <td style={{ padding: '10px 6px', color: '#6B7A99', fontSize: '0.75rem' }}>
                        {idx === 0 ? '2 min ago' : idx === 1 ? '5 min ago' : `${(idx + 1) * 3} min ago`}
                      </td>
                      <td style={{ padding: '10px 6px', color: '#6B7A99', fontSize: '0.75rem' }}>
                        {idx === 0 ? '2.5s' : idx === 1 ? '1.2s' : '3.8s'}
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: isBlocked ? '#FEE2E2' : isApproved ? '#DCFCE7' : '#D5F6E3',
                          color: isBlocked ? '#DC2626' : isApproved ? '#16A34A' : '#10B981'
                        }}>
                          {isBlocked ? 'Closed' : 'Live'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
