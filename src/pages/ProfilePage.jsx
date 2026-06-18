import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { CarbonContext } from '../contexts/CarbonContext';
import { AppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Shield, Key, Eye, EyeOff, FileDown, RotateCcw } from 'lucide-react';

const ProfilePage = () => {
  const { profile, updateProfile, persona, setOnboarded } = useContext(UserContext);
  const { carbonBudget, setCarbonBudget, activities, clearHistory } = useContext(CarbonContext);
  const { 
    highContrast, setHighContrast, 
    largeText, setLargeText, 
    apiKeys, saveApiKeys, 
    showToast, setCurrentView 
  } = useContext(AppContext);

  // Profile Form state
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [houseSize, setHouseSize] = useState(profile.householdSize);
  const [budgetVal, setBudgetVal] = useState(carbonBudget);

  // Key configurations form states
  const [keys, setKeys] = useState(apiKeys);
  const [showKeys, setShowKeys] = useState({ gemini: false, maps: false, speech: false, vision: false });

  // Update profile handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      ...profile,
      name,
      location,
      householdSize: parseInt(houseSize, 10) || 1
    });
    setCarbonBudget(parseFloat(budgetVal) || 22.0);
    showToast('Profile and carbon target parameters updated successfully!', 'success');
  };

  // Save keys handler
  const handleSaveKeys = (e) => {
    e.preventDefault();
    saveApiKeys(keys);
  };

  const toggleKeyVisibility = (field) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyChange = (field, val) => {
    setKeys((prev) => ({ ...prev, [field]: val }));
  };

  // Export data as JSON file for GDPR compliance
  const handleExportData = () => {
    const dataToExport = {
      profile,
      carbonBudget,
      activitiesHistory: activities,
      exportTimestamp: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CarbonWise_AI_Data_${profile.name || 'User'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('GDPR Data Exported successfully!', 'success');
  };

  // Hard Reset database
  const handleWipeData = () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to clear your local database and history? This cannot be undone.')) {
      clearHistory();
      localStorage.clear();
      setOnboarded(false);
      setCurrentView('onboarding');
      showToast('Local database wiped. Restarting assessment onboarding...', 'info');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--primary-900)' }}>Settings & Profile 👤</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '2px' }}>
          Configure API credentials, tweak accessibility modes, and download or manage your personal logs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* User profile details settings */}
        <Card title="Lifestyle Profile" subtitle="Tweak your geographic and carbon settings">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Screen Name</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="profile-loc">Residence Location</label>
              <input
                id="profile-loc"
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-house">Household Size</label>
              <input
                id="profile-house"
                type="number"
                min="1"
                className="form-input"
                value={houseSize}
                onChange={(e) => setHouseSize(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-budget">Daily Carbon Target Budget (kg)</label>
              <input
                id="profile-budget"
                type="number"
                step="0.5"
                min="5"
                className="form-input"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
              />
            </div>

            <Button type="submit" style={{ alignSelf: 'flex-end', marginTop: '4px' }}>
              Save Profile changes
            </Button>
          </form>
        </Card>

        {/* Live Bridge API credentials setup */}
        <Card title="Google Services Bridge" subtitle="Add your own API credentials to unlock live AI and Maps pipelines">
          <form onSubmit={handleSaveKeys} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { id: 'gemini', label: 'Gemini AI API Key' },
              { id: 'maps', label: 'Google Maps API Key' },
              { id: 'speech', label: 'Speech-to-Text API Key' },
              { id: 'vision', label: 'Cloud Vision OCR API Key' }
            ].map((field) => (
              <div key={field.id} className="form-group">
                <label className="form-label" htmlFor={`key-${field.id}`}>{field.label}</label>
                <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
                  <input
                    id={`key-${field.id}`}
                    type={showKeys[field.id] ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                    placeholder="Enter Google API Key"
                    value={keys[field.id]}
                    onChange={(e) => handleKeyChange(field.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(field.id)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--gray-400)'
                    }}
                    aria-label={`Toggle key display`}
                  >
                    {showKeys[field.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            <Button type="submit" style={{ alignSelf: 'flex-end', display: 'flex', gap: '6px' }}>
              <Key size={16} /> Update API Keys
            </Button>
          </form>
        </Card>
      </div>

      {/* Row 2: Accessibility Panel & GDPR Privacy logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Accessibility Panel Toggles */}
        <Card title="Accessibility Dashboard" subtitle="Configure visibility overrides to meet WCAG AA requirements">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            
            {/* High Contrast */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gray-800)' }}>High-Contrast Theme</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Amplifies contrast ratios for readability</div>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                style={{
                  width: '50px',
                  height: '26px',
                  borderRadius: '13px',
                  backgroundColor: highContrast ? 'var(--primary-600)' : 'var(--gray-200)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s ease'
                }}
                aria-pressed={highContrast}
                aria-label="Toggle high contrast"
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--white)',
                    position: 'absolute',
                    top: '3px',
                    left: highContrast ? '27px' : '3px',
                    transition: 'left 0.2s ease'
                  }}
                />
              </button>
            </div>

            {/* Large Text zoom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gray-800)' }}>Magnified Scale Text</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Scale fonts to 112.5% for visual aid</div>
              </div>
              <button
                onClick={() => setLargeText(!largeText)}
                style={{
                  width: '50px',
                  height: '26px',
                  borderRadius: '13px',
                  backgroundColor: largeText ? 'var(--primary-600)' : 'var(--gray-200)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s ease'
                }}
                aria-pressed={largeText}
                aria-label="Toggle large text"
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--white)',
                    position: 'absolute',
                    top: '3px',
                    left: largeText ? '27px' : '3px',
                    transition: 'left 0.2s ease'
                  }}
                />
              </button>
            </div>

          </div>
        </Card>

        {/* GDPR Privacy & Wipes */}
        <Card title="GDPR Data Center" subtitle="Wipe your local database or export details into JSON logs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: '1.5' }}>
              CarbonWise AI stores all records locally on your device. We do not transmit profile information to external databases unless live API keys are added.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Button 
                variant="secondary" 
                onClick={handleExportData} 
                style={{ flex: 1, display: 'flex', gap: '6px', fontSize: '13px' }}
              >
                <FileDown size={16} /> Export JSON
              </Button>
              <Button 
                variant="danger" 
                onClick={handleWipeData} 
                style={{ flex: 1, display: 'flex', gap: '6px', fontSize: '13px' }}
              >
                <RotateCcw size={16} /> Wipe Database
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default ProfilePage;
