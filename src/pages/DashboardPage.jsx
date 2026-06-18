import React, { useContext, useMemo } from 'react';
import { CarbonContext } from '../contexts/CarbonContext';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import CarbonGauge from '../components/charts/CarbonGauge';
import CategoryDonut from '../components/charts/CategoryDonut';
import TrendLine from '../components/charts/TrendLine';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { TrendingDown, Users, Award, ShieldAlert, Navigation, BookOpen } from 'lucide-react';

const DashboardPage = () => {
  const { 
    activities, 
    carbonBudget, 
    getTodayEmissions, 
    getCategoryTotalsForPeriod, 
    getLast7DaysEmissions 
  } = useContext(CarbonContext);
  const { persona, profile } = useContext(UserContext);
  const { alerts, setCurrentView } = useContext(AppContext);

  // Computations
  const todayEmissions = useMemo(() => getTodayEmissions(), [activities, getTodayEmissions]);
  
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  }, []);
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const categoryTotals = useMemo(() => {
    return getCategoryTotalsForPeriod(sevenDaysAgo, todayDateStr);
  }, [activities, sevenDaysAgo, todayDateStr, getCategoryTotalsForPeriod]);

  const last7DaysData = useMemo(() => {
    return getLast7DaysEmissions();
  }, [activities, getLast7DaysEmissions]);

  // Peer Comparison: Average New Yorker emits ~45 kg CO2e per day, EU is ~22 kg.
  const peerAverage = profile.location.toLowerCase().includes('usa') || profile.location.toLowerCase().includes('york') ? 45.0 : 25.0;
  const peerComparisonPercent = useMemo(() => {
    const diff = peerAverage - todayEmissions;
    const pct = (diff / peerAverage) * 100;
    return Math.round(pct);
  }, [todayEmissions, peerAverage]);

  // Active unread warnings
  const unreadAlerts = alerts.filter(a => !a.read);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--primary-900)' }}>
            Welcome back, {profile.name || 'Eco Advocate'}! 🌿
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '2px' }}>
            You are currently classified as a **{persona}** based on your sustainable habits.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setCurrentView('tracker')}
          style={{ gap: '8px' }}
        >
          <Navigation size={16} style={{ transform: 'rotate(90deg)' }} /> Log Carbon Activity
        </Button>
      </div>

      {/* Grid Row 1: Gauge (Main Score) & Peer Comparison Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-6)',
        }}
        className="dashboard-row-1"
      >
        {/* Gauge Widget */}
        <Card 
          title="Daily Carbon Budget" 
          subtitle="Real-time tracking against your personal budget target"
          variant="glass"
          style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}
        >
          <CarbonGauge value={todayEmissions} budget={carbonBudget} />
        </Card>
      </div>
      
      {/* Responsive layout adjustment */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)'
        }}
      >
        {/* Peer Comparison Card */}
        <Card title="Peer Comparison" subtitle={`How you compare to others in ${profile.location}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', margin: 'var(--space-3) 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: peerComparisonPercent >= 0 ? 'var(--primary-100)' : 'hsl(0, 100%, 96%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: peerComparisonPercent >= 0 ? 'var(--primary-700)' : 'var(--danger)'
              }}
            >
              {peerComparisonPercent >= 0 ? <TrendingDown size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: "'Outfit'" }}>
                {peerComparisonPercent >= 0 ? `${peerComparisonPercent}% Less` : `${Math.abs(peerComparisonPercent)}% More`}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500' }}>
                Compared to regional average ({peerAverage} kg CO2e/day)
              </div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.6', marginTop: '12px' }}>
            {peerComparisonPercent >= 0 
              ? `Fantastic job! Your lower emissions today save the equivalent of **${((peerAverage - todayEmissions) * 0.045).toFixed(2)}** tree seedlings grown for 10 years.`
              : "Your transport commutes or household energy bills are currently higher than the local per-capita average. Try our AI Coach recommendations to find quick cuts!"
            }
          </p>
        </Card>

        {/* AI Action Alerts Card */}
        <Card 
          title="Eco Alerts Tray" 
          subtitle="Proactive carbon threshold indicators"
          headerAction={
            unreadAlerts.length > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--white)', backgroundColor: 'var(--danger)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '700' }}>
                {unreadAlerts.length} Actionable
              </span>
            )
          }
        >
          {unreadAlerts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '120px', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: '600' }}>No active carbon spikes detected!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unreadAlerts.slice(0, 2).map((alert) => (
                <div 
                  key={alert.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: alert.type === 'warning' ? 'hsl(14, 100%, 97%)' : 'var(--primary-50)',
                    border: alert.type === 'warning' ? '1px solid hsl(14, 100%, 90%)' : '1px solid var(--primary-100)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)' }}>
                    <span style={{ fontSize: '16px' }}>{alert.type === 'warning' ? '⚠️' : '💡'}</span>
                    {alert.title}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '4px', lineHeight: '1.5' }}>
                    {alert.message}
                  </p>
                </div>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('actions')}
                style={{ alignSelf: 'flex-end', fontSize: '12px', padding: 0 }}
              >
                Open Carbon Coach &rarr;
              </Button>
            </div>
          )}
        </Card>

        {/* Eco Academy Learning Hub Card */}
        <Card title="Eco Academy Hub" subtitle="Enhance your sustainability knowledge">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', margin: 'var(--space-2) 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-700)'
              }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-800)' }}>
                Earn Sustainability XP
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                Complete micro-lessons & test your quiz skills.
              </div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--gray-600)', lineHeight: '1.5', marginTop: '12px', marginBottom: '12px' }}>
            Gain crucial insights on phantom power, carbon offset certifications, food footprints, and recycling best practices.
          </p>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setCurrentView('learn')}
            style={{ width: '100%', minHeight: '36px' }}
          >
            Enter Academy
          </Button>
        </Card>
      </div>

      {/* Grid Row 2: Category share & Trend Plotter */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
          marginTop: 'var(--space-2)'
        }}
        className="dashboard-row-2"
      >
        {/* Category Share Donut */}
        <Card title="Emissions Share" subtitle="Category distribution over the last 7 days">
          <div style={{ padding: 'var(--space-2) 0' }}>
            <CategoryDonut data={categoryTotals} />
          </div>
        </Card>

        {/* Weekly Trend Line */}
        <Card title="Carbon History" subtitle="Daily carbon totals over the last 7 days">
          <div style={{ padding: 'var(--space-2) 0', display: 'flex', justifyContent: 'center' }}>
            <TrendLine data={last7DaysData} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
