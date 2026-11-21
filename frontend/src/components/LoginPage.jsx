import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Zap, CheckCircle2, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { DEMO_USERS } from './DemoLoginModal';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('rakesh@brandroute.ai');
  const [password, setPassword] = useState('demo-compliance-2026');
  const [selectedPersonaId, setSelectedPersonaId] = useState('rakesh');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPersona = (persona) => {
    setSelectedPersonaId(persona.id);
    setEmail(persona.email);
    setPassword('demo-auth-active');
  };

  const handleQuickLogin = (persona) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(persona);
      setIsLoading(false);
    }, 250);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const match = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      const user = match || {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        title: 'Brand Specialist',
        role: 'Governance Contributor',
        email: email,
        avatar: email.substring(0, 2).toUpperCase(),
        badge: 'Contributor',
        gradient: 'linear-gradient(135deg, #FF6A1A 0%, #FF8C42 100%)',
        permissions: 'Standard review and drafting privileges.'
      };
      onLogin(user);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '36px 32px',
          borderRadius: '28px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 25px 70px rgba(30, 60, 110, 0.16)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FF6A1A 0%, #FFB27A 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(255, 106, 26, 0.4)',
              marginBottom: '14px'
            }}
          >
            <Zap size={28} />
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2A44', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            BrandRoute AI
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            Enterprise AI Brand Governance & Fact Verification Suite
          </p>
        </div>

        {/* 1-Click Demo Personas Section */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1F2A44', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Enterprise Demo Persona
            </span>
            <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>
              Instant 1-Click Access
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_USERS.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;

              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: isSelected ? '#F0F7FF' : '#F8FAFC',
                    border: isSelected ? '1.5px solid #3B82F6' : '1.5px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: persona.gradient,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        flexShrink: 0,
                        boxShadow: '0 3px 8px rgba(0,0,0,0.12)'
                      }}
                    >
                      {persona.avatar}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F2A44' }}>
                          {persona.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            background: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#E2E8F0',
                            color: isSelected ? '#2563EB' : '#475569'
                          }}
                        >
                          {persona.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {persona.title}
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
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #FF6A1A 0%, #FF8C42 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(255, 106, 26, 0.3)'
                    }}
                  >
                    Enter
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleFormSubmit} style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              <Mail size={12} color="#64748B" /> Corporate Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rakesh@brandroute.ai"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              <Lock size={12} color="#64748B" /> Governance Access Token
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 700 }}
          >
            {isLoading ? (
              <span>Authenticating Control Room...</span>
            ) : (
              <>
                <span>Sign In to Governance Suite</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security Trust Badges */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.72rem',
            color: '#64748B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={14} color="#16A34A" />
            <span>Deterministic Safeguards</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={14} color="#2563EB" />
            <span>Gemini Multimodal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
