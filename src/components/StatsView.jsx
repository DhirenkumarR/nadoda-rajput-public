import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Home,
  UserCheck,
  Shield,
  Briefcase,
  MapPin,
  Heart,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { villageApi } from '../services/api';
import { apiCache } from '../services/cache';

export default function StatsView({ currentVillage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = (forceRefresh = false) => {
    if (!currentVillage) return;
    if (forceRefresh) {
      setRefreshing(true);
      const targetId = currentVillage.slug || currentVillage._id;
      apiCache.invalidate(`/villages/${targetId}/stats`);
    } else {
      setLoading(true);
    }

    const targetId = currentVillage.slug || currentVillage._id;
    villageApi.getStats(targetId)
      .then((res) => {
        const d = res?.data || res;
        setStats(d);
      })
      .catch((err) => {
        console.error('Failed to load stats:', err);
        setStats(null);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadStats();
  }, [currentVillage?._id]);

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>આંકડાકીય માહિતી લોડ થઈ રહી છે...</span>
      </div>
    );
  }

  // Exact fields from backend calculateVillageStats
  const summary = stats?.summary || {};
  const ataks = stats?.ataks || [];
  const demo = stats?.demographics || {};
  const ageDistribution = demo?.ageDistribution || [];
  const topOccupations = demo?.topOccupations || [];
  const topCities = demo?.topCities || [];
  const maritalStatus = demo?.maritalStatus || [];

  const totalHouses = summary.totalHouses ?? currentVillage?.totalHouses ?? 0;
  const totalMembers = summary.totalMembers ?? currentVillage?.totalMembers ?? 0;
  const totalMale = summary.totalMale ?? currentVillage?.totalMale ?? 0;
  const totalFemale = summary.totalFemale ?? currentVillage?.totalFemale ?? 0;
  const sexRatio = summary.sexRatio ?? (totalMale > 0 ? Math.round((totalFemale / totalMale) * 1000) : 0);
  const avgFamilySize = summary.averageFamilySize ?? (totalHouses > 0 ? (totalMembers / totalHouses).toFixed(1) : 0);

  const malePercent = totalMembers > 0 ? Math.round((totalMale / totalMembers) * 100) : 50;
  const femalePercent = totalMembers > 0 ? 100 - malePercent : 50;

  const villageNameGu = currentVillage?.name?.gu || currentVillage?.name || 'ગામ';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#F59E0B" />
            <span>સમાજ ગણતરી અને આંકડાશાસ્ત્ર</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            ગામ: {villageNameGu} • લાઈવ ડેટાબેઝ વિશ્લેષણ
          </p>
        </div>

        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--accent-amber-light)',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="રીફ્રેશ કરો"
        >
          <RefreshCw size={13} className={refreshing ? 'spinner' : ''} />
          <span>રીફ્રેશ</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>કુલ પરિવારો (ઘરો)</span>
            <Home size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
            {totalHouses}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber-light)', marginTop: '4px' }}>
            સરેરાશ {avgFamilySize} સભ્યો/ઘર
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>કુલ વસ્તી (સભ્યો)</span>
            <Users size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
            {totalMembers}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            નોંધાયેલ કુલ સભ્યો
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>પુરુષ સંખ્યા</span>
            <span style={{ fontSize: '1.1rem' }}>👨</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#38BDF8', lineHeight: 1 }}>
            {totalMale}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {malePercent}% કુલ વસ્તી
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>સ્ત્રી સંખ્યા</span>
            <span style={{ fontSize: '1.1rem' }}>👩</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FB7185', lineHeight: 1 }}>
            {totalFemale}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {femalePercent}% કુલ વસ્તી
          </div>
        </div>
      </div>

      {/* Sex Ratio Bar Card */}
      <div className="glass-card" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>જાતિ ગુણોત્તર (Sex Ratio)</span>
          <span className="badge badge-emerald">દર ૧૦૦૦ પુરુષે {sexRatio} સ્ત્રીઓ</span>
        </div>

        <div style={{ width: '100%', height: '14px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${malePercent}%`, background: '#38BDF8', transition: 'width 0.5s ease' }} />
          <div style={{ width: `${femalePercent}%`, background: '#FB7185', transition: 'width 0.5s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          <span>👨 પુરુષ: <strong>{totalMale}</strong> ({malePercent}%)</span>
          <span>👩 સ્ત્રી: <strong>{totalFemale}</strong> ({femalePercent}%)</span>
        </div>
      </div>

      {/* Ataks Breakdown List */}
      {ataks.length > 0 && (
        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} color="#F59E0B" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
                અટક મુજબ વિભાજન ({ataks.length} અટક)
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>કુલ સભ્યો</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ataks.map((a, idx) => {
              const atakGu = a.atak?.gu || a.atak;
              const atakEn = a.atak?.en || '';
              const count = a.totalMembers || 0;
              const maxCount = ataks[0]?.totalMembers || 1;
              const barWidth = Math.round((count / maxCount) * 100);
              const kuldevi = a.kuldevi?.gu || '';

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginBottom: '3px' }}>
                    <div>
                      <strong style={{ color: '#FFF' }}>{atakGu}</strong>
                      {atakEn && <span style={{ color: 'var(--text-secondary)', marginLeft: '4px', fontSize: '0.72rem' }}>({atakEn})</span>}
                      {kuldevi && <span style={{ color: 'var(--accent-amber)', marginLeft: '6px', fontSize: '0.72rem' }}>• {kuldevi}</span>}
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#FFF' }}>{count}</strong> ({a.totalHouses} ઘરો)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #F59E0B, #FDE68A)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Age Groups Distribution */}
      {ageDistribution.length > 0 && (
        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <UserCheck size={16} color="#38BDF8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
              વયજૂથ વિતરણ (Age Distribution)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ageDistribution.map((item, idx) => {
              const label = item.range || item.label || 'અજાણ';
              const count = item.count || 0;
              const pct = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#FFF' }}>{count}</strong> ({pct}%) • 👨 {item.male || 0} | 👩 {item.female || 0}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #38BDF8, #818CF8)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Occupations Grid */}
      {topOccupations.length > 0 && (
        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Briefcase size={16} color="#A78BFA" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
              મુખ્ય વ્યવસાય અને રોજગાર
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {topOccupations.slice(0, 8).map((occ, idx) => {
              const title = occ._id || occ.name || 'અન્ય';
              if (title === '-' || title.includes('?')) return null;

              return (
                <div
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{title}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A78BFA' }}>{occ.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Cities Grid */}
      {topCities.length > 0 && (
        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <MapPin size={16} color="#10B981" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
              હાલનું રહેઠાણ વિતરણ (Cities)
            </h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {topCities.slice(0, 10).map((city, idx) => {
              const name = city._id || city.name || 'અન્ય';
              if (name === '-' || name.includes('?')) return null;

              return (
                <div
                  key={idx}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem'
                  }}
                >
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{name}</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>({city.count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Marital Status */}
      {maritalStatus.length > 0 && (
        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Heart size={16} color="#FB7185" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
              લગ્ન સ્થિતિ વિતરણ
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {maritalStatus.map((ms, idx) => {
              const label = ms._id || ms.key || 'અન્ય';
              if (label.includes('?')) return null;

              return (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(251, 113, 133, 0.08)',
                    border: '1px solid rgba(251, 113, 133, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#FFF', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FB7185' }}>{ms.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
