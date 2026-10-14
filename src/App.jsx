import React, { useState, useEffect, Component } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HierarchyView from './components/HierarchyView';
import DirectoryView from './components/DirectoryView';
import StatsView from './components/StatsView';
import MemberDetailModal from './components/MemberDetailModal';
import { villageApi } from './services/api';

// Error Boundary to prevent blank white screens
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-container" style={{ padding: '40px 20px' }}>
          <div className="empty-icon-wrap" style={{ borderColor: '#F43F5E', color: '#F43F5E' }}>
            ⚠️
          </div>
          <h3 style={{ color: '#FFF' }}>કંઈક ભૂલ આવી છે</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            પેજ લોડ કરવામાં ક્ષતિ થઈ છે. કૃપા કરીને ફરી પ્રયાસ કરો.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              marginTop: '12px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-amber)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            પેજ રિફ્રેશ કરો (Reload)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [villages, setVillages] = useState([]);
  const [currentVillage, setCurrentVillage] = useState(null);
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [selectedMember, setSelectedMember] = useState(null);
  const [targetFamily, setTargetFamily] = useState(null);
  const [loadingVillages, setLoadingVillages] = useState(true);

  // Load all villages on mount
  useEffect(() => {
    villageApi.getAll()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setVillages(list);

        // Check if previously chosen village in localStorage
        const savedVillageId = localStorage.getItem('nadoda_public_village_id');
        const found = list.find((v) => String(v._id) === savedVillageId || v.slug === savedVillageId);
        if (found) {
          setCurrentVillage(found);
        } else if (list.length > 0) {
          setCurrentVillage(list[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load villages:', err);
      })
      .finally(() => setLoadingVillages(false));
  }, []);

  const handleSelectVillage = (village) => {
    setCurrentVillage(village);
    setTargetFamily(null);
    if (village?._id) {
      localStorage.setItem('nadoda_public_village_id', String(village._id));
    }
  };

  const handleGoToFamily = (familyId) => {
    if (!familyId) return;
    setTargetFamily(familyId);
    setActiveTab('hierarchy');
    setSelectedMember(null);
  };

  return (
    <div className="app-container">
      {/* Mobile App Header */}
      <Header
        villages={villages}
        currentVillage={currentVillage}
        onSelectVillage={handleSelectVillage}
      />

      {/* Main Tab Views with Error Boundary */}
      <main className="main-content">
        <ErrorBoundary>
          {loadingVillages ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>ગામોની વિગત લોડ થઈ રહી છે...</span>
            </div>
          ) : (
            <>
              {activeTab === 'hierarchy' && (
                <HierarchyView
                  currentVillage={currentVillage}
                  targetFamily={targetFamily}
                  onClearTargetFamily={() => setTargetFamily(null)}
                  onSelectMember={setSelectedMember}
                />
              )}

              {activeTab === 'directory' && (
                <DirectoryView
                  currentVillage={currentVillage}
                  onSelectMember={setSelectedMember}
                />
              )}

              {activeTab === 'stats' && (
                <StatsView
                  currentVillage={currentVillage}
                />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'hierarchy') {
            setTargetFamily(null);
          }
        }}
      />

      {/* Member Details Bottom Sheet Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSelectMember={setSelectedMember}
          onGoToFamily={handleGoToFamily}
        />
      )}
    </div>
  );
}
