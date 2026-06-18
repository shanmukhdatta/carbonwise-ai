import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { CarbonContext } from '../contexts/CarbonContext';
import { AppContext } from '../contexts/AppContext';
import { askGeminiCoach } from '../services/geminiService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Zap, HelpCircle, Send, MessageSquare, Plus, Check } from 'lucide-react';

const ActionsPage = () => {
  const { profile, streak, incrementStreak, unlockAchievement } = useContext(UserContext);
  const { carbonBudget, getTodayEmissions } = useContext(CarbonContext);
  const { showToast, apiKeys } = useContext(AppContext);

  // Sub-views tabs: twin, coach, recommendations
  const [activeActionsSubTab, setActiveActionsSubTab] = useState('twin');

  // What-If Sliders State
  const [whatIfWeeklyKm, setWhatIfWeeklyKm] = useState(profile.weeklyKm);
  const [whatIfDiet, setWhatIfDiet] = useState(profile.dietType);
  const [whatIfEnergyPct, setWhatIfEnergyPct] = useState(100); // 100% is current, can drop to 60%

  // Conversational Chat Coach state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      text: `Hello ${profile.name || 'friend'}! 🌿 I am your CarbonWise AI Coach. Ask me how to optimize your habits, reduce your bills, or interpret your carbon charts!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [coachTyping, setCoachTyping] = useState(false);

  // Task Lists checklist
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Unplug stand-by screens (phantom load)', category: 'energy', period: 'today', done: false, co2e: 0.8 },
    { id: 't2', text: 'Opt for a meatless lunch today', category: 'food', period: 'today', done: false, co2e: 3.0 },
    { id: 't3', text: 'Walk or bike for short trips under 3km', category: 'transport', period: 'week', done: false, co2e: 5.4 },
    { id: 't4', text: 'Lower AC temperature by 1 degree Celsius', category: 'energy', period: 'week', done: false, co2e: 4.2 },
    { id: 't5', text: 'Recycle all cardboard and paper packaging', category: 'waste', period: 'week', done: false, co2e: 1.5 },
    { id: 't6', text: 'Perform a home light-bulb audit & install LEDs', category: 'energy', period: 'month', done: false, co2e: 18.0 }
  ]);

  // WHAT-IF CALCULATIONS (Baseline vs Twin target)
  const baselineWeeklyCarbon = useMemo(() => {
    // Approx baseline carbon for this user profile based on original values
    const transportFactor = profile.transportMode === 'gas_car' ? 0.22 : profile.transportMode === 'hybrid_car' ? 0.12 : 0.05;
    const transportCo2 = profile.weeklyKm * transportFactor;
    
    const dietFactor = profile.dietType === 'omnivore' ? 3.5 * 14 : profile.dietType === 'poultry_fish' ? 1.2 * 14 : 0.5 * 14;
    const dietCo2 = dietFactor; // 14 meals weekly mock
    
    const energyCo2 = (profile.energyBill * 0.38) * 0.25; // per week approx
    return parseFloat((transportCo2 + dietCo2 + energyCo2).toFixed(1));
  }, [profile]);

  const simulatedTwinWeeklyCarbon = useMemo(() => {
    const transportFactor = profile.transportMode === 'gas_car' ? 0.22 : profile.transportMode === 'hybrid_car' ? 0.12 : 0.05;
    const transportCo2 = whatIfWeeklyKm * transportFactor;
    
    const dietFactor = whatIfDiet === 'omnivore' ? 3.5 * 14 : whatIfDiet === 'poultry_fish' ? 1.2 * 14 : whatIfDiet === 'vegetarian' ? 0.5 * 14 : 0.2 * 14;
    const dietCo2 = dietFactor;
    
    const energyCo2 = ((profile.energyBill * 0.38) * 0.25) * (whatIfEnergyPct / 100);
    return parseFloat((transportCo2 + dietCo2 + energyCo2).toFixed(1));
  }, [whatIfWeeklyKm, whatIfDiet, whatIfEnergyPct, profile]);

  const savingsKg = useMemo(() => {
    return Math.max(0, parseFloat((baselineWeeklyCarbon - simulatedTwinWeeklyCarbon).toFixed(1)));
  }, [baselineWeeklyCarbon, simulatedTwinWeeklyCarbon]);

  const savingsPct = useMemo(() => {
    if (baselineWeeklyCarbon === 0) return 0;
    return Math.min(100, Math.round((savingsKg / baselineWeeklyCarbon) * 100));
  }, [savingsKg, baselineWeeklyCarbon]);

  // Send message to Coach
  const handleSendMessage = async (textToSend = '') => {
    const txt = textToSend || inputText;
    if (!txt.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: txt };
    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
    
    setCoachTyping(true);
    try {
      const coachReply = await askGeminiCoach(messages, txt, apiKeys.gemini);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'coach', text: coachReply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'coach', text: 'I encountered an issue connecting. Try turning off phantom devices in your room!' }]);
    } finally {
      setCoachTyping(false);
    }
  };

  // Toggle tasks checklist
  const handleToggleTask = (taskId, costSaved) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.done;
          if (nextState) {
            showToast(`Task completed! Saved ${costSaved} kg CO2e`, 'success');
            incrementStreak();
            unlockAchievement('streak_3');
          }
          return { ...t, done: nextState };
        }
        return t;
      })
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--primary-900)' }}>Reduce Footprint 🎯</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '2px' }}>
          Simulate carbon savings using what-if sliders, chat with the AI coach, or tackle tailored action steps.
        </p>
      </div>

      {/* Sub tabs list */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-100)', gap: '16px' }}>
        {[
          { id: 'twin', label: 'AI What-If Simulator & Twin' },
          { id: 'coach', label: 'AI Coach Chat Support' },
          { id: 'tasks', label: 'Personalized Eco Tasks' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveActionsSubTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: 'var(--space-3) 0',
              borderBottom: activeActionsSubTab === tab.id ? '3px solid var(--primary-600)' : '3px solid transparent',
              color: activeActionsSubTab === tab.id ? 'var(--primary-700)' : 'var(--gray-500)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page Views Switch */}
      <div style={{ minHeight: '350px' }}>
        {activeActionsSubTab === 'twin' && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Sliders Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
              
              <Card title="Twin Modifiers" subtitle="Adjust your weekly parameters to simulate a leaner carbon twin lifestyle">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: 'var(--space-3)' }}>
                  {/* Commute Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)', marginBottom: '6px' }}>
                      <span>Weekly Car Travel Distance</span>
                      <span style={{ color: 'var(--primary-800)' }}>{whatIfWeeklyKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={whatIfWeeklyKm}
                      onChange={(e) => setWhatIfWeeklyKm(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary-600)', height: '6px', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Diet Selector slider equivalent */}
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px' }} htmlFor="whatif-diet">Twin Diet Profile</label>
                    <select
                      id="whatif-diet"
                      className="form-input"
                      value={whatIfDiet}
                      onChange={(e) => setWhatIfDiet(e.target.value)}
                    >
                      <option value="omnivore">Omnivore (Heavy meat)</option>
                      <option value="poultry_fish">Poultry & Fish only</option>
                      <option value="vegetarian">Vegetarian (Eggs/Cheese)</option>
                      <option value="vegan">Vegan (100% plant-based)</option>
                    </select>
                  </div>

                  {/* Energy efficiency slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)', marginBottom: '6px' }}>
                      <span>Home Utility Savings (LEDs/Heating)</span>
                      <span style={{ color: 'var(--primary-800)' }}>{100 - whatIfEnergyPct}% Off</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="100"
                      step="5"
                      value={whatIfEnergyPct}
                      onChange={(e) => setWhatIfEnergyPct(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: 'var(--primary-600)',
                        height: '6px',
                        cursor: 'pointer',
                        transform: 'scaleX(-1)' // Invert slider representation
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* Carbon Twin Results comparison */}
              <Card title="Carbon Twin Comparison" subtitle="Weekly baseline vs Future simulated target footprint">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '8px 0' }}>
                  {/* Visual Bar Graph */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--gray-500)', fontWeight: '600' }}>
                        <span>Current Weekly Baseline</span>
                        <span>{baselineWeeklyCarbon} kg</span>
                      </div>
                      <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '4px' }}>
                        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--gray-400)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--primary-800)', fontWeight: '700' }}>
                        <span>Simulated Carbon Twin</span>
                        <span>{simulatedTwinWeeklyCarbon} kg</span>
                      </div>
                      <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '4px' }}>
                        <div 
                          style={{ 
                            width: `${(simulatedTwinWeeklyCarbon / baselineWeeklyCarbon) * 100}%`, 
                            height: '100%', 
                            backgroundColor: 'var(--primary-500)',
                            transition: 'width 0.5s ease-out'
                          }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric box */}
                  <div 
                    style={{ 
                      padding: '14px', 
                      backgroundColor: 'var(--primary-50)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--primary-200)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '8px'
                    }}
                  >
                    <div style={{ fontSize: '32px' }}>🌱</div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-900)', fontFamily: "'Outfit'" }}>
                        Save {savingsKg} kg CO2e / week
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--primary-800)', fontWeight: '600', marginTop: '2px' }}>
                        This represents a **{savingsPct}%** emissions decrease!
                      </div>
                    </div>
                  </div>

                  {savingsPct >= 20 && (
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        showToast("Carbon Twin targets saved as preferences!", "success");
                        unlockAchievement("twin_align");
                      }}
                    >
                      Lock Twin Targets as Goal
                    </Button>
                  )}
                </div>
              </Card>

            </div>
          </div>
        )}

        {activeActionsSubTab === 'coach' && (
          <div className="animate-slide-up">
            <Card title="AI Carbon Intelligence Coach" subtitle="Get customized 5-minute action recommendations from Gemini">
              {/* Chat Thread Panel */}
              <div 
                style={{ 
                  height: '280px', 
                  overflowY: 'auto', 
                  border: '1px solid var(--gray-100)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'var(--off-white)',
                  marginBottom: 'var(--space-4)'
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: msg.sender === 'user' ? 'var(--primary-600)' : 'var(--white)',
                      color: msg.sender === 'user' ? 'var(--white)' : 'var(--gray-900)',
                      boxShadow: 'var(--shadow-sm)',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--gray-100)'
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                
                {coachTyping && (
                  <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '10px 14px', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '600' }}>Coach is compiling suggestions...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Board */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Ask a question (e.g. Give me 5-min actions to save heating cost)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={coachTyping}
                />
                <Button 
                  onClick={() => handleSendMessage()} 
                  disabled={coachTyping || !inputText.trim()}
                  style={{ display: 'flex', gap: '4px' }}
                >
                  <Send size={16} /> Send
                </Button>
              </div>

              {/* Preset Quick Questions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {[
                  'Why is my electricity carbon footprint high?',
                  'How do dairy and beef compare to plant diets?',
                  'Recommend a 5-minute action to save water'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(preset)}
                    disabled={coachTyping}
                    style={{
                      border: '1px solid var(--primary-200)',
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-800)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeActionsSubTab === 'tasks' && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card title="Personalized Action Checklist" subtitle="Complete these small challenges to build streaks and offsets">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => !task.done && handleToggleTask(task.id, task.co2e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: task.done ? 'var(--primary-50)' : 'var(--white)',
                      border: task.done ? '1px solid var(--primary-200)' : '1px solid var(--gray-100)',
                      borderRadius: 'var(--radius-md)',
                      cursor: task.done ? 'default' : 'pointer',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      opacity: task.done ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: task.done ? 'none' : '2px solid var(--gray-300)',
                          backgroundColor: task.done ? 'var(--primary-600)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--white)'
                        }}
                      >
                        {task.done && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span 
                        style={{ 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          color: task.done ? 'var(--primary-900)' : 'var(--gray-800)',
                          textDecoration: task.done ? 'line-through' : 'none'
                        }}
                      >
                        {task.text}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{ 
                          fontSize: '11px', 
                          fontWeight: '700', 
                          color: task.done ? 'var(--primary-700)' : 'var(--gray-500)',
                          backgroundColor: task.done ? 'var(--primary-100)' : 'var(--gray-50)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        Save {task.co2e} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
};

export default ActionsPage;
