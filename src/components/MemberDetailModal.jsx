import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, MapPin, Shield, Calendar, Briefcase, GraduationCap, Users, X, User } from 'lucide-react';
import { memberApi, familyApi } from '../services/api';

export default function MemberDetailModal({ member, onClose, onSelectMember }) {
  const [familyData, setFamilyData] = useState(null);
  const [loadingFamily, setLoadingFamily] = useState(false);

  useEffect(() => {
    if (member?.familyId) {
      const famId = member.familyId._id || member.familyId;
      if (famId) {
        setLoadingFamily(true);
        familyApi.getById(famId)
          .then((res) => {
            const fam = res?.data || res;
            setFamilyData(fam);
          })
          .catch(() => {})
          .finally(() => setLoadingFamily(false));
      }
    }
  }, [member]);

  if (!member) return null;

  const nameGu = member.fullName?.gu || member.fullNameGujarati || member.name || 'સભ્ય';
  const nameEn = member.fullName?.en || member.fullNameEnglish || '';
  const relationGu = member.relationWithHead?.gu || member.relation || 'સભ્ય';
  const isHead = member.isHead || relationGu === 'પોતે' || member.isFamilyHead;
  const isMale = member.gender === 'male' || member.gender === 'પુરુષ';
  const mobile = member.mobileNumber || member.phone || '';
  const cleanMobile = mobile ? mobile.replace(/[^0-9]/g, '').slice(-10) : '';

  const houseNumber = member.familyId?.houseNumber || familyData?.houseNumber || member.houseNumber || '-';
  const atak = member.atak?.gu || member.atak?.en || member.familyId?.atak?.gu || familyData?.atak?.gu || '-';
  const kuldevi = member.familyId?.kuldevi?.gu || familyData?.kuldevi?.gu || '-';
  const city = member.familyId?.address?.currentCity?.gu || familyData?.address?.currentCity?.gu || '-';
  const street = member.familyId?.address?.streetAddress || familyData?.address?.streetAddress || '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle-bar" />

        {/* Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${isHead ? 'badge-amber' : 'badge-muted'}`}>
              {isHead ? '👑 કુટુંબના વડીલ (Head)' : relationGu}
            </span>
            <span className="badge badge-muted">ઘર નં. #{houseNumber}</span>
          </div>
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="sheet-body">
          {/* Avatar & Names */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isMale
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(56, 189, 248, 0.05))'
                  : 'linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(244, 63, 94, 0.05))',
                border: isMale
                  ? '2px solid rgba(56, 189, 248, 0.5)'
                  : '2px solid rgba(244, 63, 94, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMale ? '#38BDF8' : '#FB7185',
                fontSize: '1.8rem',
                flexShrink: 0
              }}
            >
              {isMale ? '👨' : '👩'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {nameGu}
              </h2>
              {nameEn && (
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 600, marginTop: '2px' }}>
                  {nameEn}
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                અટક: <strong style={{ color: '#FFF' }}>{atak}</strong> • ઉંમર: {member.age ? `${member.age} વર્ષ` : 'અજાણ'}
              </div>
            </div>
          </div>

          {/* Quick Contact Actions (Mobile Optimized) */}
          {cleanMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <a
                href={`tel:${cleanMobile}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38BDF8',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                <Phone size={18} />
                <span>કૉલ કરો ({cleanMobile})</span>
              </a>

              <a
                href={`https://wa.me/91${cleanMobile}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
            </div>
          )}

          {/* Key Attributes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <div className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
                <Shield size={14} color="#F59E0B" />
                <span>કુળદેવી (Kuldevi)</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {kuldevi || 'માતાજી'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
                <MapPin size={14} color="#38BDF8" />
                <span>હાલનું શહેર (City)</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {city || 'ગામમાં જ'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
                <GraduationCap size={14} color="#10B981" />
                <span>શિક્ષણ (Education)</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {member.education || 'દર્શાવેલ નથી'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
                <Briefcase size={14} color="#A78BFA" />
                <span>વ્યવસાય (Occupation)</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {member.occupation || 'ખેતી / વ્યવસાય'}
              </div>
            </div>
          </div>

          {/* Full Address */}
          {(street || city) && (
            <div className="glass-card" style={{ padding: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
                <MapPin size={14} color="#F59E0B" />
                <span>સરનામું (Address)</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {street ? `${street}, ` : ''}{city}
              </div>
            </div>
          )}

          {/* Other Family Members in the same household */}
          {familyData?.members && familyData.members.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Users size={16} color="#F59E0B" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  કુટુંબના અન્ય સભ્યો ({familyData.members.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {familyData.members.map((famMem) => {
                  const isCurrent = String(famMem._id) === String(member._id);
                  const memNameGu = famMem.fullName?.gu || famMem.fullNameGujarati || famMem.name;
                  const memRel = famMem.relationWithHead?.gu || (famMem.isHead ? 'વડીલ' : 'સભ્ય');

                  return (
                    <div
                      key={famMem._id}
                      onClick={() => {
                        if (!isCurrent && onSelectMember) {
                          onSelectMember(famMem);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: isCurrent ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isCurrent ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: isCurrent ? 'default' : 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {famMem.gender === 'female' || famMem.gender === 'સ્ત્રી' ? '👩' : '👨'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isCurrent ? 'var(--accent-amber-light)' : 'var(--text-primary)' }}>
                            {memNameGu} {isCurrent && '(હાલ)'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {memRel} • {famMem.age ? `${famMem.age} વર્ષ` : ''}
                          </div>
                        </div>
                      </div>

                      {famMem.mobileNumber && (
                        <a
                          href={`tel:${famMem.mobileNumber}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '6px',
                            borderRadius: '50%',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38BDF8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Phone size={14} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
