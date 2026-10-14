import React, { useEffect, useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Users, Home, Phone, Shield, GitFork, User } from 'lucide-react';
import { familyApi } from '../services/api';

export default function HierarchyView({ currentVillage, onSelectMember }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAtak, setSelectedAtak] = useState('all');
  const [expandedFamilies, setExpandedFamilies] = useState(new Set());

  // Fetch families for the active village
  useEffect(() => {
    if (!currentVillage?._id) return;
    setLoading(true);

    familyApi.getAll({ villageId: currentVillage._id, limit: 100 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setFamilies(list);
        // Automatically expand the first 2 families for quick mobile preview
        if (list.length > 0) {
          setExpandedFamilies(new Set([list[0]._id, list[1]?._id].filter(Boolean)));
        }
      })
      .catch((err) => {
        console.error('Failed to load families:', err);
        setFamilies([]);
      })
      .finally(() => setLoading(false));
  }, [currentVillage?._id]);

  // Unique ataks list for filter pills
  const ataksList = useMemo(() => {
    const set = new Set();
    families.forEach((f) => {
      const a = f.atak?.gu || f.atak?.en || (typeof f.atak === 'string' ? f.atak : null);
      if (a) set.add(a);
    });
    return Array.from(set).sort();
  }, [families]);

  // Filtered families based on search and atak
  const filteredFamilies = useMemo(() => {
    return families.filter((f) => {
      const atakMatch = selectedAtak === 'all' || (f.atak?.gu === selectedAtak || f.atak?.en === selectedAtak || f.atak === selectedAtak);
      if (!atakMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const houseMatch = String(f.houseNumber || '').includes(q);
      const headNameGu = f.headMemberId?.fullName?.gu || f.headNameGujarati || '';
      const headNameEn = f.headMemberId?.fullName?.en || f.headNameEnglish || '';
      const mobileMatch = String(f.primaryMobile || f.headMemberId?.mobileNumber || '').includes(q);

      return (
        houseMatch ||
        headNameGu.toLowerCase().includes(q) ||
        headNameEn.toLowerCase().includes(q) ||
        mobileMatch
      );
    });
  }, [families, searchQuery, selectedAtak]);

  const toggleExpand = (familyId) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(familyId)) {
        next.delete(familyId);
      } else {
        next.add(familyId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFamilies(new Set(filteredFamilies.map((f) => f._id)));
  };

  const collapseAll = () => {
    setExpandedFamilies(new Set());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitFork size={20} color="#F59E0B" />
            <span>વંશાવળી (Hierarchy)</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            ગામ: {currentVillage?.name?.gu || currentVillage?.name || 'બધા'} ({filteredFamilies.length} કુટુંબો)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={expandAll}
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)'
            }}
          >
            બધા ખોલો
          </button>
          <button
            onClick={collapseAll}
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)'
            }}
          >
            બંધ કરો
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="ઘર નંબર, વડીલનું નામ કે મોબાઈલ શોધો..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
            ✕
          </button>
        )}
      </div>

      {/* Horizontal Atak Filter Pills (Touch Scrollable) */}
      {ataksList.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none'
          }}
        >
          <button
            onClick={() => setSelectedAtak('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: selectedAtak === 'all' ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedAtak === 'all' ? '#000' : 'var(--text-secondary)',
              border: selectedAtak === 'all' ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)'
            }}
          >
            બધી અટક ({families.length})
          </button>
          {ataksList.map((atak) => (
            <button
              key={atak}
              onClick={() => setSelectedAtak(atak)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: selectedAtak === 'atak' ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedAtak === atak ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
                border: selectedAtak === atak ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)'
              }}
            >
              {atak}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>વંશાવળી લોડ થઈ રહી છે...</span>
        </div>
      ) : filteredFamilies.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon-wrap">
            <Home size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>કોઈ કુટુંબ મળ્યું નથી</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            કૃપા કરીને અન્ય નામ, ઘર નંબર અથવા ગામ પસંદ કરો.
          </p>
        </div>
      ) : (
        /* Family Trees List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFamilies.map((family) => {
            const isExpanded = expandedFamilies.has(family._id);
            const headNameGu = family.headMemberId?.fullName?.gu || family.headNameGujarati || 'વડીલ';
            const headNameEn = family.headMemberId?.fullName?.en || family.headNameEnglish || '';
            const houseNo = family.houseNumber || '-';
            const atak = family.atak?.gu || family.atak?.en || (typeof family.atak === 'string' ? family.atak : '');
            const kuldevi = family.kuldevi?.gu || family.kuldevi?.en || '';
            const members = family.members || [];
            const mobile = family.primaryMobile || family.headMemberId?.mobileNumber || '';

            return (
              <div
                key={family._id}
                className="glass-card"
                style={{
                  border: isExpanded ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                  padding: 0,
                  overflow: 'hidden'
                }}
              >
                {/* Family Header Banner (Click to toggle) */}
                <div
                  onClick={() => toggleExpand(family._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid rgba(245, 158, 11, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', fontWeight: 600 }}>ઘર નં.</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFF' }}>#{houseNo}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>
                          {headNameGu}
                        </span>
                        {atak && <span className="badge badge-amber">{atak}</span>}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {headNameEn && <span>{headNameEn} • </span>}
                        {kuldevi && <span>{kuldevi} • </span>}
                        <span>{members.length > 0 ? `${members.length} સભ્યો` : 'કુટુંબ'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {mobile && (
                      <a
                        href={`tel:${mobile}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38BDF8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Call Head"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    <div style={{ color: isExpanded ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Tree Hierarchy */}
                {isExpanded && (
                  <div style={{ padding: '16px' }}>
                    {members.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                        આ કુટુંબમાં સભ્યોની વિગત સીધી વડીલ પ્રોફાઇલ સાથે જોડાયેલ છે.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          position: 'relative',
                          paddingLeft: '12px',
                          borderLeft: '2px dashed rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        {members.map((mem) => {
                          const isHead = mem.isHead || mem.relationWithHead?.gu === 'પોતે' || mem.isFamilyHead;
                          const memNameGu = mem.fullName?.gu || mem.fullNameGujarati || mem.name;
                          const memNameEn = mem.fullName?.en || mem.fullNameEnglish || '';
                          const memRel = mem.relationWithHead?.gu || (isHead ? 'વડીલ' : 'સભ્ય');
                          const isFemale = mem.gender === 'female' || mem.gender === 'સ્ત્રી';

                          return (
                            <div
                              key={mem._id}
                              onClick={() => onSelectMember && onSelectMember(mem)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                background: isHead
                                  ? 'rgba(245, 158, 11, 0.12)'
                                  : 'rgba(255, 255, 255, 0.03)',
                                border: isHead
                                  ? '1px solid rgba(245, 158, 11, 0.4)'
                                  : '1px solid rgba(255, 255, 255, 0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.25rem' }}>
                                  {isHead ? '👑' : isFemale ? '👩' : '👨'}
                                </span>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isHead ? 'var(--accent-amber-light)' : '#FFF' }}>
                                    {memNameGu}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {memRel} • {mem.age ? `${mem.age} વર્ષ` : ''} {mem.education ? `• ${mem.education}` : ''}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {mem.mobileNumber && (
                                  <a
                                    href={`tel:${mem.mobileNumber}`}
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
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>વિગત →</span>
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
          })}
        </div>
      )}
    </div>
  );
}
