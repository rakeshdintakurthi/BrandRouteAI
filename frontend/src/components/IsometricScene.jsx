import React from 'react';

/**
 * IsometricScene — Full-bleed soft isometric illustration sitting BEHIND the UI.
 * Features an isometric campus tailored to brand and content governance:
 * - Isometric headquarters / governance towers
 * - Server infrastructure racks
 * - Stacks of verified documents & brand books
 * - Conveyor paths transporting governed content cards
 * - Soft pale blue-grey tones (#E8F0FA, #DCE7F5, #C5D8F2, #F5F8FC) with subtle ambient glow
 */
export default function IsometricScene() {
  return (
    <div
      className="isometric-scene-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #F0F5FC 0%, #E6EEF9 50%, #F5F8FC 100%)'
      }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.92 }}
      >
        <defs>
          {/* Subtle Isometric Grid Pattern */}
          <pattern id="isoGrid" width="60" height="34.64" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 34.64 M 0 0 L 60 34.64"
              fill="none"
              stroke="#D4E2F4"
              strokeWidth="0.75"
              strokeDasharray="2,4"
              opacity="0.45"
            />
          </pattern>

          {/* Gradients for Isometric Facets */}
          <linearGradient id="planeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EBF2FA" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="planeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9E6F6" />
            <stop offset="100%" stopColor="#C8DAF0" />
          </linearGradient>

          <linearGradient id="planeRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CCDDF2" />
            <stop offset="100%" stopColor="#B8CFEC" />
          </linearGradient>

          <linearGradient id="accentOrangeSoft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6A1A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFB27A" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="glassRoof" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D5E5F9" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="conveyorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BFD7F5" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FFB27A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF6A1A" stopOpacity="0.6" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Background Grid Overlay */}
        <rect width="100%" height="100%" fill="url(#isoGrid)" />

        {/* Ambient Pale Lighting Orbs */}
        <circle cx="960" cy="520" r="480" fill="#E2EDFC" opacity="0.6" filter="url(#softGlow)" />
        <circle cx="1500" cy="300" r="320" fill="#FFF3EB" opacity="0.45" filter="url(#softGlow)" />
        <circle cx="350" cy="750" r="380" fill="#DCEBFA" opacity="0.5" filter="url(#softGlow)" />

        {/* ================= ISOMETRIC CAMPUS SCENE ================= */}
        <g id="campusObjects" transform="translate(40, 20)">

          {/* Base Platform / Foundation Slab */}
          <g transform="translate(680, 480)">
            {/* Top face */}
            <path d="M 300 -120 L 780 160 L 480 340 L 0 60 Z" fill="url(#planeTop)" stroke="#D4E2F4" strokeWidth="1.5" />
            {/* Left face */}
            <path d="M 0 60 L 480 340 L 480 365 L 0 85 Z" fill="url(#planeLeft)" />
            {/* Right face */}
            <path d="M 480 340 L 780 160 L 780 185 L 480 365 Z" fill="url(#planeRight)" />
          </g>

          {/* Central Brand Governance Headquarters Building */}
          <g transform="translate(860, 360)">
            {/* Shadow */}
            <path d="M 0 160 L 160 250 L 320 160 L 160 70 Z" fill="#D3E1F2" opacity="0.4" />
            {/* Building Left Face */}
            <path d="M 40 100 L 140 160 L 140 40 L 40 -20 Z" fill="url(#planeLeft)" stroke="#C8DAF0" strokeWidth="1" />
            {/* Building Right Face */}
            <path d="M 140 160 L 260 90 L 260 -30 L 140 40 Z" fill="url(#planeRight)" stroke="#B8CFEC" strokeWidth="1" />
            {/* Building Glass Roof */}
            <path d="M 40 -20 L 140 40 L 260 -30 L 160 -90 Z" fill="url(#glassRoof)" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Glowing Orange Brand Seal on Roof */}
            <ellipse cx="150" cy="-25" rx="28" ry="16" fill="url(#accentOrangeSoft)" opacity="0.85" filter="url(#softGlow)" />
            <ellipse cx="150" cy="-25" rx="14" ry="8" fill="#FFFFFF" opacity="0.95" />

            {/* Architectural Louvers / Glass bands */}
            <path d="M 40 15 L 140 75 L 260 5" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" fill="none" />
            <path d="M 40 50 L 140 110 L 260 40" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" fill="none" />
          </g>

          {/* Secondary Tower: Verified Knowledge & Fact Store */}
          <g transform="translate(1120, 290)">
            <path d="M 20 80 L 100 130 L 100 0 L 20 -50 Z" fill="url(#planeLeft)" stroke="#C8DAF0" strokeWidth="1" />
            <path d="M 100 130 L 190 75 L 190 -55 L 100 0 Z" fill="url(#planeRight)" stroke="#B8CFEC" strokeWidth="1" />
            <path d="M 20 -50 L 100 0 L 190 -55 L 110 -105 Z" fill="url(#planeTop)" stroke="#FFFFFF" strokeWidth="1" />
            {/* Antenna / Data Transmitter */}
            <line x1="110" y1="-105" x2="110" y2="-155" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" />
            <circle cx="110" cy="-155" r="4" fill="#FF6A1A" filter="url(#softGlow)" />
            <circle cx="110" cy="-155" r="9" fill="none" stroke="#FFB27A" strokeWidth="1.2" opacity="0.6" />
          </g>

          {/* Content Ingestion Conveyor Ramp & Floating Cards */}
          <g transform="translate(620, 480)">
            {/* Conveyor Belt */}
            <path
              d="M 120 180 L 320 60 L 350 78 L 150 198 Z"
              fill="url(#conveyorGrad)"
              stroke="#A8C4E8"
              strokeWidth="1"
            />
            {/* Content Card 1 (In Flight) */}
            <g transform="translate(160, 140)">
              <path d="M 0 0 L 40 -24 L 80 0 L 40 24 Z" fill="#FFFFFF" stroke="#D0E1F5" strokeWidth="1.2" />
              <line x1="20" y1="0" x2="60" y2="0" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            </g>
            {/* Content Card 2 (Verified with Orange Check) */}
            <g transform="translate(240, 90)">
              <path d="M 0 0 L 40 -24 L 80 0 L 40 24 Z" fill="#FFFFFF" stroke="#FFB27A" strokeWidth="1.5" />
              <circle cx="40" cy="0" r="5" fill="#FF6A1A" />
            </g>
          </g>

          {/* Left Wing: Visual Asset Vault & Color Palette Lab */}
          <g transform="translate(730, 410)">
            <path d="M 0 70 L 70 110 L 70 10 L 0 -30 Z" fill="url(#planeLeft)" />
            <path d="M 70 110 L 140 70 L 140 -30 L 70 10 Z" fill="url(#planeRight)" />
            <path d="M 0 -30 L 70 10 L 140 -30 L 70 -70 Z" fill="url(#planeTop)" />
            {/* Color Swatch Dots on Roof */}
            <ellipse cx="50" cy="-25" rx="6" ry="3.5" fill="#3B82F6" />
            <ellipse cx="70" cy="-35" rx="6" ry="3.5" fill="#FF6A1A" />
            <ellipse cx="90" cy="-25" rx="6" ry="3.5" fill="#28C76F" />
          </g>

          {/* Isometric Document Stacks */}
          <g transform="translate(1010, 560)">
            {/* Doc stack base */}
            <path d="M 0 0 L 50 -30 L 100 0 L 50 30 Z" fill="#FFFFFF" stroke="#C5D8F2" strokeWidth="1" />
            <path d="M 0 0 L 50 30 L 50 40 L 0 10 Z" fill="#CCDDF2" />
            <path d="M 50 30 L 100 0 L 100 10 L 50 40 Z" fill="#B8CFEC" />

            {/* Doc 2 */}
            <path d="M 5 -12 L 55 -42 L 105 -12 L 55 18 Z" fill="#FFFFFF" stroke="#D0E1F5" strokeWidth="1" />
            <path d="M 5 -12 L 55 18 L 55 24 L 5 -6 Z" fill="#CCDDF2" />
            <path d="M 55 18 L 105 -12 L 105 -6 L 55 24 Z" fill="#B8CFEC" />

            {/* Doc 3 (Active review draft with orange bookmark) */}
            <path d="M 10 -24 L 60 -54 L 110 -24 L 60 6 Z" fill="#FFFFFF" stroke="#FF6A1A" strokeWidth="1.5" />
            <polygon points="50,-42 65,-51 72,-40 57,-31" fill="#FF6A1A" />
          </g>

          {/* Modern Isometric Trees / Cylindrical Landscaping */}
          <g transform="translate(800, 600)">
            <ellipse cx="20" cy="10" rx="14" ry="8" fill="#B4CFE8" opacity="0.4" />
            <path d="M 12 10 L 28 10 L 24 -12 L 16 -12 Z" fill="#9FBFE0" />
            <ellipse cx="20" cy="-18" rx="16" ry="12" fill="#D3E4F7" stroke="#B8CFEC" strokeWidth="1" />
          </g>
          <g transform="translate(1220, 440)">
            <ellipse cx="20" cy="10" rx="16" ry="9" fill="#B4CFE8" opacity="0.4" />
            <path d="M 12 10 L 28 10 L 24 -14 L 16 -14 Z" fill="#9FBFE0" />
            <ellipse cx="20" cy="-22" rx="18" ry="14" fill="#D9E8F9" stroke="#B8CFEC" strokeWidth="1" />
          </g>
        </g>
      </svg>
    </div>
  );
}
