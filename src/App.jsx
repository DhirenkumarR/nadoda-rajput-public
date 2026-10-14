import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HierarchyView from './components/HierarchyView';
import DirectoryView from './components/DirectoryView';
import StatsView from './components/StatsView';
import MemberDetailModal from './components/MemberDetailModal';
import { villageApi } from './services/api';

export default function App() {
  const [villages, setVillages] = useState([]);
  const [currentVillage, setCurrentVillage] = useState(null);
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingVillages, setLoadingVillages] = useState(true);

  // Load all villages on mount
  useEffect(() => {
    villageApi.getAll()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
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
    if (village?._id) {
      localStorage.setItem('nadoda_public_village_id', String(village._id));
    }
  };

  return (
    <div className="app-container">
      {/* Mobile App Header */}
      <Header
        villages={villages}
        currentVillage={currentVillage}
        onSelectVillage={handleSelectVillage}
      />

      {/* Main Tab Views */}
      <main className="main-content">
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
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Member Details Bottom Sheet Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSelectMember={setSelectedMember}
        />
      )}
    </div>
  );
}
