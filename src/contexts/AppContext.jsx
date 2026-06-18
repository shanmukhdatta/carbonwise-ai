import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState(() => {
    // If user has not onboarded, default to onboarding, else dashboard
    const onboarded = localStorage.getItem('carbonwise_onboarded');
    return onboarded === 'true' ? 'dashboard' : 'onboarding';
  });

  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Transport Emission Peak',
      message: 'Your transport emissions are up 28% this week. Consider walking or carpooling tomorrow!',
      type: 'warning',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      read: false
    },
    {
      id: 2,
      title: 'New Eco Challenge Available',
      message: 'Join the "No-Car Weekend" challenge and earn a Conscious Commuter badge!',
      type: 'info',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
      read: false
    }
  ]);

  // Accessibility Settings
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('carbonwise_high_contrast') === 'true';
  });
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem('carbonwise_large_text') === 'true';
  });

  // API Keys for Live Bridge Mode
  const [apiKeys, setApiKeys] = useState(() => {
    const keys = localStorage.getItem('carbonwise_api_keys');
    return keys ? JSON.parse(keys) : { gemini: '', maps: '', speech: '', vision: '' };
  });

  // Apply Accessibility Classes to Body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('accessibility-high-contrast');
    } else {
      document.body.classList.remove('accessibility-high-contrast');
    }
    localStorage.setItem('carbonwise_high_contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    if (largeText) {
      document.body.classList.add('accessibility-large-text');
    } else {
      document.body.classList.remove('accessibility-large-text');
    }
    localStorage.setItem('carbonwise_large_text', largeText);
  }, [largeText]);

  // Save API keys
  const saveApiKeys = (keys) => {
    setApiKeys(keys);
    localStorage.setItem('carbonwise_api_keys', JSON.stringify(keys));
    showToast('Settings saved successfully!', 'success');
  };

  // Toast Helpers
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Alert Helpers
  const markAlertAsRead = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  };

  const addAlert = (title, message, type = 'info') => {
    const newAlert = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setAlerts((prev) => [newAlert, ...prev]);
    showToast(`New alert: ${title}`, type);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        toasts,
        showToast,
        removeToast,
        alerts,
        addAlert,
        markAlertAsRead,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        apiKeys,
        saveApiKeys
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
