import React from 'react';
import {
  Menu,
  Sparkles,
  RefreshCw,
  Cpu,
  Server,
  Search,
  Calendar,
  Mail,
  Star,
  Bell,
  Moon,
  ChevronDown
} from 'lucide-react';

export default function Header({
  systemInfo,
  health,
  brands = [],
  selectedBrand,
  onSelectBrand,
  onSeedDemo,
  isSeeding,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) {
  const isHealthy = health?.status === 'healthy';
  const hasAi = systemInfo?.ai_active;

  return (
    <header className="top-header" role="banner">
      <div className="header-left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="menu-toggle-btn"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={18} />
        </button>

        {/* Quick Icon Bar from Screenshot */}
        <div className="header-quick-icons">
          <button type="button" className="header-icon-btn" title="Search governance audits">
            <Search size={16} />
          </button>
          <button type="button" className="header-icon-btn" title="Editorial Calendar">
            <Calendar size={16} />
          </button>
          <button type="button" className="header-icon-btn" title="Reviewer Messages">
            <Mail size={16} />
          </button>
          <button type="button" className="header-icon-btn" title="Bookmarked Rules">
            <Star size={16} />
          </button>
        </div>

        {/* Active Brand Context Dropdown */}
        {brands && brands.length > 0 && (
          <div className="header-brand-select-box" title="Active Brand Context">
            <span style={{ fontSize: '0.7rem', color: '#b9b9c3', fontWeight: 700 }}>BRAND:</span>
            <select
              className="header-brand-select"
              value={selectedBrand?.id || ''}
              onChange={(e) => {
                const b = brands.find(brand => brand.id === Number(e.target.value));
                if (b) onSelectBrand(b);
              }}
              aria-label="Select active brand profile"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#ffffff', color: '#5e5873' }}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="header-right">
        {/* Backend Connectivity Status */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: isHealthy ? '#28c76f' : '#ea5455', fontWeight: 600 }}
          title={isHealthy ? "FastAPI SQLite connected and operational" : "Connecting to backend..."}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHealthy ? '#28c76f' : '#ea5455' }} />
          <span>{isHealthy ? 'Live API' : 'Connecting'}</span>
        </div>

        {/* AI Model Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.76rem',
            padding: '3px 10px',
            borderRadius: '4px',
            background: hasAi ? '#ece9fe' : '#f8f8f8',
            color: hasAi ? '#7367f0' : '#82868b',
            fontWeight: 600,
            border: '1px solid',
            borderColor: hasAi ? '#d4cffe' : '#ebe9f1'
          }}
        >
          {hasAi ? (
            <>
              <Sparkles size={12} style={{ color: '#7367f0' }} />
              <span>AI: {systemInfo?.ai_model || 'Gemini'}</span>
            </>
          ) : (
            <>
              <Cpu size={12} style={{ color: '#82868b' }} />
              <span>Deterministic Mode</span>
            </>
          )}
        </div>

        {/* Seed Demo Data Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onSeedDemo}
          disabled={isSeeding}
          title="Reset demo brand data"
          aria-label="Reset demo brand data"
        >
          <RefreshCw size={12} className={isSeeding ? 'spin' : ''} />
          <span>{isSeeding ? 'Seeding...' : 'Reset Brand'}</span>
        </button>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="header-icon-btn"
          style={{ position: 'relative' }}
          title="Notifications"
        >
          <Bell size={17} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#ea5455',
            boxShadow: '0 0 4px #ea5455'
          }} />
        </button>

        {/* User Profile Avatar Pill matching screenshot */}
        <div className="header-user-profile" title="Signed in as Rakesh Dintakurthi">
          <div className="user-info-text" style={{ textAlign: 'right' }}>
            <span className="user-name-label">Rakesh D.</span>
            <span className="user-role-label">Compliance Lead</span>
          </div>
          <div className="user-avatar-circle">
            RD
            <span className="user-online-dot" />
          </div>
        </div>
      </div>
    </header>
  );
}
