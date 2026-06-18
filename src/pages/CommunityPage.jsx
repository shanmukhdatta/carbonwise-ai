import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Trophy, ShieldCheck, Flame, Compass, Star } from 'lucide-react';

const CommunityPage = () => {
  const { achievements, streak, incrementStreak, unlockAchievement } = useContext(UserContext);
  const { showToast } = useContext(AppContext);

  // Challenge List
  const [challenges, setChallenges] = useState([
    { id: 'c1', title: '🌱 No-Car Weekend Challenge', desc: 'Avoid driving private combustion vehicles on Saturday and Sunday.', xp: 120, joined: false, progress: 0 },
    { id: 'c2', title: '🥗 Plastic-Free Food Week', desc: 'Log only unpackaged foods or home-cooked meals for 5 consecutive days.', xp: 200, joined: false, progress: 0 },
    { id: 'c3', title: '⚡ Power Down Peak Hours', desc: 'Turn off all heavy appliances from 6 PM to 9 PM daily.', xp: 80, joined: false, progress: 0 }
  ]);

  // Leaderboard data
  const leaderboardUsers = [
    { rank: 1, name: 'Clara Green', persona: 'Sustainability Leader', score: 96, savings: '48.2 kg' },
    { rank: 2, name: 'David Miller', persona: 'Green Champion', score: 88, savings: '38.4 kg' },
    { rank: 3, name: 'You', persona: 'Conscious Consumer', score: 76, savings: '24.1 kg', isUser: true },
    { rank: 4, name: 'Sven Lindqvist', persona: 'Conscious Consumer', score: 65, savings: '18.2 kg' },
    { rank: 5, name: 'Emma Watson', persona: 'Eco Beginner', score: 48, savings: '11.0 kg' }
  ];

  const handleJoinChallenge = (id, title) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: true } : c))
    );
    showToast(`You have joined: ${title}! Good luck!`, 'success');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--primary-900)' }}>Eco Community & Rewards 🏆</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '2px' }}>
          Compete in challenges, check your streaks, inspect earned badges, and view leaderboards.
        </p>
      </div>

      {/* Streak Dashboard Board */}
      <Card variant="highlight" style={{ backgroundColor: 'hsl(14, 100%, 98%)', borderColor: 'hsl(14, 100%, 50%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'hsl(14, 100%, 94%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(14, 100%, 50%)',
                fontSize: '28px'
              }}
            >
              🔥
            </div>
            <div>
              <h3 style={{ color: 'hsl(14, 100%, 25%)', fontSize: '18px', fontWeight: '800' }}>
                Your {streak}-Day Action Streak!
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '2px' }}>
                Keep logging daily activities to double your XP earnings.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              incrementStreak();
              showToast('Streak incremented! Keep up the green choices!', 'success');
              unlockAchievement('streak_3');
            }}
            style={{
              backgroundColor: 'hsl(14, 100%, 50%)',
              color: 'var(--white)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(235, 94, 40, 0.2)'
            }}
          >
            Log Today's Action
          </Button>
        </div>
      </Card>

      {/* Grid: Badges list & Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Achievements Badge Grid */}
        <Card title="Eco-Badge Gallery" subtitle="Unlock awards by completing sustainable actions">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '8px'
            }}
          >
            {achievements.map((badge) => (
              <div
                key={badge.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 6px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: badge.unlocked ? 'var(--primary-50)' : 'var(--gray-50)',
                  border: badge.unlocked ? '1px solid var(--primary-200)' : '1px solid var(--gray-200)',
                  filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                  opacity: badge.unlocked ? 1 : 0.6,
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                title={badge.desc}
              >
                <span style={{ fontSize: '32px', marginBottom: '6px' }}>{badge.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-800)' }}>{badge.title}</span>
                <span style={{ fontSize: '9px', color: 'var(--gray-400)', marginTop: '2px', display: 'block' }}>
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Community Leaderboard */}
        <Card title="Collective Leaderboard" subtitle="Sustainability scores compiled for your regional community">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {leaderboardUsers.map((item) => (
              <div
                key={item.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: item.isUser ? 'var(--primary-50)' : 'var(--white)',
                  border: item.isUser ? '1px solid var(--primary-300)' : '1px solid var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : item.rank === 3 ? '#cd7f32' : 'var(--gray-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: item.rank <= 3 ? 'var(--white)' : 'var(--gray-500)'
                    }}
                  >
                    {item.rank}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)' }}>
                      {item.name} {item.isUser && <span style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: '700' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>{item.persona}</div>
                  </div>
                </div>

                <div style={{ textAlignment: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-800)', fontFamily: "'Outfit'" }}>
                    {item.score}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>Saved {item.savings}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Active Challenges list */}
      <Card title="Active Community Challenges" subtitle="Collaborate and earn environmental bonus XP items">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {challenges.map((c) => (
            <div
              key={c.id}
              style={{
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--white)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <h4 style={{ fontSize: '15px', color: 'var(--primary-900)', fontWeight: '800' }}>{c.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px', lineHeight: '1.5' }}>{c.desc}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: '700', backgroundColor: 'var(--primary-100)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  +{c.xp} XP Points
                </span>
                {c.joined ? (
                  <span style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={16} /> Joined
                  </span>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => handleJoinChallenge(c.id, c.title)}>
                    Accept Challenge
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CommunityPage;
