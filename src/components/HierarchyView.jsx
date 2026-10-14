import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Home,
  MapPin,
  Phone,
  Search,
  ArrowLeft,
  Users,
  Shield,
  MessageCircle,
  Crown,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { villageApi, familyApi } from '../services/api';

export default function HierarchyView({
  currentVillage,
  targetFamily,
  onClearTargetFamily,
  onSelectMember
}) {
  // Navigation State
  // Level 1: selectedAtak === null && selectedFamily === null
  // Level 2: selectedAtak !== null && selectedFamily === null
  // Level 3: selectedFamily !== null
  const [ataksList, setAtaksList] = useState([]);
  const [loadingAtaks, setLoadingAtaks] = useState(true);

  const [selectedAtak, setSelectedAtak] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);

  // Level 2 Families State
  const [families, setFamilies] = useState([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [familyPage, setFamilyPage] = useState(1);
  const [familyTotalPages, setFamilyTotalPages] = useState(1);
  const [familyTotalCount, setFamilyTotalCount] = useState(0);
  const [familySearch, setFamilySearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Level 3 Family Detail & Members State
  const [familyDetail, setFamilyDetail] = useState(null);
  const [loadingFamilyDetail, setLoadingFamilyDetail] = useState(false);

  // 1. Load village ataks (Level 1)
  useEffect(() => {
    if (!currentVillage?._id) return;
    setLoadingAtaks(true);
    setSelectedAtak(null);
    setSelectedFamily(null);

    const slugOrId = currentVillage.slug || currentVillage._id;
    villageApi.getAtaks(slugOrId)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setAtaksList(list);
      })
      .catch((err) => {
        console.error('Failed to load village ataks:', err);
        setAtaksList([]);
      })
      .finally(() => setLoadingAtaks(false));
  }, [currentVillage?._id]);

  // 2. Fetch family detail (Level 3)
  const fetchFamilyDetail = async (famId) => {
    if (!famId) return;
    setLoadingFamilyDetail(true);
    try {
      const res = await familyApi.getById(famId);
      if (res?.success && res?.data) {
        setFamilyDetail(res.data);
      } else if (res?.data) {
        setFamilyDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch family detail:', err);
    } finally {
      setLoadingFamilyDetail(false);
    }
  };

  // 3. Handle navigation to targetFamily (from Directory or Profile modal)
  useEffect(() => {
    if (targetFamily) {
      const famId = targetFamily._id || targetFamily;
      setLoadingFamilyDetail(true);
      familyApi.getById(famId)
        .then((res) => {
          const fam = res?.data || res;
          if (fam?._id) {
            setSelectedFamily(fam);
            setFamilyDetail(fam);
            if (fam.atak) {
              const atakGu = fam.atak?.gu || fam.atak;
              const atakEn = fam.atak?.en || '';
              setSelectedAtak({
                atak: { gu: atakGu, en: atakEn },
                kuldevi: fam.kuldevi || {}
              });
            }
          }
        })
        .catch((err) => console.error('Error loading target family:', err))
        .finally(() => {
          setLoadingFamilyDetail(false);
          if (onClearTargetFamily) onClearTargetFamily();
        });
    }
  }, [targetFamily]);

  // 4. Fetch families for selected atak (Level 2)
  const fetchFamilies = async () => {
    if (!currentVillage?._id || !selectedAtak) return;
    setLoadingFamilies(true);
    try {
      const atakGu = selectedAtak.atak?.gu || selectedAtak.atak;
      const res = await familyApi.getAll({
        villageId: currentVillage._id,
        atak: atakGu,
        search: familySearch.trim() || undefined,
        city: cityFilter.trim() || undefined,
        page: familyPage,
        limit: 15
      });

      if (res?.success) {
        setFamilies(res.data || []);
        setFamilyTotalPages(res.pages || 1);
        setFamilyTotalCount(res.total || 0);
      } else {
        setFamilies(Array.isArray(res?.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load families:', err);
      setFamilies([]);
    } finally {
      setLoadingFamilies(false);
    }
  };

  useEffect(() => {
    if (selectedAtak && !selectedFamily) {
      fetchFamilies();
    }
  }, [selectedAtak, familyPage, familySearch, cityFilter]);

  // 5. When selectedFamily changes, load full detail
  useEffect(() => {
    if (selectedFamily?._id) {
      fetchFamilyDetail(selectedFamily._id);
    }
  }, [selectedFamily?._id]);

  const villageNameGu = currentVillage?.name?.gu || currentVillage?.name || 'ગામ';
  const villageNameEn = currentVillage?.name?.en || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Interactive Breadcrumb Bar */}
      <div
        className="glass-card"
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          fontSize: '0.82rem'
        }}
      >
        <button
          onClick={() => {
            setSelectedAtak(null);
            setSelectedFamily(null);
          }}
          style={{
            color: !selectedAtak ? 'var(--accent-amber)' : 'var(--text-secondary)',
            fontWeight: !selectedAtak ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Home size={14} />
          <span>{villageNameGu}</span>
        </button>

        {selectedAtak && (
          <>
            <ChevronRight size={14} color="var(--text-muted)" />
            <button
              onClick={() => setSelectedFamily(null)}
              style={{
                color: !selectedFamily ? 'var(--accent-amber)' : 'var(--text-secondary)',
                fontWeight: !selectedFamily ? 700 : 500
              }}
            >
              અટક: {selectedAtak.atak?.gu}
            </button>
          </>
        )}

        {selectedFamily && (
          <>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ color: 'var(--accent-amber-light)', fontWeight: 700 }}>
              ઘર નં. #{selectedFamily.houseNumber}
            </span>
          </>
        )}
      </div>

      {/* =================================================================== */}
      {/* LEVEL 1: ATAKS GRID                                                 */}
      {/* =================================================================== */}
      {!selectedAtak && !selectedFamily && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
              ૧. અટક મુજબ વિભાજન ({villageNameGu})
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              કોઈપણ અટક પર ક્લિક કરીને તે અટકના તમામ પરિવારો અને સભ્યો જુઓ
            </p>
          </div>

          {loadingAtaks ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>અટકવાર વિગતો લોડ થઈ રહી છે...</span>
            </div>
          ) : ataksList.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon-wrap">
                <Shield size={28} />
              </div>
              <h3>કોઈ અટક નોંધાયેલ નથી</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                આ ગામમાં હજુ સુધી કોઈ અટક દાખલ થયેલ નથી.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {ataksList.map((item, idx) => {
                const atakGu = item.atak?.gu || item.atak;
                const atakEn = item.atak?.en || '';
                const kuldeviGu = item.kuldevi?.gu || '';
                const totalHouses = item.totalHouses || 0;
                const totalMembers = item.totalMembers || 0;
                const totalMale = item.totalMale || 0;
                const totalFemale = item.totalFemale || 0;

                return (
                  <div
                    key={idx}
                    className="glass-card"
                    onClick={() => {
                      setSelectedAtak(item);
                      setFamilyPage(1);
                      setFamilySearch('');
                    }}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '16px',
                      transition: 'transform 0.15s ease, border-color 0.15s ease'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>
                          {atakGu}
                        </div>
                        {atakEn && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                            {atakEn}
                          </div>
                        )}
                      </div>
                      <span className="badge badge-amber">
                        {totalHouses} ઘરો
                      </span>
                    </div>

                    {/* Kuldevi */}
                    {kuldeviGu && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent-amber-light)',
                          background: 'rgba(245, 158, 11, 0.08)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}
                      >
                        🚩 કુળદેવી: <strong>{kuldeviGu}</strong>
                      </div>
                    )}

                    {/* Counts Row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '6px',
                        textAlign: 'center',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>કુલ સભ્યો</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>
                          {totalMembers}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>પુરુષ</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38BDF8' }}>
                          {totalMale}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>સ્ત્રી</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FB7185' }}>
                          {totalFemale}
                        </div>
                      </div>
                    </div>

                    {/* Action Hint */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--accent-amber)',
                        marginTop: '4px'
                      }}
                    >
                      <span>પરિવારો જુઓ</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* LEVEL 2: FAMILIES IN SELECTED ATAK                                  */}
      {/* =================================================================== */}
      {selectedAtak && !selectedFamily && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Header & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSelectedAtak(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFF',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={14} />
              <span>પાછા જાઓ</span>
            </button>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>
                ૨. {selectedAtak.atak?.gu} ({selectedAtak.atak?.en || ''}) - પરિવારો
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                કુલ {familyTotalCount} ઘરો • કુળદેવી: {selectedAtak.kuldevi?.gu || '-'}
              </p>
            </div>
          </div>

          {/* Search Bar for Families */}
          <div className="search-wrapper" style={{ marginBottom: 0 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="ઘર નં., વડીલનું નામ કે મોબાઈલ શોધો..."
              value={familySearch}
              onChange={(e) => {
                setFamilySearch(e.target.value);
                setFamilyPage(1);
              }}
            />
            {familySearch && (
              <button className="search-clear-btn" onClick={() => setFamilySearch('')}>
                ✕
              </button>
            )}
          </div>

          {/* Families List */}
          {loadingFamilies ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>પરિવારો લોડ થઈ રહ્યા છે...</span>
            </div>
          ) : families.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon-wrap">
                <Home size={28} />
              </div>
              <h3>કોઈ કુટુંબ મળ્યું નથી</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                શોધવાની માહિતી બદલીને ફરી પ્રયાસ કરો.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {families.map((fam) => {
                const houseNo = fam.houseNumber || '-';
                const headGu = fam.headMemberId?.fullName?.gu || fam.headNameGujarati || 'વડીલ';
                const headEn = fam.headMemberId?.fullName?.en || fam.headNameEnglish || '';
                const city = fam.address?.currentCity?.gu || 'ગામમાં જ';
                const street = fam.address?.streetAddress || '';
                const mobile = fam.primaryMobile || fam.headMemberId?.mobileNumber || '';
                const memberCount = fam.totalMembersCount || fam.members?.length || 0;

                return (
                  <div
                    key={fam._id}
                    className="glass-card"
                    onClick={() => setSelectedFamily(fam)}
                    style={{
                      cursor: 'pointer',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-amber" style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                          ઘર નં. #{houseNo}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {selectedAtak.atak?.gu}
                        </span>
                      </div>

                      <span className="badge badge-muted">
                        {memberCount > 0 ? `${memberCount} સભ્યો` : 'કુટુંબ'}
                      </span>
                    </div>

                    {/* Head Name */}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#FFF' }}>
                        {headGu}
                      </div>
                      {headEn && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {headEn}
                        </div>
                      )}
                    </div>

                    {/* Location & Phone */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#38BDF8" />
                        <span>{city}{street ? ` (${street})` : ''}</span>
                      </div>

                      {mobile && (
                        <a
                          href={`tel:${mobile}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#10B981',
                            fontWeight: 600
                          }}
                        >
                          <Phone size={12} />
                          <span>{mobile}</span>
                        </a>
                      )}
                    </div>

                    {/* Bottom Link */}
                    <div
                      style={{
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--accent-amber)'
                      }}
                    >
                      <span>સભ્યોની યાદી જુઓ</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {familyTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                  <button
                    disabled={familyPage <= 1}
                    onClick={() => setFamilyPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: familyPage <= 1 ? 'var(--text-muted)' : '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    ← પાછળ
                  </button>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    પેજ {familyPage} / {familyTotalPages}
                  </span>

                  <button
                    disabled={familyPage >= familyTotalPages}
                    onClick={() => setFamilyPage((p) => Math.min(familyTotalPages, p + 1))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: familyPage >= familyTotalPages ? 'var(--text-muted)' : '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    આગળ →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* LEVEL 3: FAMILY ROSTER & MEMBERS TREE                               */}
      {/* =================================================================== */}
      {selectedFamily && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Header & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSelectedFamily(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFF',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={14} />
              <span>પરિવારો</span>
            </button>

            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>
                ૩. ઘર નં. #{selectedFamily.houseNumber} - સભ્યોની વંશાવળી
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                અટક: {selectedFamily.atak?.gu || selectedAtak?.atak?.gu} • કુળદેવી: {selectedFamily.kuldevi?.gu || selectedAtak?.kuldevi?.gu || '-'}
              </p>
            </div>
          </div>

          {/* Family Banner Card */}
          <div
            className="glass-card"
            style={{
              padding: '14px',
              background: 'linear-gradient(135deg, rgba(24, 38, 71, 0.8), rgba(17, 28, 53, 0.95))',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '0.8rem'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>મુખ્ય વ્યક્તિ (Head):</span>
              <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>
                {familyDetail?.headMemberId?.fullName?.gu || selectedFamily.headMemberId?.fullName?.gu || '-'}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>કુલ સભ્યો:</span>
              <div style={{ fontWeight: 800, color: 'var(--accent-amber)', fontSize: '0.95rem' }}>
                {familyDetail?.members?.length || selectedFamily.totalMembersCount || 0} સભ્યો
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>રહેઠાણ:</span>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {selectedFamily.address?.currentCity?.gu || 'ગામમાં જ'}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>પ્રાથમિક મોબાઈલ:</span>
              <div style={{ color: '#10B981', fontWeight: 700 }}>
                {selectedFamily.primaryMobile || familyDetail?.headMemberId?.mobileNumber || '-'}
              </div>
            </div>
          </div>

          {/* Members List (Mobile-Optimized Cards) */}
          {loadingFamilyDetail ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>સભ્યોની માહિતી લોડ થઈ રહી છે...</span>
            </div>
          ) : !familyDetail?.members || familyDetail.members.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon-wrap">
                <Users size={28} />
              </div>
              <h3>કોઈ સભ્ય નોંધાયેલ નથી</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                આ કુટુંબમાં હજુ સભ્યો દાખલ થયેલ નથી.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {familyDetail.members.map((mem) => {
                const nameGu = mem.fullName?.gu || mem.fullNameGujarati || mem.name || 'સભ્ય';
                const nameEn = mem.fullName?.en || mem.fullNameEnglish || '';
                const relation = mem.relationWithHead?.gu || (mem.isFamilyHead ? 'પોતે' : 'સભ્ય');
                const isHead = mem.isFamilyHead || relation === 'પોતે' || mem.isHead;
                const isMale = mem.gender?.key === 'male' || mem.gender === 'male' || mem.gender === 'પુરુષ';
                const age = mem.age ? `${mem.age} વ.` : '';
                const mobile = mem.mobileNumber || '';
                const cleanMobile = mobile ? mobile.replace(/\D/g, '').slice(-10) : '';
                const education = mem.education?.qualification || (typeof mem.education === 'string' ? mem.education : '');
                const occupation = mem.occupation?.title || (typeof mem.occupation === 'string' ? mem.occupation : '');

                return (
                  <div
                    key={mem._id}
                    className="glass-card"
                    onClick={() => onSelectMember && onSelectMember(mem)}
                    style={{
                      cursor: 'pointer',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      border: isHead ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                      background: isHead ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)'
                    }}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isMale ? 'rgba(56, 189, 248, 0.18)' : 'rgba(244, 63, 94, 0.18)',
                            color: isMale ? '#38BDF8' : '#FB7185',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0
                          }}
                        >
                          {isMale ? '👨' : '👩'}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFF' }}>
                              {nameGu}
                            </span>
                            {isHead && (
                              <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                                <Crown size={11} /> મુખ્ય
                              </span>
                            )}
                          </div>
                          {nameEn && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {nameEn}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="badge badge-muted">
                        {relation}
                      </span>
                    </div>

                    {/* Middle Details (Age, Edu, Occ) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {age && <span>ઉંમર: <strong style={{ color: '#FFF' }}>{age}</strong></span>}
                      {education && <span>અભ્યાસ: <strong style={{ color: '#FFF' }}>{education}</strong></span>}
                      {occupation && <span>વ્યવસાય: <strong style={{ color: '#FFF' }}>{occupation}</strong></span>}
                    </div>

                    {/* Bottom Actions */}
                    <div
                      style={{
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      {cleanMobile ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a
                            href={`tel:${cleanMobile}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(56, 189, 248, 0.12)',
                              color: '#38BDF8',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            <Phone size={12} />
                            <span>{cleanMobile}</span>
                          </a>

                          <a
                            href={`https://wa.me/91${cleanMobile}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10B981',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            <MessageCircle size={12} />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>મોબાઈલ નથી</span>
                      )}

                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                        પ્રોફાઇલ જુઓ →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
