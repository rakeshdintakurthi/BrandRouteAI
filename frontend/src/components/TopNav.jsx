import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Palette,
  Mic,
  Share2,
  BookOpenCheck,
  History,
  Search,
  Bell,
  Sun,
  Globe,
  Plus,
  RefreshCw,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function TopNav({
  activeView,
  onNavigate,
  draftsCount = 0,
  rulesCount = 0,
  factsCount = 0,
  openFindingsCount = 0,
  brands = [],
  selectedBrand,
  onSelectBrand,
  onSeedDemo,
  isSeeding = false,
  systemInfo,
  health,
  onOpenNewDraftModal
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHealthy = health?.status === 'healthy';
  const hasAi = systemInfo?.ai_active;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audit', label: 'Content Review', icon: FileCheck2, badge: draftsCount > 0 ? draftsCount : null },
    { id: 'visual', label: 'Visual Governance', icon: Palette, badge: 'Multimodal' },
    { id: 'voice', label: 'Brand Voice', icon: Mic, badge: 'DNA' },
    { id: 'cms', label: 'CMS Gate', icon: Share2, badge: 'Gate' },
    { id: 'guidelines', label: 'Rules & Facts', icon: BookOpenCheck, badge: (rulesCount + factsCount) > 0 ? (rulesCount + factsCount) : null },
    { id: 'history', label: 'Audit Log', icon: History },
  ];

  const handleTabClick = (viewId) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="topnav-wrapper">
      <div className="topnav-bar glass-card" style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.88)' }}>
        {/* Left: Brand Logo (OpsPulse / BrandRoute Sunburst Icon) */}
        <div className="topnav-brand">
          <button
            type="button"
            className="topnav-logo-btn"
            onClick={() => handleTabClick('dashboard')}
            aria-label="BrandRoute Home"
          >
            <div
              className="topnav-logo-icon"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF6A1A 0%, #FFB27A 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(255, 106, 26, 0.4)'
              }}
            >
              <Zap size={18} />
            </div>
            <div className="topnav-logo-text">
              <span className="brand-name" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F2A44' }}>
                BrandRoute
              </span>
            </div>
          </button>
        </div>

        {/* Center-Left: Pill Navigation Tabs */}
        <nav className="topnav-pills-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 600,
                  borderRadius: '9999px',
                  background: isActive ? '#1F2A44' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#4A5568',
                  border: isActive ? 'none' : '1px solid #E2EDFA',
                  boxShadow: isActive ? '0 4px 12px rgba(31, 42, 68, 0.25)' : '0 2px 5px rgba(60, 100, 160, 0.04)'
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span
                    className="pill-badge"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255, 106, 26, 0.12)',
                      color: isActive ? '#FFFFFF' : '#FF6A1A',
                      fontSize: '0.62rem',
                      padding: '1px 5px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons matching OpsPulse reference (Image 3) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="topnav-quick-actions">
          {/* + Submit Draft button */}
          <button
            type="button"
            onClick={onOpenNewDraftModal}
            className="btn-pill-white btn-sm"
            style={{ borderRadius: '9999px', padding: '5px 12px', fontSize: '0.78rem', gap: '6px' }}
          >
            <Plus size={14} color="#FF6A1A" />
            <span>New Draft</span>
          </button>

          {/* Connect CMS Gate */}
          <button
            type="button"
            onClick={() => handleTabClick('cms')}
            className="btn-pill-white btn-sm"
            style={{ borderRadius: '9999px', padding: '5px 12px', fontSize: '0.78rem', gap: '6px' }}
          >
            <Share2 size={13} color="#3B82F6" />
            <span>Connect CMS</span>
          </button>

          {/* Review Approval */}
          <button
            type="button"
            onClick={() => handleTabClick('audit')}
            className="btn-pill-white btn-sm"
            style={{ borderRadius: '9999px', padding: '5px 12px', fontSize: '0.78rem', gap: '6px' }}
          >
            <CheckCircle2 size={13} color="#28C76F" />
            <span>Review Approval</span>
          </button>

          {/* Yellow/Orange Pill: Launch/Reset Demo */}
          <button
            type="button"
            onClick={onSeedDemo}
            disabled={isSeeding}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#FFC107',
              color: '#1F2A44',
              fontWeight: 700,
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(255, 193, 7, 0.4)'
            }}
          >
            <Zap size={13} />
            <span>{isSeeding ? 'Seeding...' : 'Launch Demo'}</span>
          </button>
        </div>

        {/* Right Utilities (Search, Theme, Language/Brand, Avatar) */}
        <div className="topnav-actions-right">
          <button type="button" className="circle-btn" style={{ width: '32px', height: '32px' }} title="Search">
            <Search size={14} />
          </button>
          <button type="button" className="circle-btn" style={{ width: '32px', height: '32px' }} title="Toggle Theme">
            <Sun size={14} />
          </button>

          {/* Brand/Language Selector */}
          {brands && brands.length > 0 && (
            <div className="glass-chip" style={{ padding: '4px 10px', borderRadius: '9999px' }} title="Active Brand">
              <Globe size={13} color="#6B7A99" />
              <select
                value={selectedBrand?.id || ''}
                onChange={(e) => {
                  const b = brands.find(item => item.id === Number(e.target.value));
                  if (b) onSelectBrand(b);
                }}
                className="chip-select"
                style={{ fontSize: '0.76rem', fontWeight: 700 }}
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Avatar Profile */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1F2A44 0%, #3B82F6 100%)',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(31, 42, 68, 0.25)',
              cursor: 'pointer'
            }}
            title="Rakesh D. (Compliance Lead)"
          >
            RD
          </div>

          {/* Mobile Hamburger (< 1024px) */}
          <button
            type="button"
            className="mobile-hamburger-btn circle-btn"
            style={{ width: '32px', height: '32px' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer glass-card animate-fade-in">
          <div className="mobile-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
