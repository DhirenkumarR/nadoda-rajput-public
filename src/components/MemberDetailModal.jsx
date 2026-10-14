import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Heart,
  Droplets,
  Calendar,
  Home,
  Users,
  Crown,
  GitFork
} from 'lucide-react';
import { memberApi, familyApi } from '../services/api';

export default function MemberDetailModal({
  member,
  onClose,
  onSelectMember,
  onGoToFamily
}) {
  const [fullMember, setFullMember] = useState(member);
  const [familyData, setFamilyData] = useState(null);
  const [loadingFamily, setLoadingFamily] = useState(false);

  // Fetch full member record
  useEffect(() => {
    setFullMember(member);
    if (member?._id) {
      memberApi.getById(member._id)
        .then((res) => {
          if (res?.success && res?.data) {
            setFullMember(res.data);
          }
        })
        .catch(() => {});
    }
  }, [member?._id]);

  // Fetch full family members
  useEffect(() => {
    const famId = member?.familyId?._id || member?.familyId;
    if (famId) {
      setLoadingFamily(true);
      familyApi.getById(famId)
        .then((res) => {
          const fam = res?.data || res;
          if (fam?._id) {
            setFamilyData(fam);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingFamily(false));
    }
  }, [member?.familyId]);

  if (!member) return null;

  const mem = fullMember || member;
  const isMale = mem.gender?.key === 'male' || mem.gender === 'male' || mem.gender === 'પુરુષ';
  const nameGu = mem.fullName?.gu || mem.fullNameGujarati || mem.name || 'સભ્ય';
  const nameEn = mem.fullName?.en || mem.fullNameEnglish || '';
  const relationGu = mem.relationWithHead?.gu || (mem.isFamilyHead ? 'પોતે' : 'સભ્ય');
  const isHead = mem.isFamilyHead || relationGu === 'પોતે' || mem.isHead;

  const mobile = mem.mobileNumber || '';
  const cleanMobile = mobile ? mobile.replace(/\D/g, '').slice(-10) : '';

  const houseNumber = mem.familyId?.houseNumber || familyData?.houseNumber || mem.houseNumber || '-';
  const atakGu = mem.atak?.gu || mem.atak?.en || mem.familyId?.atak?.gu || familyData?.atak?.gu || '-';
  const kuldeviGu = mem.familyId?.kuldevi?.gu || familyData?.kuldevi?.gu || '';
  const nativeVillageGu = mem.villageId?.name?.gu || familyData?.villageId?.name?.gu || 'બાસ્પા';
  const currentCityGu = mem.familyId?.address?.currentCity?.gu || familyData?.address?.currentCity?.gu || nativeVillageGu;
  const streetAddress = mem.familyId?.address?.streetAddress || familyData?.address?.streetAddress || '';

  const education = mem.education?.qualification || (typeof mem.education === 'string' ? mem.education : '');
  const occupation = mem.occupation?.title || (typeof mem.occupation === 'string' ? mem.occupation : '');
  const workCity = mem.occupation?.workCity || '';
  const marital = mem.maritalStatus?.gu || '';

  const familyMembersList = familyData?.members || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle-bar" />

        {/* Modal Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`badge ${isHead ? 'badge-amber' : 'badge-muted'}`}>
              {isHead ? '👑 મુખ્ય સભ્ય (Head)' : relationGu}
            </span>
            <span className="badge badge-amber">ઘર નં. #{houseNumber}</span>
          </div>

          <button className="sheet-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="sheet-body">
          {/* Avatar and Names */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
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
                fontSize: '1.8rem',
                flexShrink: 0
              }}
            >
              {isMale ? '👨' : '👩'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', lineHeight: 1.2 }}>
                  {nameGu}
                </h2>
                {isHead && <Crown size={16} color="#F59E0B" />}
              </div>

              {nameEn && (
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontWeight: 600, marginTop: '2px' }}>
                  {nameEn}
                </div>
              )}

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                અટક: <strong style={{ color: '#FFF' }}>{atakGu}</strong> • {mem.age ? `${mem.age} વર્ષ` : ''} {mem.gender?.gu ? `• ${mem.gender.gu}` : ''}
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons (Call / WhatsApp) */}
          {cleanMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <a
                href={`tel:${cleanMobile}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38BDF8',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                <Phone size={16} />
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
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          )}

          {/* "Go to Family in Hierarchy" Button */}
          {mem.familyId && (
            <button
              onClick={() => {
                const famId = mem.familyId?._id || mem.familyId;
                if (onGoToFamily) {
                  onGoToFamily(famId);
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08))',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: 'var(--accent-amber-light)',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '16px'
              }}
            >
              <GitFork size={18} color="#F59E0B" />
              <span>કુટુંબની વંશાવળી જુઓ (Go to Family Tree)</span>
            </button>
          )}

          {/* Key Attributes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div className="glass-card" style={{ padding: '10px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px' }}>
                🚩 કુળદેવી
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {kuldeviGu || 'માતાજી'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '10px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px' }}>
                💍 લગ્ન સ્થિતિ
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {marital || 'પરણિત'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '10px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px' }}>
                🎓 અભ્યાસ (Education)
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {education || 'દર્શાવેલ નથી'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '10px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px' }}>
                💼 વ્યવસાય (Occupation)
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {occupation || 'ખેતી / વ્યવસાય'} {workCity ? `(${workCity})` : ''}
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="glass-card" style={{ padding: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
              <MapPin size={14} color="#38BDF8" />
              <span>સરનામું અને રહેઠાણ</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 600 }}>
              {currentCityGu}
              {streetAddress ? ` - ${streetAddress}` : ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              મૂળ ગામ: {nativeVillageGu} • ઘર નં. #{houseNumber}
            </div>
          </div>

          {/* Family Members in this Household */}
          {familyMembersList.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Users size={16} color="#F59E0B" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFF' }}>
                  આ કુટુંબના સભ્યો ({familyMembersList.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {familyMembersList.map((famMem) => {
                  const isCurrent = String(famMem._id) === String(mem._id);
                  const memNameGu = famMem.fullName?.gu || famMem.fullNameGujarati || famMem.name;
                  const memRel = famMem.relationWithHead?.gu || (famMem.isFamilyHead ? 'પોતે' : 'સભ્ય');
                  const memIsMale = famMem.gender?.key === 'male' || famMem.gender === 'male' || famMem.gender === 'પુરુષ';

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
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isCurrent ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isCurrent ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: isCurrent ? 'default' : 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>
                          {memIsMale ? '👨' : '👩'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isCurrent ? 'var(--accent-amber-light)' : '#FFF' }}>
                            {memNameGu} {isCurrent && '(હાલ)'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {memRel} • {famMem.age ? `${famMem.age} વ.` : ''}
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
                          <Phone size={13} />
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
