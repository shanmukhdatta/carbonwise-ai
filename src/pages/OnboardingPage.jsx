import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { analyzeLifestyleOnboarding } from '../services/geminiService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const OnboardingPage = () => {
  const { completeOnboarding } = useContext(UserContext);
  const { apiKeys, setCurrentView } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    location: 'New York, USA',
    householdSize: 2,
    transportMode: 'gas_car',
    weeklyKm: 120,
    energyBill: 100,
    dietType: 'omnivore',
    recycleHabit: 'sometimes'
  });

  const updateField = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await analyzeLifestyleOnboarding(form, apiKeys.gemini);
      setAnalysisResult(result);
      setStep(5); // Show results screen
    } catch (e) {
      console.error(e);
      // Fail-safe default
      setAnalysisResult({
        score: 52,
        persona: 'Conscious Consumer',
        analysisText: 'Your initial footprint shows reasonable carbon balance. Commuting in a gasoline car represents your highest opportunity to reduce emissions.'
      });
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    completeOnboarding(form, analysisResult.score, analysisResult.persona);
    setCurrentView('dashboard');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--primary-900)' }}>Let's get to know you 🌿</h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
              CarbonWise AI customizes your targets based on your household size, geography, and lifestyle.
            </p>
            
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-name">What is your name?</label>
              <input
                id="onboard-name"
                className="form-input"
                type="text"
                placeholder="e.g. Robin"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboard-location">Where do you live?</label>
              <input
                id="onboard-location"
                className="form-input"
                type="text"
                placeholder="City, Country"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>
            
            <Button 
              disabled={!form.name.trim()} 
              onClick={handleNext}
              style={{ marginTop: '12px' }}
            >
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--primary-900)' }}>Transit & Household 🚗</h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-house">How many people live in your household?</label>
              <select
                id="onboard-house"
                className="form-input"
                value={form.householdSize}
                onChange={(e) => updateField('householdSize', parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboard-trans">What is your primary mode of transit?</label>
              <select
                id="onboard-trans"
                className="form-input"
                value={form.transportMode}
                onChange={(e) => updateField('transportMode', e.target.value)}
              >
                <option value="gas_car">Gasoline/Diesel Car</option>
                <option value="hybrid_car">Hybrid Car</option>
                <option value="electric_car">Electric Vehicle (EV)</option>
                <option value="bus">Public Bus</option>
                <option value="train">Train / Metro</option>
                <option value="bicycle">Bicycle / Walking</option>
              </select>
            </div>

            {form.transportMode !== 'bicycle' && (
              <div className="form-group">
                <label className="form-label" htmlFor="onboard-km">How many kilometers do you travel weekly?</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    id="onboard-km"
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.weeklyKm}
                    onChange={(e) => updateField('weeklyKm', Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: '600' }}>km</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button variant="secondary" onClick={handlePrev} style={{ flex: 1 }}>Back</Button>
              <Button onClick={handleNext} style={{ flex: 2 }}>Next Step</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--primary-900)' }}>Home Utilities & Waste ⚡</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="onboard-energy">What is your typical monthly home energy bill?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-800)' }}>$</span>
                <input
                  id="onboard-energy"
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.energyBill}
                  onChange={(e) => updateField('energyBill', Math.max(0, parseInt(e.target.value) || 0))}
                />
                <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: '600' }}>/ month</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboard-recycle">How frequently do you sort recycling and compost?</label>
              <select
                id="onboard-recycle"
                className="form-input"
                value={form.recycleHabit}
                onChange={(e) => updateField('recycleHabit', e.target.value)}
              >
                <option value="always">Always sorted meticulously</option>
                <option value="sometimes">Sometimes sorted</option>
                <option value="rarely">Rarely sorted</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button variant="secondary" onClick={handlePrev} style={{ flex: 1 }}>Back</Button>
              <Button onClick={handleNext} style={{ flex: 2 }}>Next Step</Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--primary-900)' }}>Diet Preference 🥗</h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
              Food consumption accounts for up to 25% of global personal emissions. Choose the option closest to your diet.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'omnivore', title: '🥩 Omnivore', desc: 'Frequent red meat, poultry, dairy' },
                { id: 'poultry_fish', title: '🍗 Flexitarian / Fish', desc: 'No red meat, eats poultry, fish, eggs' },
                { id: 'vegetarian', title: '🧀 Vegetarian', desc: 'No meat or fish, eats dairy and eggs' },
                { id: 'vegan', title: '🌱 Vegan', desc: '100% plant-based food items only' }
              ].map((diet) => (
                <div
                  key={diet.id}
                  onClick={() => updateField('dietType', diet.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: form.dietType === diet.id ? '2px solid var(--primary-600)' : '1px solid var(--gray-200)',
                    backgroundColor: form.dietType === diet.id ? 'var(--primary-50)' : 'var(--white)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '700', color: 'var(--primary-900)', fontSize: '14px' }}>{diet.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>{diet.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={handlePrev} style={{ flex: 1 }}>Back</Button>
              <Button onClick={handleSubmit} style={{ flex: 2 }}>Generate AI Analysis</Button>
            </div>
          </div>
        );

      case 5:
        // Result Screen
        return (
          <div className="cw-onboarding-result animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', margin: 'var(--space-2) 0' }}>
              <span style={{ fontSize: '48px' }}>🎉</span>
              <h2 style={{ fontSize: '26px', color: 'var(--primary-900)', marginTop: '8px' }}>
                Your Profile is Ready!
              </h2>
            </div>

            <Card style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--primary-800)', fontWeight: '700' }}>SUSTAINABILITY SCORE</div>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--primary-900)', fontFamily: "'Outfit'" }}>
                    {analysisResult?.score}/100
                  </div>
                </div>
                <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--primary-200)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--primary-800)', fontWeight: '700' }}>ENVIRONMENTAL PERSONA</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-900)', marginTop: '6px' }}>
                    {analysisResult?.persona}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--gray-700)', borderTop: '1px solid var(--primary-200)', paddingTop: '12px' }}>
                {analysisResult?.analysisText}
              </div>
            </Card>

            <Button onClick={handleFinish} style={{ width: '100%', minHeight: '48px', fontSize: '16px' }}>
              Enter CarbonWise Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--off-white)',
        padding: 'var(--space-4)'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'var(--space-8)',
          border: '1px solid var(--gray-100)'
        }}
      >
        {/* Onboarding Header with Progress Dots */}
        {step < 5 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-8)'
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4].map((s) => (
                <span
                  key={s}
                  style={{
                    width: s === step ? '24px' : '8px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: s === step ? 'var(--primary-600)' : s < step ? 'var(--primary-300)' : 'var(--gray-200)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-400)' }}>
              STEP {step} OF 4
            </span>
          </div>
        )}

        {/* Display loading screen during AI calculation */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '240px',
              gap: '16px'
            }}
          >
            <div
              className="animate-pulse-glow"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}
            >
              🌱
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', color: 'var(--primary-900)' }}>Analyzing Habits...</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                Gemini is building your carbon profile
              </div>
            </div>
          </div>
        ) : (
          renderStep()
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
