import React from 'react';
import { GitFork, Users, BarChart3 } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: 'hierarchy',
      labelGu: 'વંશાવળી',
      labelEn: 'Hierarchy',
      icon: GitFork
    },
    {
      id: 'directory',
      labelGu: 'ડિરેક્ટરી',
      labelEn: 'Directory',
      icon: Users
    },
    {
      id: 'stats',
      labelGu: 'આંકડાશાસ્ત્ર',
      labelEn: 'Stats',
      icon: BarChart3
    }
  ];

  return (
    <nav className="bottom-nav" aria-label="મુખ્ય નેવિગેશન">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              // Trigger slight vibration on mobile devices if supported
              if (window.navigator?.vibrate) {
                window.navigator.vibrate(12);
              }
            }}
          >
            {isActive && <div className="nav-active-bar" />}
            <div className="nav-icon-container">
              <IconComponent size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span>{tab.labelGu}</span>
          </button>
        );
      })}
    </nav>
  );
}
