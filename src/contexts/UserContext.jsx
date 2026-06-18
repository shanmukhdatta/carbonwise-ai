import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem('carbonwise_onboarded') === 'true';
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('carbonwise_profile');
    return saved
      ? JSON.parse(saved)
      : {
          name: '',
          location: 'New York, USA',
          householdSize: 2,
          transportMode: 'gas_car',
          weeklyKm: 150,
          energyBill: 120, // $ per month
          dietType: 'omnivore',
          recycleHabit: 'sometimes'
        };
  });

  const [persona, setPersona] = useState(() => {
    return localStorage.getItem('carbonwise_persona') || 'Eco Beginner';
  });

  const [sustainabilityScore, setSustainabilityScore] = useState(() => {
    const saved = localStorage.getItem('carbonwise_sustainability_score');
    return saved ? parseInt(saved, 10) : 45;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('carbonwise_streak');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('carbonwise_achievements');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 'first_log', title: 'Carbon Logger', desc: 'Logged your very first activity', icon: '🌱', unlocked: true },
          { id: 'streak_3', title: 'Consistent Green', desc: 'Maintain a 3-day action streak', icon: '🔥', unlocked: true },
          { id: 'no_meat', title: 'Green Diet', desc: 'Log 5 plant-based meals', icon: '🥗', unlocked: false },
          { id: 'public_transit', title: 'Commute Hero', desc: 'Log public transport 5 times', icon: '🚌', unlocked: false },
          { id: 'clean_bill', title: 'Eco Saver', desc: 'Scan an electricity bill with OCR', icon: '⚡', unlocked: false },
          { id: 'twin_align', title: 'Twin Alignment', desc: 'Achieve your What-If carbon twin target', icon: '👥', unlocked: false }
        ];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('carbonwise_goals');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, text: 'Reduce transport emissions by 15%', target: 15, current: 8, completed: false, category: 'transport' },
          { id: 2, text: 'Switch 3 meals to plant-based next week', target: 3, current: 1, completed: false, category: 'food' },
          { id: 3, text: 'Keep electricity usage under 250 kWh', target: 250, current: 180, completed: false, category: 'energy' }
        ];
  });

  // Save profile and onboarding state
  useEffect(() => {
    localStorage.setItem('carbonwise_onboarded', onboarded);
  }, [onboarded]);

  useEffect(() => {
    localStorage.setItem('carbonwise_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('carbonwise_persona', persona);
  }, [persona]);

  useEffect(() => {
    localStorage.setItem('carbonwise_sustainability_score', sustainabilityScore);
  }, [sustainabilityScore]);

  useEffect(() => {
    localStorage.setItem('carbonwise_streak', streak);
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('carbonwise_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('carbonwise_goals', JSON.stringify(goals));
  }, [goals]);

  // Actions to mutate User State
  const completeOnboarding = (lifestyleAnswers, score, environmentalPersona) => {
    setProfile(lifestyleAnswers);
    setSustainabilityScore(score);
    setPersona(environmentalPersona);
    setOnboarded(true);
  };

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const incrementStreak = () => {
    setStreak((prev) => prev + 1);
  };

  const unlockAchievement = (id) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          return { ...ach, unlocked: true };
        }
        return ach;
      })
    );
  };

  const updateGoalProgress = (categoryId, amount) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.category === categoryId) {
          const newCurrent = Math.min(g.target, g.current + amount);
          return {
            ...g,
            current: newCurrent,
            completed: newCurrent >= g.target
          };
        }
        return g;
      })
    );
  };

  return (
    <UserContext.Provider
      value={{
        onboarded,
        setOnboarded,
        profile,
        updateProfile,
        persona,
        setPersona,
        sustainabilityScore,
        completeOnboarding,
        streak,
        incrementStreak,
        achievements,
        unlockAchievement,
        goals,
        updateGoalProgress
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
