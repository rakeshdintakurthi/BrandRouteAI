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
  Mail,
  Menu,
  X,
  Sparkles,
  Cpu,
  RefreshCw,
  ChevronDown
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
  health
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHealthy = health?.status === 'healthy';
  const hasAi = systemInfo?.ai_active;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'audit', label: 'Content Review', icon: FileCheck2, badge: draftsCount > 0 ? draftsCount : null },
    { id: 'visual', label: 'Visual Governance', icon: Palette, badge: 'Multimodal' },
    { id: 'voice', label: 'Brand Voice', icon: Mic, badge: 'DNA' },
    { id: 'cms', label: 'CMS Gate', icon: Share2, badge: 'Gate' },
    { id: 'guidelines', label: 'Rules & Facts', icon: BookOpenCheck, badge: (rulesCount + factsCount) > 0 ? (rulesCount + factsCount) : null },
    { id: 'history', label: 'Audit Log', icon: History, badge: null },
  ];

  const handleTabClick = (viewId) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="topnav-wrapper">
      <div className="topnav-bar glass-card">
        {/* Left: Brand Logo & Wordmark */}
        <div className="topnav-brand">
          <button
            type="button"
            className="topnav-logo-btn"
            onClick={() => handleTabClick('dashboard')}
            aria-label="BrandRoute Home"
          >
            <div className="topnav-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="topnav-logo-text">
              <span className="brand-name">BrandRoute</span>
              <span className="brand-badge-ai">AI</span>
            </div>
          </button>
        </div>

        {/* Center: Floating Pill Navigation Tabs (Desktop >= 1024px) */}
        <nav className="topnav-pills-center">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span className={`pill-badge ${isActive ? 'active-badge' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Brand selector chips, quick circular action icons & User Profile */}
        <div className="topnav-actions-right">
          {/* Brand Selector Chip */}
          {brands && brands.length > 0 && (
            <div className="glass-chip brand-chip" title="Active Brand Portfolio">
              <span className="chip-label">BRAND:</span>
              <select
                value={selectedBrand?.id || ''}
                onChange={(e) => {
                  const b = brands.find(item => item.id === Number(e.target.value));
                  if (b) onSelectBrand(b);
                }}
                className="chip-select"
                aria-label="Select active brand"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Live API Status Chip */}
          <div className="glass-chip status-chip" title={isHealthy ? 'FastAPI & SQLite connected' : 'Connecting...'}>
            <span className={`status-dot-pulse ${isHealthy ? 'online' : ''}`} />
            <span>{isHealthy ? 'Live API' : 'Connecting'}</span>
          </div>

          {/* AI / Deterministic Mode Chip */}
          <div className="glass-chip mode-chip" title={hasAi ? `AI Assisted (${systemInfo?.ai_model})` : 'Zero-cost deterministic rule engine'}>
            {hasAi ? (
              <>
                <Sparkles size={13} color="#FF6A1A" />
                <span>AI Live</span>
              </>
            ) : (
              <>
                <Cpu size={13} color="#3B82F6" />
                <span>Deterministic</span>
              </>
            )}
          </div>

          {/* Reset Demo Brand Button */}
          <button
            type="button"
            className="glass-chip action-chip"
            onClick={onSeedDemo}
            disabled={isSeeding}
            title="Reset demo brand data"
          >
            <RefreshCw size={13} className={isSeeding ? 'animate-spin' : ''} />
            <span>{isSeeding ? 'Seeding...' : 'Reset'}</span>
          </button>

          {/* Circular Action Buttons */}
          <div className="circular-icons-group">
            <button type="button" className="circle-btn" title="Search audits" aria-label="Search audits">
              <Search size={16} />
            </button>
            <button type="button" className="circle-btn" title="Notifications" aria-label="Notifications">
              <Bell size={16} />
              {openFindingsCount > 0 && (
                <span className="notification-dot" />
              )}
            </button>
            <button type="button" className="circle-btn" title="Messages" aria-label="Messages">
              <Mail size={16} />
            </button>
          </div>

          {/* User Profile Avatar Pill */}
          <div className="user-profile-pill" title="Signed in as Rakesh Dintakurthi">
            <div className="user-text">
              <span className="user-name">Rakesh D.</span>
              <span className="user-role">Compliance Lead</span>
            </div>
            <div className="avatar-circle">
              RD
              <span className="avatar-online" />
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button (< 1024px) */}
          <button
            type="button"
            className="mobile-hamburger-btn circle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (< 1024px) */}
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
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className="pill-badge">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
