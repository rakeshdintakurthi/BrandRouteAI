import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Sparkles, Key, Lock, Mail, LogIn, LogOut, Check } from 'lucide-react';

export const DEMO_USERS = [
  {
    id: 'rakesh',
    name: 'Rakesh D.',
    title: 'Compliance Lead',
    role: 'Admin & Sign-Off Authority',
    email: 'rakesh@brandroute.ai',
    avatar: 'RD',
    badge: 'Admin',
    gradient: 'linear-gradient(135deg, #FF6A1A 0%, #FF8C42 100%)',
    permissions: 'Full governance approval, CMS webhook policy, and brand visual configuration.'
  },
  {
    id: 'sarah',
    name: 'Sarah Lin',
    title: 'Product Marketing Lead',
    role: 'Content Author & Campaign Manager',
    email: 'sarah.lin@brandroute.ai',
    avatar: 'SL',
    badge: 'Author',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    permissions: 'Submit marketing drafts, upload multimodal visual assets, and run pre-flight audits.'
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    title: 'Brand Evangelist',
    role: 'Legal Reviewer & Voice Auditor',
    email: 'marcus.vance@brandroute.ai',
    avatar: 'MV',
    badge: 'Reviewer',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    permissions: 'Inspect deterministic rule violations, fine-tune voice DNA, and verify corporate facts.'
  }
];

export default function DemoLoginModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}) {
  const [selectedUser, setSelectedUser] = useState(currentUser || DEMO_USERS[0]);
  const [customEmail, setCustomEmail] = useState(currentUser?.email || DEMO_USERS[0].email);
  const [customPassword, setCustomPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPersona = (persona) => {
    setSelectedUser(persona);
    setCustomEmail(persona.email);
    setCustomPassword('demo-token-active');
  };

  const handleQuickLogin = (persona) => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(persona);
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const match = DEMO_USERS.find(u => u.email.toLowerCase() === customEmail.toLowerCase());
      const userToLogin = match || {
        id: 'custom-' + Date.now(),
        name: customEmail.split('@')[0],
        title: 'Brand Specialist',
        role: 'Governance Contributor',
        email: customEmail,
        avatar: customEmail.substring(0, 2).toUpperCase(),
        badge: 'Contributor',
        gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
        permissions: 'Standard audit and draft review rights.'
      };
      onLogin(userToLogin);
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-login-title">
      <div className="modal-content" style={{ maxWidth: '580px', padding: '30px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF6A1A 0%, #FFB27A 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 106, 26, 0.35)'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 id="modal-login-title" className="modal-title" style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
                BrandRoute AI — Demo Authentication
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Select an enterprise demo persona or sign in with custom credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1-Click Persona Cards */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1F2A44', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              One-Click Enterprise Personas
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Instant Role Switch</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DEMO_USERS.map((persona) => {
              const isCurrent = currentUser?.id === persona.id;
              const isSelected = selectedUser?.id === persona.id;

              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isSelected ? '#F0F7FF' : '#F8FAFC',
                    border: isSelected ? '1.5px solid #3B82F6' : '1.5px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(59, 130, 246, 0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: persona.gradient,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
                        flexShrink: 0
                      }}
                    >
                      {persona.avatar}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1F2A44' }}>
                          {persona.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#E2E8F0',
                            color: isSelected ? '#2563EB' : '#475569'
                          }}
                        >
                          {persona.badge}
                        </span>
                        {isCurrent && (
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: '#16A34A',
                              background: '#DCFCE7',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                        {persona.title} • {persona.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(persona);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: isCurrent ? '#E2E8F0' : 'linear-gradient(135deg, #FF6A1A 0%, #FF8C42 100%)',
                      color: isCurrent ? '#475569' : '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: isCurrent ? 'none' : '0 2px 8px rgba(255, 106, 26, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isCurrent ? 'Current' : 'Sign In'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Credentials Form */}
        <form onSubmit={handleFormSubmit} style={{ borderTop: '1px solid #E2E8F0', paddingTop: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">
                <Mail size={13} color="#64748B" /> Demo Corporate Email
              </label>
              <input
                type="email"
                className="form-input"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">
                <Lock size={13} color="#64748B" /> Demo Password / Token
              </label>
              <input
                type="password"
                className="form-input"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '14px', paddingTop: '14px', justifyContent: 'space-between' }}>
            {currentUser ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                style={{ color: '#DC2626', borderColor: '#FECACA' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Protected by BrandRoute SLA Governance
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <LogIn size={14} />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Selected Role'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
