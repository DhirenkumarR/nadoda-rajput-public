import React, { useEffect, useState, useMemo } from 'react';
import { Search, Phone, MessageCircle, Users, Filter, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import { memberApi } from '../services/api';

export default function DirectoryView({ currentVillage, onSelectMember }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedAtak, setSelectedAtak] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch members when village or filters change
  useEffect(() => {
    if (!currentVillage?._id) return;
    setLoading(true);
    setPage(1);

    fetchMembers(1, true);
  }, [currentVillage?._id, selectedGender, selectedAtak]);

  const fetchMembers = async (pageNum, reset = false) => {
    try {
      const params = {
        villageId: currentVillage._id,
        page: pageNum,
        limit: 30
      };

      if (selectedGender !== 'all') {
        params.gender = selectedGender;
      }
      if (selectedAtak !== 'all') {
        params.atak = selectedAtak;
      }

      const res = await memberApi.getAll(params);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

      if (reset) {
        setMembers(list);
      } else {
        setMembers((prev) => [...prev, ...list]);
      }

      setHasMore(list.length >= 30);
    } catch (err) {
      console.error('Failed to load members:', err);
      if (reset) setMembers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMembers(nextPage, false);
  };

  // Client-side search filtering
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();

    return members.filter((m) => {
      const nameGu = m.fullName?.gu || m.fullNameGujarati || m.name || '';
      const nameEn = m.fullName?.en || m.fullNameEnglish || '';
      const mobile = m.mobileNumber || m.phone || '';
      const houseNo = String(m.familyId?.houseNumber || m.houseNumber || '');
      const atak = m.atak?.gu || m.atak?.en || m.familyId?.atak?.gu || '';
      const city = m.familyId?.address?.currentCity?.gu || '';

      return (
        nameGu.toLowerCase().includes(q) ||
        nameEn.toLowerCase().includes(q) ||
        mobile.includes(q) ||
        houseNo.includes(q) ||
        atak.toLowerCase().includes(q) ||
        city.toLowerCase().includes(q)
      );
    });
  }, [members, searchQuery]);

  // Extract unique ataks from loaded members for quick pills
  const ataksList = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      const a = m.atak?.gu || m.atak?.en || m.familyId?.atak?.gu;
      if (a) set.add(a);
    });
    return Array.from(set).sort();
  }, [members]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title & Count */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="#F59E0B" />
          <span>સમાજ ડિરેક્ટરી (Directory)</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          ગામ: {currentVillage?.name?.gu || currentVillage?.name || 'બધા'} ({filteredMembers.length} સભ્યો દર્શાવેલ)
        </p>
      </div>

      {/* Search Input */}
      <div className="search-wrapper" style={{ marginBottom: 0 }}>
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="નામ, મોબાઈલ, અટક કે ઘર નંબર શોધો..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Gender & Atak Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedGender('all')}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: selectedGender === 'all' ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.05)',
            color: selectedGender === 'all' ? '#000' : 'var(--text-secondary)',
            border: selectedGender === 'all' ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)'
          }}
        >
          બધા સભ્યો
        </button>

        <button
          onClick={() => setSelectedGender('male')}
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
          onClick={() => setSelectedGender('female')}
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

        {ataksList.map((atak) => (
          <button
            key={atak}
            onClick={() => setSelectedAtak(selectedAtak === atak ? 'all' : atak)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: selectedAtak === atak ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedAtak === atak ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
              border: selectedAtak === atak ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)'
            }}
          >
            {atak}
          </button>
        ))}
      </div>

      {/* Directory Content List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>ડિરેક્ટરી લોડ થઈ રહી છે...</span>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon-wrap">
            <Users size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>કોઈ સભ્ય મળ્યા નથી</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            શોધવાની માહિતી અથવા ફિલ્ટર બદલીને ફરી પ્રયાસ કરો.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMembers.map((member) => {
            const nameGu = member.fullName?.gu || member.fullNameGujarati || member.name;
            const nameEn = member.fullName?.en || member.fullNameEnglish || '';
            const relation = member.relationWithHead?.gu || (member.isHead ? 'વડીલ' : 'સભ્ય');
            const isHead = member.isHead || relation === 'પોતે' || member.isFamilyHead;
            const houseNo = member.familyId?.houseNumber || member.houseNumber || '-';
            const atak = member.atak?.gu || member.atak?.en || member.familyId?.atak?.gu || '';
            const mobile = member.mobileNumber || member.phone || '';
            const cleanMobile = mobile ? mobile.replace(/[^0-9]/g, '').slice(-10) : '';
            const isMale = member.gender === 'male' || member.gender === 'પુરુષ';

            return (
              <div
                key={member._id}
                className="glass-card"
                onClick={() => onSelectMember && onSelectMember(member)}
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                {/* Left: Avatar & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: isMale
                        ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.04))'
                        : 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.04))',
                      border: isMale
                        ? '1.5px solid rgba(56, 189, 248, 0.4)'
                        : '1.5px solid rgba(244, 63, 94, 0.4)',
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
                      <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFF' }}>
                        {nameGu}
                      </span>
                      {isHead && <span className="badge badge-amber">વડીલ</span>}
                      {atak && <span className="badge badge-muted">{atak}</span>}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      ઘર નં. #{houseNo} • {relation} • {member.age ? `${member.age} વર્ષ` : ''}
                    </div>

                    {nameEn && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {nameEn}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action Buttons (Call / WhatsApp) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {cleanMobile ? (
                    <>
                      <a
                        href={`tel:${cleanMobile}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.12)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38BDF8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label={`Call ${nameGu}`}
                      >
                        <Phone size={16} />
                      </a>

                      <a
                        href={`https://wa.me/91${cleanMobile}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label={`WhatsApp ${nameGu}`}
                      >
                        <MessageCircle size={16} />
                      </a>
                    </>
                  ) : (
                    <ChevronRight size={18} color="var(--text-muted)" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && !searchQuery.trim() && (
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
                fontWeight: 600,
                fontSize: '0.9rem',
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
                <span>વધુ સભ્યો જુઓ (Load More)</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
