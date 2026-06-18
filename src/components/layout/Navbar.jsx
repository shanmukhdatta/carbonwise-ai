import React, { useContext, useState } from 'react';
import { Bell, Flame, Check } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';
import { UserContext } from '../../contexts/UserContext';
import Button from '../common/Button';

const Navbar = () => {
  const { alerts, markAlertAsRead, setCurrentView } = useContext(AppContext);
  const { streak } = useContext(UserContext);
  const [showNotificationTray, setShowNotificationTray] = useState(false);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid var(--gray-100)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Brand Logo */}
      <div
        onClick={() => setCurrentView('dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '24px' }}>🌱</span>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '20px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, var(--primary-800), var(--primary-500))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.01em'
          }}
        >
          CarbonWise AI
        </span>
      </div>

      {/* Quick Metrics & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Streak Counter */}
        <div
          onClick={() => setCurrentView('community')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            backgroundColor: 'hsl(14, 100%, 96%)',
            color: 'hsl(14, 100%, 50%)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            border: '1px solid hsl(14, 100%, 90%)'
          }}
          title="Daily sustainability action streak"
        >
          <Flame size={16} fill="currentColor" />
          <span>{streak} Day Streak</span>
        </div>

        {/* Alerts Notification Bell */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="ghost"
            onClick={() => setShowNotificationTray(!showNotificationTray)}
            ariaLabel="Toggle alerts tray"
            style={{
              padding: 0,
              minWidth: '40px',
              minHeight: '40px',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--gray-50)',
              position: 'relative'
            }}
          >
            <Bell size={20} color="var(--primary-900)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'var(--danger)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%'
                }}
              />
            )}
          </Button>

          {/* Alerts Dropdown Drawer */}
          {showNotificationTray && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: 'var(--space-3)',
                zIndex: 200,
                border: '1px solid var(--gray-100)',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-3)',
                  paddingBottom: 'var(--space-2)',
                  borderBottom: '1px solid var(--gray-100)'
                }}
              >
                <h4 style={{ fontSize: '14px', margin: 0 }}>Environmental Alerts</h4>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--danger)',
                      fontWeight: '700',
                      backgroundColor: 'hsl(0, 100%, 96%)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {unreadCount} New
                  </span>
                )}
              </div>

              {alerts.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--gray-400)', textAlign: 'center', padding: 'var(--space-4)' }}>
                  No active alerts
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: alert.read ? 'var(--white)' : 'var(--primary-50)',
                        border: '1px solid var(--gray-100)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: alert.type === 'warning' ? 'var(--danger)' : 'var(--primary-800)'
                          }}
                        >
                          {alert.title}
                        </span>
                        {!alert.read && (
                          <button
                            onClick={() => markAlertAsRead(alert.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--primary-500)',
                              cursor: 'pointer',
                              display: 'flex',
                              padding: '2px'
                            }}
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>
                        {alert.message}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--gray-400)', alignSelf: 'flex-end', marginTop: '2px' }}>
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
