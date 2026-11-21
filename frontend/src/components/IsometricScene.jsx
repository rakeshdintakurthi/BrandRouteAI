import React from 'react';

/**
 * IsometricScene — Part 1 of the user's design reference.
 * Renders the 3D isometric futuristic AI governance office room (Image 2)
 * as a full-bleed, low-contrast ambient backdrop with glowing neon cyan accents.
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
        background: '#EDF3FA'
      }}
      aria-hidden="true"
    >
      {/* 3D Isometric Office Room Image from User Upload */}
      <img
        src="/isometric-office.png"
        alt="Isometric AI Governance Control Room"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.38,
          filter: 'blur(2px) saturate(1.15) contrast(0.98)',
          transform: 'scale(1.04)',
          transition: 'all 0.5s ease'
        }}
      />

      {/* Ambient Lighting Gradients over the Room */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(225, 238, 252, 0.75) 60%, rgba(215, 230, 248, 0.92) 100%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none'
        }}
      />

      {/* Subtle Cyan/Teal Glowing Accent Mesh */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 207, 232, 0.15) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 178, 122, 0.16) 0%, rgba(255, 106, 26, 0.08) 50%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
