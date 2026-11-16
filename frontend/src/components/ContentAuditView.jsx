import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  Send,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Check,
  X,
  History,
  Layers,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import BrandTrustReport from './BrandTrustReport';

export default function ContentAuditView({
  draft,
  drafts = [],
  onSelectDraft,
  onUpdateDraftText,
  onRunAudit,
  onApplyCorrection,
  onTransitionStatus,
  isAnalyzing,
  findings = [],
  reviewHistory = [],
  openReviewNotesModal
}) {
  const [currentText, setCurrentText] = useState(draft?.current_text || '');
  const [isDirty, setIsDirty] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [editingFindingId, setEditingFindingId] = useState(null);
  const [customCorrectionText, setCustomCorrectionText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [includeAi, setIncludeAi] = useState(true);
  const [studioTab, setStudioTab] = useState('inspector');

  const [prevDraftId, setPrevDraftId] = useState(draft?.id);
  const [prevDraftText, setPrevDraftText] = useState(draft?.current_text);

  if (draft && (draft.id !== prevDraftId || draft.current_text !== prevDraftText)) {
    setPrevDraftId(draft.id);
    setPrevDraftText(draft.current_text);
    setCurrentText(draft.current_text || '');
    setIsDirty(false);
    setEditingFindingId(null);
  }

  if (!draft) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--text-subtle)' }}>
        <FileCheck size={52} style={{ margin: '0 auto 16px', opacity: 0.4, color: 'var(--primary)' }} />
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700 }}>No Content Draft Selected</h3>
        <p style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Please choose a draft from the dropdown or submit a new draft to review.
        </p>
      </div>
    );
  }

  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = currentText.length;

  const openFindings = findings.filter(f => f.status === 'open');
  const criticalOpenCount = openFindings.filter(f => f.severity === 'critical').length;

  const filteredFindings = findings.filter(f => {
    if (filterSeverity === 'all') return true;
    return f.severity === filterSeverity;
  });

  const handleTextChange = (e) => {
    setCurrentText(e.target.value);
    setIsDirty(e.target.value !== draft.current_text);
  };

  const handleSaveText = async () => {
    await onUpdateDraftText(draft.id, currentText);
    setIsDirty(false);
  };

  const handleStartEditCorrection = (finding) => {
    setEditingFindingId(finding.id);
    setCustomCorrectionText(finding.suggested_correction || finding.matched_text || '');
  };

  const handleSaveCustomCorrection = async (findingId) => {
    await onApplyCorrection(findingId, 'edit', customCorrectionText);
    setEditingFindingId(null);
  };

  const statusClass = draft.review_status.toLowerCase().replace(' ', '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card: Active Draft Switcher & Review Governance Workflow */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '18px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fcfdfe 100%)',
          border: '1px solid rgba(226, 232, 240, 0.9)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {/* Active Draft Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              ACTIVE DRAFT
            </span>
            <select
              value={draft.id}
              onChange={(e) => {
                const selected = drafts.find(d => d.id === Number(e.target.value));
                if (selected) onSelectDraft(selected);
              }}
              style={{
                background: '#ffffff',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 14px',
                fontWeight: 700,
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
              }}
              aria-label="Select draft to audit"
            >
              {drafts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.review_status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ height: '36px', width: '1px', background: 'var(--border-color)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className={`status-badge ${statusClass}`}>
                {draft.review_status}
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Channel: <strong style={{ color: 'var(--text-main)' }}>{draft.channel}</strong> • Author: <strong style={{ color: 'var(--text-main)' }}>{draft.author}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Workflow State Transition Controls (Rich Buttons) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {draft.review_status === 'Draft' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onTransitionStatus(draft.id, 'In Review')}
              title="Submit draft to human editorial review"
            >
              <Send size={14} />
              <span>Submit for Review</span>
            </button>
          )}

          {draft.review_status === 'In Review' && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => openReviewNotesModal(draft.id, 'Changes Requested')}
                title="Send back with change requests"
              >
                <AlertTriangle size={14} style={{ color: '#d97706' }} />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => onTransitionStatus(draft.id, 'Approved')}
                disabled={criticalOpenCount > 0}
                title={criticalOpenCount > 0 ? "Resolve open critical findings before approval" : "Formally approve for publication"}
                style={{
                  opacity: criticalOpenCount > 0 ? 0.5 : 1,
                  cursor: criticalOpenCount > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle2 size={14} />
                <span>Approve Content</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => openReviewNotesModal(draft.id, 'Rejected')}
                title="Reject publication"
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>
            </>
          )}

          {draft.review_status === 'Changes Requested' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onTransitionStatus(draft.id, 'In Review')}
              title="Re-submit revisions for review"
            >
              <Send size={14} />
              <span>Re-submit for Review</span>
            </button>
          )}

          {(draft.review_status === 'Approved' || draft.review_status === 'Rejected') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onTransitionStatus(draft.id, 'Draft')}
              title="Re-open draft for editing"
            >
              <RotateCcw size={14} />
              <span>Re-open Draft</span>
            </button>
          )}

          <button
            type="button"
            className={`btn btn-secondary btn-sm ${showHistory ? 'btn-primary' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
            title="View review history trail"
          >
            <History size={14} />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Review History Drawer if toggled */}
      {showHistory && (
        <div className="card" style={{ background: '#f8fafc', borderColor: 'var(--primary-border)', padding: '20px' }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} />
            Review State Audit Trail
          </h4>
          {reviewHistory.length === 0 ? (
            <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)' }}>No review events recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reviewHistory.map((h) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', padding: '10px 14px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>{h.from_status}</span>
                    <span style={{ margin: '0 8px', color: 'var(--primary)', fontWeight: 700 }}>→</span>
                    <strong style={{ color: 'var(--text-main)' }}>{h.to_status}</strong>
                    <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>by <strong>{h.changed_by}</strong></span>
                    {h.notes && <span style={{ marginLeft: '12px', color: 'var(--text-subtle)', fontStyle: 'italic' }}>"{h.notes}"</span>}
                  </div>
                  <div style={{ color: 'var(--text-subtle)', fontSize: '0.76rem' }}>
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warning banner if critical findings exist while In Review */}
      {criticalOpenCount > 0 && draft.review_status === 'In Review' && (
        <div style={{
          background: 'var(--critical-bg)',
          border: '1px solid var(--critical-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          color: 'var(--critical)',
          fontSize: '0.9rem',
          boxShadow: '0 2px 8px rgba(225, 29, 72, 0.1)'
        }}>
          <ShieldAlert size={22} style={{ color: 'var(--critical)', flexShrink: 0 }} />
          <div>
            <strong>Approval Blocked:</strong> {criticalOpenCount} unresolved critical brand compliance finding(s) detected.
            You must accept, edit, or reject all critical findings before this draft can be approved.
          </div>
        </div>
      )}

      {/* Main Two-Column Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* COLUMN 1: Content Editor Column */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '24px' }}>
          <div className="column-header" style={{ marginBottom: '4px' }}>
            <div className="column-title-wrap">
              <div className="column-icon-box">
                <FileText size={17} />
              </div>
              <div>
                <h3 className="column-label">
                  Marketing Copy Editor
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Live document text and correction preview
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 500, background: '#f8fafc', padding: '4px 10px', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                {wordCount} words • {charCount} chars
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSaveText}
                disabled={!isDirty}
                style={{
                  borderColor: isDirty ? 'var(--primary)' : 'var(--border-color)',
                  color: isDirty ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isDirty ? 700 : 500
                }}
              >
                <Save size={13} />
                <span>{isDirty ? 'Save Edits*' : 'Saved'}</span>
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className="form-textarea"
            value={currentText}
            onChange={handleTextChange}
            rows={16}
            placeholder="Enter marketing draft content here..."
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.94rem',
              lineHeight: '1.7',
              padding: '18px',
              minHeight: '390px',
              backgroundColor: '#ffffff',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'inset 0 1px 3px rgba(15, 23, 42, 0.02)'
            }}
          />

          {/* Bottom Audit Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={includeAi}
                onChange={(e) => setIncludeAi(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                Enable Gemini AI Tone & Nuance Audit
              </span>
            </label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onRunAudit(draft.id, includeAi)}
              disabled={isAnalyzing}
            >
              <Sparkles size={16} className={isAnalyzing ? 'spin' : ''} />
              <span>{isAnalyzing ? 'Auditing Guidelines & Facts...' : 'Run Governance Audit'}</span>
            </button>
          </div>
        </div>

        {/* COLUMN 2: Governance Inspector & Trust Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '540px', padding: '24px' }}>
          {/* Top Switcher Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${studioTab === 'inspector' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStudioTab('inspector')}
              >
                <Layers size={14} />
                <span>Governance Inspector ({openFindings.length})</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${studioTab === 'report' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStudioTab('report')}
              >
                <ShieldCheck size={14} />
                <span>Brand Trust Report</span>
              </button>
            </div>

            {studioTab === 'inspector' && findings.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    style={{
                      background: filterSeverity === sev ? 'var(--primary-light)' : 'transparent',
                      border: '1px solid',
                      borderColor: filterSeverity === sev ? 'var(--primary-border)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      padding: '3px 9px',
                      fontSize: '0.74rem',
                      fontWeight: filterSeverity === sev ? 700 : 500,
                      color: filterSeverity === sev ? 'var(--primary)' : 'var(--text-subtle)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            )}
          </div>

          {studioTab === 'report' ? (
            <BrandTrustReport
              draftId={draft.id}
              findingsCount={findings.length}
              onRefreshTrigger={draft.updated_at}
            />
          ) : (
            <>
              {/* Findings List */}
              {findings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--text-subtle)' }}>
                  <CheckCircle2 size={44} style={{ margin: '0 auto 14px', opacity: 0.4, color: '#10b981' }} />
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>No findings detected.</p>
                  <p style={{ fontSize: '0.84rem', marginTop: '6px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Click <strong>"Run Governance Audit"</strong> below the editor to inspect this draft against approved brand voice, terminology, facts, and prohibited claims.
                  </p>
                </div>
              ) : filteredFindings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-subtle)' }}>
                  <p>No findings matching severity: <strong>{filterSeverity}</strong></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '620px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredFindings.map((finding) => {
                    const isEditing = editingFindingId === finding.id;
                    const isResolved = finding.status !== 'open';

                    return (
                      <div
                        key={finding.id}
                        style={{
                          background: isResolved ? '#f8fafc' : '#ffffff',
                          border: '1px solid',
                          borderColor: isResolved
                            ? 'var(--border-color)'
                            : finding.severity === 'critical'
                            ? 'var(--critical-border)'
                            : finding.severity === 'high'
                            ? 'var(--high-border)'
                            : 'var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '18px',
                          opacity: isResolved ? 0.75 : 1,
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                        }}
                      >
                        {/* Header: Severity, Rule Type, and Source */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className={`badge badge-${finding.severity}`}>
                              {finding.severity}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              {finding.rule_type}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              color: finding.finding_source === 'ai_assisted' ? 'var(--primary)' : 'var(--text-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600
                            }}>
                              {finding.finding_source === 'ai_assisted' ? (
                                <><Sparkles size={12} /> AI Auditor</>
                              ) : (
                                <><Layers size={12} /> Rule Engine</>
                              )}
                            </span>
                          </div>

                          {/* Finding Status Badge */}
                          {finding.status !== 'open' && (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 9px',
                              borderRadius: '9999px',
                              background: finding.status === 'accepted' ? '#dcfce7' : '#f1f5f9',
                              color: finding.status === 'accepted' ? '#16a34a' : 'var(--text-subtle)'
                            }}>
                              {finding.status.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                          {finding.title}
                        </div>

                        {/* Matched text snippet */}
                        {finding.matched_text && (
                          <div style={{
                            background: '#fff1f2',
                            borderLeft: `3px solid ${finding.severity === 'critical' ? 'var(--critical)' : '#ea580c'}`,
                            padding: '8px 12px',
                            borderRadius: '0 6px 6px 0',
                            fontSize: '0.84rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--critical)',
                            marginBottom: '10px',
                            wordBreak: 'break-word',
                            fontWeight: 500
                          }}>
                            "{finding.matched_text}"
                          </div>
                        )}

                        {/* Explanation */}
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '10px' }}>
                          {finding.explanation}
                        </p>

                        {/* Evidence citation */}
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>EVIDENCE:</span>
                          <span>{finding.evidence}</span>
                        </div>

                        {/* Suggested Correction Box & Actions */}
                        {finding.suggested_correction && (
                          <div style={{
                            background: '#eff6ff',
                            border: '1px solid var(--primary-border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '12px 14px',
                            marginBottom: '14px'
                          }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Suggested Correction:
                            </div>

                            {isEditing ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={customCorrectionText}
                                  onChange={(e) => setCustomCorrectionText(e.target.value)}
                                  style={{ fontSize: '0.88rem' }}
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setEditingFindingId(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleSaveCustomCorrection(finding.id)}
                                  >
                                    Apply Custom Text
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                {finding.suggested_correction}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons (only if open) */}
                        {finding.status === 'open' && !isEditing && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onApplyCorrection(finding.id, 'reject')}
                              title="Dismiss finding without modifying draft"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>

                            {finding.suggested_correction && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleStartEditCorrection(finding)}
                                  title="Customize correction text before applying"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit & Apply</span>
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-success btn-sm"
                                  onClick={() => onApplyCorrection(finding.id, 'accept')}
                                  title="Replace text in draft content automatically"
                                >
                                  <Check size={13} />
                                  <span>Accept Correction</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
