import React, { useEffect, useState } from 'react';
import {
  Search,
  Phone,
  MessageCircle,
  Users,
  Filter,
  Crown,
  ChevronRight,
  X,
  MapPin,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { memberApi, villageApi } from '../services/api';

export default function DirectoryView({ currentVillage, onSelectMember }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAtak, setSelectedAtak] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [isHeadOnly, setIsHeadOnly] = useState(false);

  // Ataks dropdown list
  const [ataksList, setAtaksList] = useState([]);

  // Load ataks for current village
  useEffect(() => {
    if (!currentVillage?._id) return;
    const slugOrId = currentVillage.slug || currentVillage._id;
    villageApi.getAtaks(slugOrId)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setAtaksList(list);
      })
      .catch(() => setAtaksList([]));
  }, [currentVillage?._id]);

  // Fetch members with debounce
  useEffect(() => {
    if (!currentVillage?._id) return;
    setLoading(true);
    setPage(1);

    const timer = setTimeout(() => {
      fetchMembers(1, true);
    }, 250);

    return () => clearTimeout(timer);
  }, [currentVillage?._id, search, selectedAtak, selectedGender, isHeadOnly]);

  const fetchMembers = async (pageNum, reset = false) => {
    try {
      const params = {
        villageId: currentVillage._id,
        search: search.trim() || undefined,
        atak: selectedAtak || undefined,
        gender: selectedGender || undefined,
        isHead: isHeadOnly ? 'true' : undefined,
        page: pageNum,
        limit: 25
      };

      const res = await memberApi.getAll(params);
      const list = Array.isArray(res?.data) ? res.data : [];

      if (reset) {
        setMembers(list);
      } else {
        setMembers((prev) => [...prev, ...list]);
      }

      setTotalCount(res?.total || list.length);
      setTotalPages(res?.pages || 1);
    } catch (err) {
      console.error('Failed to load directory members:', err);
      if (reset) setMembers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMembers(nextPage, false);
  };

  const villageNameGu = currentVillage?.name?.gu || currentVillage?.name || 'ગામ';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title & Count */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="#F59E0B" />
          <span>સમાજ ડિરેક્ટરી ({villageNameGu})</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          કુલ {totalCount} સભ્યો નોંધાયેલ છે • ફોન કૉલ કે WhatsApp માટે સીધો સંપર્ક કરો
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="search-wrapper" style={{ marginBottom: 0 }}>
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="નામ, મોબાઈલ, અટક કે ઘર નંબર શોધો..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear-btn" onClick={() => setSearch('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Horizontal Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {/* Gender Pills */}
        <button
          onClick={() => setSelectedGender('')}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: !selectedGender ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.05)',
            color: !selectedGender ? '#000' : 'var(--text-secondary)',
            border: !selectedGender ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)'
          }}
        >
          બધા સભ્યો
        </button>

        <button
          onClick={() => setSelectedGender(selectedGender === 'male' ? '' : 'male')}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: selectedGender === 'male' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: selectedGender === 'male' ? '#38BDF8' : 'var(--text-secondary)',
            border: selectedGender === 'male' ? '1px solid #38BDF8' : '1px solid var(--border-subtle)'
          }}
        >
          👨 પુરુષ
        </button>

        <button
          onClick={() => setSelectedGender(selectedGender === 'female' ? '' : 'female')}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: selectedGender === 'female' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: selectedGender === 'female' ? '#FB7185' : 'var(--text-secondary)',
            border: selectedGender === 'female' ? '1px solid #FB7185' : '1px solid var(--border-subtle)'
          }}
        >
          👩 સ્ત્રી
        </button>

        {/* Head Only Toggle */}
        <button
          onClick={() => setIsHeadOnly(!isHeadOnly)}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: isHeadOnly ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: isHeadOnly ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
            border: isHeadOnly ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Crown size={12} />
          <span>માત્ર વડીલો</span>
        </button>

        {/* Atak Pills */}
        {ataksList.map((item) => {
          const atakGu = item.atak?.gu || item.atak;
          const isSelected = selectedAtak === atakGu;

          return (
            <button
              key={atakGu}
              onClick={() => setSelectedAtak(isSelected ? '' : atakGu)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
                border: isSelected ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)'
              }}
            >
              {atakGu}
            </button>
          );
        })}
      </div>

      {/* Directory Content List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>સભ્યોની યાદી લોડ થઈ રહી છે...</span>
        </div>
      ) : members.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon-wrap">
            <Users size={28} />
          </div>
          <h3>કોઈ સભ્ય મળ્યા નથી</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            કૃપા કરીને શોધવાનું નામ અથવા ફિલ્ટર બદલો.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {members.map((mem) => {
            const nameGu = mem.fullName?.gu || mem.fullNameGujarati || mem.name || 'સભ્ય';
            const nameEn = mem.fullName?.en || mem.fullNameEnglish || '';
            const relation = mem.relationWithHead?.gu || (mem.isFamilyHead ? 'પોતે' : 'સભ્ય');
            const isHead = mem.isFamilyHead || relation === 'પોતે' || mem.isHead;
            const isMale = mem.gender?.key === 'male' || mem.gender === 'male' || mem.gender === 'પુરુષ';
            const houseNo = mem.familyId?.houseNumber || mem.houseNumber || '-';
            const atak = mem.atak?.gu || mem.atak?.en || mem.familyId?.atak?.gu || '';
            const mobile = mem.mobileNumber || '';
            const cleanMobile = mobile ? mobile.replace(/\D/g, '').slice(-10) : '';
            const age = mem.age ? `${mem.age} વ.` : '';
            const education = mem.education?.qualification || '';
            const occupation = mem.occupation?.title || '';
            const city = mem.familyId?.address?.currentCity?.gu || mem.occupation?.workCity || '';

            return (
              <div
                key={mem._id}
                className="glass-card"
                onClick={() => onSelectMember && onSelectMember(mem)}
                style={{
                  cursor: 'pointer',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Top Row: Avatar, Name, Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: isMale ? 'rgba(56, 189, 248, 0.18)' : 'rgba(244, 63, 94, 0.18)',
                        color: isMale ? '#38BDF8' : '#FB7185',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        flexShrink: 0
                      }}
                    >
                      {isMale ? '👨' : '👩'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>
                          {nameGu}
                        </span>
                        {isHead && (
                          <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                            <Crown size={11} /> મુખ્ય
                          </span>
                        )}
                        {atak && <span className="badge badge-muted">{atak}</span>}
                      </div>

                      {nameEn && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {nameEn}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="badge badge-amber">
                    #{houseNo}
                  </span>
                </div>

                {/* Meta details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>સંબંધ: <strong style={{ color: '#FFF' }}>{relation}</strong></span>
                  {age && <span>ઉંમર: <strong style={{ color: '#FFF' }}>{age}</strong></span>}
                  {education && <span>શિક્ષણ: <strong style={{ color: '#FFF' }}>{education}</strong></span>}
                  {occupation && <span>વ્યવસાય: <strong style={{ color: '#FFF' }}>{occupation}</strong></span>}
                  {city && <span>સ્થળ: <strong style={{ color: '#FFF' }}>{city}</strong></span>}
                </div>

                {/* Bottom Actions: Call, WhatsApp, View Profile */}
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
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38BDF8',
                          fontSize: '0.76rem',
                          fontWeight: 700
                        }}
                      >
                        <Phone size={13} />
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
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10B981',
                          fontSize: '0.76rem',
                          fontWeight: 700
                        }}
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>મોબાઈલ દર્શાવેલ નથી</span>
                  )}

                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                    પ્રોફાઇલ જુઓ →
                  </span>
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {page < totalPages && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-amber-light)',
                fontWeight: 700,
                fontSize: '0.88rem',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loadingMore ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  <span>લોડ થઈ રહ્યું છે...</span>
                </>
              ) : (
                <span>વધુ સભ્યો જુઓ (Load More - પેજ {page}/{totalPages})</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
