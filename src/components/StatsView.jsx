import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Home, UserCheck, Shield, GraduationCap, Briefcase, MapPin, Heart } from 'lucide-react';
import { villageApi } from '../services/api';

export default function StatsView({ currentVillage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentVillage) return;
    setLoading(true);

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
      .finally(() => setLoading(false));
  }, [currentVillage]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>આંકડાકીય માહિતી લોડ થઈ રહી છે...</span>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const breakdowns = stats?.breakdowns || {};

  const totalFamilies = overview.totalFamilies || 0;
  const totalPop = overview.totalPopulation || 0;
  const maleCount = overview.maleCount || 0;
  const femaleCount = overview.femaleCount || 0;
  const sexRatio = overview.sexRatio || (maleCount > 0 ? Math.round((femaleCount / maleCount) * 1000) : 0);
  const avgFamilySize = overview.avgFamilySize || (totalFamilies > 0 ? (totalPop / totalFamilies).toFixed(1) : 0);

  const malePercent = totalPop > 0 ? Math.round((maleCount / totalPop) * 100) : 50;
  const femalePercent = totalPop > 0 ? 100 - malePercent : 50;

  const ataks = breakdowns.ataks || [];
  const ageGroups = breakdowns.ageGroups || [];
  const educations = breakdowns.education || [];
  const occupations = breakdowns.occupations || [];
  const cities = breakdowns.topCities || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} color="#F59E0B" />
          <span>સમાજ ગણતરી અને આંકડા (Statistics)</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          ગામ: {currentVillage?.name?.gu || currentVillage?.name || 'બધા ગામ'}
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>કુલ કુટુંબો</span>
            <Home size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
            {totalFamilies}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber-light)', marginTop: '4px' }}>
            સરેરાશ {avgFamilySize} સભ્યો/ઘર
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>કુલ વસ્તી</span>
            <Users size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
            {totalPop}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            નોંધાયેલ સભ્યો
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>પુરુષ સંખ્યા</span>
            <span style={{ fontSize: '1.1rem' }}>👨</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38BDF8', lineHeight: 1 }}>
            {maleCount}
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
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FB7185', lineHeight: 1 }}>
            {femaleCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {femalePercent}% કુલ વસ્તી
          </div>
        </div>
      </div>

      {/* Gender Ratio Bar */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>જાતિ ગુણોત્તર (Sex Ratio)</span>
          <span className="badge badge-emerald">દર ૧૦૦૦ પુરુષે {sexRatio} સ્ત્રીઓ</span>
        </div>

        <div style={{ width: '100%', height: '14px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${malePercent}%`, background: '#38BDF8', transition: 'width 0.5s ease' }} />
          <div style={{ width: `${femalePercent}%`, background: '#FB7185', transition: 'width 0.5s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          <span>👨 પુરુષ: {maleCount} ({malePercent}%)</span>
          <span>👩 સ્ત્રી: {femaleCount} ({femalePercent}%)</span>
        </div>
      </div>

      {/* Age Groups Breakdown */}
      {ageGroups.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={16} color="#F59E0B" />
            <span>વયજૂથ મુજબ વસ્તી (Age Distribution)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ageGroups.map((ag) => {
              const label = ag.group || ag.label || ag._id || 'અજાણ';
              const count = ag.count || 0;
              const pct = totalPop > 0 ? Math.round((count / totalPop) * 100) : 0;

              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#FFF' }}>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
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

      {/* Top Ataks Breakdown */}
      {ataks.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} color="#F59E0B" />
            <span>મુખ્ય અટક વિશ્લેષણ (Top Ataks)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ataks.slice(0, 8).map((a) => {
              const atakName = a._id || a.atak || 'અન્ય';
              const count = a.count || 0;
              const maxAtakCount = ataks[0]?.count || 1;
              const barWidth = Math.round((count / maxAtakCount) * 100);

              return (
                <div key={atakName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{atakName}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#FFF' }}>{count}</strong> સભ્યો
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #10B981, #A7F3D0)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Occupations */}
      {occupations.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={16} color="#A78BFA" />
            <span>મુખ્ય વ્યવસાય (Professions)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {occupations.slice(0, 6).map((occ) => {
              const name = occ._id || occ.name || 'અન્ય';
              if (name === '-' || name === '????') return null;

              return (
                <div
                  key={name}
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{name}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A78BFA' }}>{occ.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Cities / Residence */}
      {cities.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="#38BDF8" />
            <span>હાલનું વસવાટ સ્થળ (Residence Distribution)</span>
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cities.slice(0, 8).map((city) => {
              const name = city._id || city.name || 'અન્ય';
              if (name === '-' || name.includes('?')) return null;

              return (
                <div
                  key={name}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem'
                  }}
                >
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{name}</span>
                  <span style={{ color: '#38BDF8', fontWeight: 700 }}>({city.count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
