import React, { useContext } from 'react';
import { Home, ClipboardList, Zap, ShieldCheck, User } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';

const BottomNav = () => {
  const { currentView, setCurrentView } = useContext(AppContext);

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'tracker', label: 'Track', icon: ClipboardList },
    { id: 'actions', label: 'Reduce', icon: Zap },
    { id: 'community', label: 'Social', icon: ShieldCheck },
    { id: 'profile', label: 'Me', icon: User }
  ];

  if (currentView === 'onboarding') return null;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '64px',
        backgroundColor: 'var(--white)',
        borderTop: '1px solid var(--gray-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
        zIndex: 99
      }}
      className="bottom-nav-mobile"
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20%',
              height: '100%',
              color: isActive ? 'var(--primary-700)' : 'var(--gray-400)',
              cursor: 'pointer',
              gap: '4px',
              transition: 'color 0.2s var(--ease-standard)'
            }}
          >
            <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '11px', fontWeight: isActive ? '700' : '500' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
