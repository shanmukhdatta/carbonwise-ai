import React, { useState, useContext } from 'react';
import { CarbonContext } from '../contexts/CarbonContext';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { parseNaturalLanguage } from '../services/speechService';
import { scanReceipt } from '../services/ocrService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  Mic, Camera, Plus, Trash2, ClipboardList, 
  Sparkles, ListCollapse, Volume2, ShieldCheck 
} from 'lucide-react';

const TrackerPage = () => {
  const { activities, addActivity, deleteActivity } = useContext(CarbonContext);
  const { updateGoalProgress, unlockAchievement } = useContext(UserContext);
  const { showToast, apiKeys } = useContext(AppContext);

  const [activeLogTab, setActiveLogTab] = useState('nlp'); // nlp, manual, ocr, voice
  const [filterCategory, setFilterCategory] = useState('all');

  // NL text input state
  const [nlpText, setNlpText] = useState('');
  const [parsing, setParsing] = useState(false);

  // Manual form state
  const [manualForm, setManualForm] = useState({
    category: 'transport',
    type: 'gas_car',
    value: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Voice log state
  const [recording, setRecording] = useState(false);
  const [voicePresets, setVoicePresets] = useState([
    'I drove 25 kilometers in a gasoline car',
    'I ate a vegetarian meal for lunch',
    'I sorted two bags of recycling'
  ]);
  const [transcribedText, setTranscribedText] = useState('');

  // OCR state
  const [ocrTypePreset, setOcrTypePreset] = useState('electricity');
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Manual Form sub-type configs
  const subTypesMap = {
    transport: [
      { id: 'gas_car', label: 'Gasoline Car (km)' },
      { id: 'hybrid_car', label: 'Hybrid Car (km)' },
      { id: 'electric_car', label: 'Electric Vehicle (km)' },
      { id: 'bus', label: 'Public Bus (km)' },
      { id: 'train', label: 'Train / Metro (km)' }
    ],
    food: [
      { id: 'red_meat', label: 'Red Meat Meal (Qty)' },
      { id: 'poultry_fish', label: 'Poultry / Fish Meal (Qty)' },
      { id: 'vegetarian', label: 'Vegetarian Meal (Qty)' },
      { id: 'vegan', label: 'Vegan Meal (Qty)' }
    ],
    energy: [
      { id: 'electricity', label: 'Electricity Usage (kWh)' },
      { id: 'gas', label: 'Natural Gas Usage (m³)' },
      { id: 'water', label: 'Water Usage (Liters)' }
    ],
    shopping: [
      { id: 'grocery', label: 'Groceries (Purchases)' },
      { id: 'clothing', label: 'Clothing (Items)' },
      { id: 'electronics', label: 'Electronics (Items)' },
      { id: 'misc', label: 'Other/Misc Purchases' }
    ],
    waste: [
      { id: 'landfill', label: 'Landfill Trash (Bags)' },
      { id: 'recycled', label: 'Recycling (Bags)' },
      { id: 'composted', label: 'Composting (Bags)' }
    ]
  };

  // Categories helper icons
  const categoryIcons = {
    transport: '🚗',
    food: '🥗',
    energy: '⚡',
    shopping: '🛒',
    waste: '♻️'
  };

  // Submit Natural Language text
  const handleNlpSubmit = (e) => {
    e.preventDefault();
    if (!nlpText.trim()) return;

    setParsing(true);
    setTimeout(() => {
      const parsed = parseNaturalLanguage(nlpText);
      const added = addActivity(parsed.category, parsed.type, parsed.value, parsed.unit, parsed.description);
      
      if (added) {
        showToast(`Logged activity: ${parsed.description} (${added.co2e} kg CO2e)`, 'success');
        updateGoalProgress(parsed.category, parsed.value);
        unlockAchievement('first_log');
        setNlpText('');
      } else {
        showToast('Could not parse activity. Try describing distance or meals.', 'error');
      }
      setParsing(false);
    }, 700);
  };

  // Submit Manual Entry Form
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const { category, type, value, description, date } = manualForm;
    if (!value || parseFloat(value) <= 0) {
      showToast('Please enter a valid numeric value', 'warning');
      return;
    }

    const unit = category === 'transport' ? 'km' : category === 'food' ? 'meal' : category === 'energy' ? (type === 'electricity' ? 'kWh' : 'L') : 'items';
    const cleanDesc = description.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)}: ${type.replace('_', ' ')}`;
    
    const added = addActivity(category, type, parseFloat(value), unit, cleanDesc, date);
    if (added) {
      showToast(`Logged activity manually: ${cleanDesc}`, 'success');
      updateGoalProgress(category, parseFloat(value));
      unlockAchievement('first_log');
      
      // Reset form
      setManualForm({
        category: 'transport',
        type: 'gas_car',
        value: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Trigger Mock OCR Scan
  const handleOcrScan = async () => {
    setOcrScanning(true);
    setOcrResult(null);
    try {
      const res = await scanReceipt(null, ocrTypePreset, apiKeys.vision);
      setOcrResult(res);
      
      const added = addActivity(res.category, res.type, res.value, res.unit, res.description, res.date);
      if (added) {
        showToast(`OCR Parsed: Logged ${res.value} ${res.unit} in ${res.category}`, 'success');
        updateGoalProgress(res.category, res.value);
        unlockAchievement('clean_bill');
      }
    } catch (e) {
      showToast('OCR scanning failed', 'error');
    } finally {
      setOcrScanning(false);
    }
  };

  // Simulate Voice logging
  const handleVoiceTrigger = (phrase) => {
    setRecording(true);
    setTranscribedText('');
    
    setTimeout(() => {
      setTranscribedText(phrase);
      setRecording(false);
      
      setTimeout(() => {
        const parsed = parseNaturalLanguage(phrase);
        const added = addActivity(parsed.category, parsed.type, parsed.value, parsed.unit, parsed.description);
        
        if (added) {
          showToast(`Voice logged: ${phrase}`, 'success');
          updateGoalProgress(parsed.category, parsed.value);
        }
      }, 500);
    }, 1500);
  };

  const filteredActivities = activities.filter((act) => {
    if (filterCategory === 'all') return true;
    return act.category === filterCategory;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--primary-900)' }}>Log Your Activities 📊</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '2px' }}>
          Select your input style to update your daily footprint: type naturally, scan bills, or log manually.
        </p>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-100)', gap: '16px' }}>
        {[
          { id: 'nlp', label: 'Smart Text Log', icon: Sparkles },
          { id: 'voice', label: 'Voice Command', icon: Mic },
          { id: 'ocr', label: 'OCR Bill Scanner', icon: Camera },
          { id: 'manual', label: 'Detailed Manual Form', icon: ClipboardList }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeLogTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveLogTab(tab.id);
                setOcrResult(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 'var(--space-3) 0',
                borderBottom: isActive ? '3px solid var(--primary-600)' : '3px solid transparent',
                color: isActive ? 'var(--primary-700)' : 'var(--gray-500)',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Log Method Content wrappers */}
      <div style={{ minHeight: '220px' }}>
        {activeLogTab === 'nlp' && (
          <div className="animate-slide-up">
            <Card title="Natural Language Logger" subtitle="Gemini NLP scans text sentences automatically to extract carbon metrics">
              <form onSubmit={handleNlpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="e.g. I drove 25 kilometers in a gasoline car today, then had a vegetarian salad for dinner"
                  value={nlpText}
                  onChange={(e) => setNlpText(e.target.value)}
                  disabled={parsing}
                />
                <Button 
                  type="submit" 
                  disabled={parsing || !nlpText.trim()} 
                  style={{ alignSelf: 'flex-end' }}
                >
                  {parsing ? 'Parsing Carbon Metrics...' : 'Log Activity'}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {activeLogTab === 'voice' && (
          <div className="animate-slide-up">
            <Card title="Voice Log Simulation" subtitle="Simulates speech-to-text logging through local audio commands">
              {recording ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', gap: '8px' }}>
                  <div className="animate-pulse-glow" style={{ display: 'flex', gap: '4px', height: '40px', alignItems: 'center' }}>
                    {[...Array(6)].map((_, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: '4px',
                          height: '24px',
                          backgroundColor: 'var(--primary-500)',
                          borderRadius: '2px',
                          animation: `slideUp ${0.3 + idx * 0.1}s ease-in-out infinite alternate`
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--primary-700)', fontWeight: '700' }}>Recording Audio...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                    Tap a voice preset below to simulate speaking into your microphone:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {voicePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleVoiceTrigger(preset)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--gray-100)',
                          backgroundColor: 'var(--off-white)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        <Volume2 size={16} color="var(--primary-600)" />
                        "{preset}"
                      </button>
                    ))}
                  </div>

                  {transcribedText && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: '700' }}>TRANSCRIBED TEXT</div>
                      <p style={{ fontSize: '13px', fontWeight: '700', margin: '4px 0 0' }}>"{transcribedText}"</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeLogTab === 'ocr' && (
          <div className="animate-slide-up">
            <Card title="OCR Document / Receipt Scanner" subtitle="Simulates Cloud Vision scanning items from electric invoices or fuel stubs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="ocr-preset">Select Sample Invoice to Scan</label>
                  <select
                    id="ocr-preset"
                    className="form-input"
                    value={ocrTypePreset}
                    onChange={(e) => setOcrTypePreset(e.target.value)}
                  >
                    <option value="electricity">⚡ Electric Utility Bill (280 kWh, Spark Power)</option>
                    <option value="gasoline">🚗 Gasoline Station Receipt ($62.40 Fuel Fill-up)</option>
                    <option value="grocery">🛒 Organic Store Grocery Ticket ($114.20, Whole Foods)</option>
                  </select>
                </div>

                <Button 
                  onClick={handleOcrScan} 
                  disabled={ocrScanning} 
                  style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px' }}
                >
                  <Camera size={18} />
                  {ocrScanning ? 'Uploading & Scanning OCR...' : 'Simulate OCR Scanner'}
                </Button>

                {ocrResult && (
                  <div style={{ padding: '14px', border: '1px dashed var(--primary-500)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--primary-800)' }}>
                      <ShieldCheck size={16} /> OCR Extraction Success!
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px', fontSize: '12px' }}>
                      <div><strong>Invoice Name:</strong> {ocrResult.description.split(':')[1]?.trim() || ocrResult.description}</div>
                      <div><strong>Total Value:</strong> {ocrResult.value} {ocrResult.unit}</div>
                      <div><strong>Amount Paid:</strong> ${ocrResult.amountSpent.toFixed(2)}</div>
                      <div><strong>Carbon Logged:</strong> {activities[0]?.co2e} kg CO2e</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeLogTab === 'manual' && (
          <div className="animate-slide-up">
            <Card title="Traditional Manual Logging" subtitle="Explicit categorization entries with unit values">
              <form onSubmit={handleManualSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="manual-cat">Category</label>
                  <select
                    id="manual-cat"
                    className="form-input"
                    value={manualForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setManualForm((prev) => ({
                        ...prev,
                        category: cat,
                        type: subTypesMap[cat][0].id
                      }));
                    }}
                  >
                    <option value="transport">Transport</option>
                    <option value="food">Diet & Meal</option>
                    <option value="energy">Home Utilities</option>
                    <option value="shopping">Shopping</option>
                    <option value="waste">Waste Management</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="manual-type">Specific Action Type</label>
                  <select
                    id="manual-type"
                    className="form-input"
                    value={manualForm.type}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    {subTypesMap[manualForm.category].map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="manual-val">Quantity Value</label>
                  <input
                    id="manual-val"
                    className="form-input"
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={manualForm.value}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, value: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="manual-desc">Description (Optional)</label>
                  <input
                    id="manual-desc"
                    className="form-input"
                    type="text"
                    placeholder="e.g. Commute to town hall"
                    value={manualForm.description}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <Button type="submit" style={{ minWidth: '140px' }}>Log Activity</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>

      {/* Grid: Historical list logs */}
      <Card title="Activity History Logs" subtitle="Review or edit your past emission entries">
        {/* Category Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'transport', label: 'Transport' },
            { id: 'food', label: 'Food' },
            { id: 'energy', label: 'Energy' },
            { id: 'shopping', label: 'Shopping' },
            { id: 'waste', label: 'Waste' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterCategory(btn.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: filterCategory === btn.id ? 'var(--primary-700)' : 'var(--gray-50)',
                color: filterCategory === btn.id ? 'var(--white)' : 'var(--gray-600)',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* History Table/List */}
        {filteredActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
            <ClipboardList size={40} style={{ opacity: 0.3 }} />
            <p style={{ marginTop: '8px', fontSize: '13px' }}>No logged entries in this filter category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredActivities.slice(0, 10).map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px', width: '32px', textAlign: 'center' }}>
                    {categoryIcons[act.category]}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)' }}>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>
                      {act.date} &bull; {act.value} {act.unit}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-800)', fontFamily: "'Outfit'" }}>
                    {act.co2e.toFixed(1)} kg CO2e
                  </span>
                  <button
                    onClick={() => {
                      deleteActivity(act.id);
                      showToast('Activity log deleted', 'info');
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--gray-300)',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                      padding: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-300)'}
                    aria-label="Delete log entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TrackerPage;
