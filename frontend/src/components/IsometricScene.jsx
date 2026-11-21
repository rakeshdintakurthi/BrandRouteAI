import React from 'react';

/**
 * IsometricScene
 * Renders the 3D isometric AI governance control room (from user uploaded image)
 * as the permanent, full-bleed UI background with crisp detail and ambient lighting.
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
        background: '#EDF4FA'
      }}
      aria-hidden="true"
    >
      {/* 3D Isometric AI Office Background Image */}
      <img
        src="/isometric-office.png"
        alt="Isometric AI Governance Room"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.82,
          filter: 'contrast(1.02) saturate(1.08) brightness(1.02)',
          transform: 'scale(1.02)',
          transition: 'opacity 0.4s ease'
        }}
      />

      {/* Ambient Lighting Sheen (Preserves text readability over the 3D room) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 35%, rgba(255, 255, 255, 0.45) 0%, rgba(235, 244, 253, 0.6) 65%, rgba(220, 235, 250, 0.82) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Subtle Cyan Hologram Light Bloom (matching the image's cyan glows) */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          right: '18%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '12%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 120, 30, 0.1) 0%, transparent 65%)',
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
