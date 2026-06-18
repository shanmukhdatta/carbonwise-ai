import React, { useContext } from 'react';
import { Home, ClipboardList, Zap, ShieldCheck, User, BookOpen } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';
import { UserContext } from '../../contexts/UserContext';

const Sidebar = () => {
  const { currentView, setCurrentView } = useContext(AppContext);
  const { persona, sustainabilityScore } = useContext(UserContext);

  const navItems = [
    { id: 'dashboard', label: 'Carbon Dashboard', icon: Home, desc: 'Overview & Analytics' },
    { id: 'tracker', label: 'Activity Tracker', icon: ClipboardList, desc: 'Log Footprint Inputs' },
    { id: 'actions', label: 'Reduction Coach', icon: Zap, desc: 'AI Coaching & Simulator' },
    { id: 'learn', label: 'Eco Academy', icon: BookOpen, desc: 'Micro-Lessons & News' },
    { id: 'community', label: 'Eco Community', icon: ShieldCheck, desc: 'Badges & Leaderboard' },
    { id: 'profile', label: 'Settings & Profile', icon: User, desc: 'Adjust Preferences' }
  ];

  if (currentView === 'onboarding') return null;

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: '64px',
        width: '260px',
        height: 'calc(100vh - 64px)',
        backgroundColor: 'var(--white)',
        borderRight: '1px solid var(--gray-100)',
        padding: 'var(--space-6) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 90
      }}
      className="sidebar-desktop"
    >
      {/* Upper Navigation List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                width: '100%',
                background: isActive ? 'var(--primary-50)' : 'none',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s var(--ease-standard)',
                borderLeft: isActive ? '3px solid var(--primary-600)' : '3px solid transparent'
              }}
            >
              <div
                style={{
                  color: isActive ? 'var(--primary-700)' : 'var(--gray-500)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: isActive ? 'var(--primary-900)' : 'var(--gray-700)'
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Profile Box */}
      <div
        style={{
          borderTop: '1px solid var(--gray-100)',
          paddingTop: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--primary-800)',
              border: '1px solid var(--primary-200)'
            }}
          >
            {persona.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-800)' }}>
              {persona}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
              Eco Score: {sustainabilityScore}/100
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
