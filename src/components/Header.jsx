import React, { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';

export default function Header({
  villages = [],
  currentVillage,
  onSelectVillage
}) {
  const [villageModalOpen, setVillageModalOpen] = useState(false);

  const villageNameGu = currentVillage?.name?.gu || currentVillage?.name || 'ગામ પસંદ કરો';
  const villageNameEn = currentVillage?.name?.en || '';

  return (
    <>
      <header className="app-header">
        {/* Brand identity */}
        <div className="brand-wrapper">
          <div className="brand-logo-ring">
            <img
              src={`${import.meta.env.BASE_URL}nododa_rajput.png`}
              alt="નાડોદા રાજપૂત"
              className="brand-logo-img"
            />
          </div>
          <div className="brand-text-container">
            <span className="brand-title-gu">નાડોદા રાજપૂત</span>
            <span className="brand-title-en">Public Portal</span>
          </div>
        </div>

        {/* Village Switcher Pill */}
        <button
          className="village-pill-btn"
          onClick={() => setVillageModalOpen(true)}
          aria-label="ગામ પસંદ કરો"
        >
          <MapPin size={14} color="#F59E0B" />
          <span>{villageNameGu}</span>
          <ChevronDown size={14} color="#FDE68A" />
        </button>
      </header>

      {/* Village Selection Modal / Bottom Sheet */}
      {villageModalOpen && (
        <div className="modal-overlay" onClick={() => setVillageModalOpen(false)}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle-bar" />
            <div className="sheet-header">
              <div>
                <h3 className="sheet-title">ગામ પસંદ કરો</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Select Village to view directory & hierarchy
                </p>
              </div>
              <button
                className="sheet-close-btn"
                onClick={() => setVillageModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {villages.map((v) => {
                const isSelected = String(v._id) === String(currentVillage?._id);
                const nameGu = v.name?.gu || v.name;
                const nameEn = v.name?.en || v.slug;
                const taluka = v.taluka?.gu || v.taluka?.en || '';
                const district = v.district?.gu || v.district?.en || '';

                return (
                  <button
                    key={v._id}
                    onClick={() => {
                      onSelectVillage(v);
                      setVillageModalOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected
                        ? '1px solid rgba(245, 158, 11, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-primary)'
                        }}
                      >
                        {nameGu} {nameEn ? `(${nameEn})` : ''}
                      </div>
                      {(taluka || district) && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          તા. {taluka} | જિ. {district}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--accent-amber)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000'
                        }}
                      >
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
