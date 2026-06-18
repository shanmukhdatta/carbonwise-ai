import React, { useContext } from 'react';
import { AppProvider, AppContext } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';
import { CarbonProvider } from './contexts/CarbonContext';

import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';

import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import TrackerPage from './pages/TrackerPage';
import ActionsPage from './pages/ActionsPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import LearnPage from './pages/LearnPage';

import { X } from 'lucide-react';

const MainAppContent = () => {
  const { currentView, toasts, removeToast } = useContext(AppContext);

  // View routing switcher
  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <OnboardingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'tracker':
        return <TrackerPage />;
      case 'actions':
        return <ActionsPage />;
      case 'community':
        return <CommunityPage />;
      case 'profile':
        return <ProfilePage />;
      case 'learn':
        return <LearnPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (currentView === 'onboarding') {
    return <OnboardingPage />;
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <Navbar />

      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Toast Notification Stack Overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor:
                toast.type === 'success'
                  ? 'var(--primary-700)'
                  : toast.type === 'error'
                  ? 'var(--danger)'
                  : toast.type === 'warning'
                  ? 'var(--warning)'
                  : 'var(--gray-800)',
              color: 'var(--white)',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              pointerEvents: 'auto',
              minWidth: '240px',
              maxWidth: '350px',
              animation: 'slideUp 0.3s var(--ease-out-back)'
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.8,
                display: 'flex',
                padding: '2px'
              }}
              aria-label="Dismiss toast notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <UserProvider>
        <CarbonProvider>
          <MainAppContent />
        </CarbonProvider>
      </UserProvider>
    </AppProvider>
  );
}

export default App;
