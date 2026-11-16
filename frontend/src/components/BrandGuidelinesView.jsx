import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle,
  FileCheck2,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';

export default function BrandGuidelinesView({
  brand,
  rules = [],
  facts = [],
  onDeleteRule,
  onDeleteFact,
  onOpenNewRuleModal,
  onOpenNewFactModal
}) {
  const [activeTab, setActiveTab] = useState('rules');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', 'Terminology', 'Claims & Compliance', 'Tone & Style', 'Legal'];

  const filteredRules = rules.filter(r => {
    if (categoryFilter === 'all') return true;
    return r.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Brand Profile Overview Card */}
      <div className="card card-hero" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {brand?.name}
              </h2>
              <span style={{ fontSize: '0.74rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 12px', borderRadius: '9999px', fontWeight: 700, border: '1px solid var(--primary-border)' }}>
                {brand?.industry || 'Enterprise Technology'}
              </span>
            </div>
            <p style={{ color: 'var(--text-main)', fontSize: '0.96rem', marginBottom: '8px', fontWeight: 600 }}>
              {brand?.tagline}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.6' }}>
              {brand?.description}
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>
              Approved Tone Attributes
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '380px' }}>
              {brand?.tone_attributes?.map((tone, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#ffffff',
                    color: 'var(--primary)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    border: '1px solid var(--primary-border)',
                    boxShadow: '0 1px 3px rgba(79, 70, 229, 0.08)'
                  }}
                >
                  {tone}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'rules' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('rules')}
          >
            <ShieldCheck size={16} />
            <span>Approved Brand Rules ({rules.length})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'facts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('facts')}
          >
            <CheckCircle size={16} />
            <span>Verified Corporate Facts ({facts.length})</span>
          </button>
        </div>

        <div>
          {activeTab === 'rules' ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={onOpenNewRuleModal}>
              <Plus size={15} />
              <span>Add Brand Rule</span>
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={onOpenNewFactModal}>
              <Plus size={15} />
              <span>Add Verified Fact</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: APPROVED BRAND RULES (Rich Multi-Column Grid) */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  background: categoryFilter === cat ? 'var(--primary-light)' : '#ffffff',
                  border: '1px solid',
                  borderColor: categoryFilter === cat ? 'var(--primary-border)' : 'var(--border-color)',
                  color: categoryFilter === cat ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: categoryFilter === cat ? 700 : 500,
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredRules.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-subtle)' }}>
              <p style={{ fontWeight: 600 }}>No brand rules found under this category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '22px',
                    borderTop: `3px solid ${rule.severity === 'critical' ? 'var(--critical)' : rule.severity === 'high' ? 'var(--high)' : 'var(--primary)'}`
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                      <span className={`badge badge-${rule.severity}`}>
                        {rule.severity}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '3px 9px', borderRadius: '4px', fontWeight: 600 }}>
                        {rule.category}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                      {rule.title}
                    </h4>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
                      {rule.description}
                    </p>

                    {/* Target and Preferred mapping */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '14px'
                    }}>
                      {rule.pattern_or_term && (
                        <div>
                          <span style={{ color: 'var(--critical)', fontWeight: 700, fontSize: '0.74rem', letterSpacing: '0.04em' }}>FLAG PATTERN: </span>
                          <code style={{ color: 'var(--critical)', background: '#fff1f2', padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem', border: '1px solid var(--critical-border)' }}>"{rule.pattern_or_term}"</code>
                        </div>
                      )}
                      {rule.preferred_term && (
                        <div>
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.74rem', letterSpacing: '0.04em' }}>PREFERRED TERM: </span>
                          <code style={{ color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem', border: '1px solid #a7f3d0' }}>"{rule.preferred_term}"</code>
                        </div>
                      )}
                    </div>

                    {rule.rationale && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontStyle: 'italic', marginBottom: '14px', lineHeight: '1.4' }}>
                        <strong>Rationale:</strong> {rule.rationale}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onDeleteRule(rule.id)}
                      title="Delete rule"
                      style={{ color: 'var(--critical)' }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERIFIED CORPORATE FACTS (Rich Multi-Column Grid) */}
      {activeTab === 'facts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
          {facts.map((fact) => (
            <div
              key={fact.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '22px',
                borderTop: '3px solid #10b981'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid var(--primary-border)' }}>
                    {fact.fact_key}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                    Verified Record
                  </span>
                </div>

                <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: '1.5', marginBottom: '14px' }}>
                  {fact.fact_statement}
                </div>

                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                    Verified Truth Value:
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857' }}>
                    {fact.verified_value}
                  </div>
                </div>

                {fact.evidence_source && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--text-main)' }}>SOURCE CITATION: </strong>
                    {fact.evidence_source}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onDeleteFact(fact.id)}
                  title="Delete verified fact"
                  style={{ color: 'var(--critical)' }}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
