import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { BookOpen, Compass, Award, ExternalLink } from 'lucide-react';

const LearnPage = () => {
  const { incrementStreak, unlockAchievement } = useContext(UserContext);
  const { showToast } = useContext(AppContext);

  // Micro learning cards state
  const [lessons, setLessons] = useState([
    { id: 'l1', title: 'Climate Change & Carbon Dials', desc: 'Understand how greenhouse gases trap warmth and why individual CO2 targets exist.', duration: '3 min read', xp: 20, done: false },
    { id: 'l2', title: 'Phantom Loads & Energy Audits', desc: 'Learn to isolate standby power drains in your house and how to save $10/month.', duration: '4 min read', xp: 20, done: false },
    { id: 'l3', title: 'The Lifecycle of Red Meat', desc: 'A scientific analysis of food-miles vs livestock methane emissions.', duration: '5 min read', xp: 20, done: false }
  ]);

  // News items
  const newsFeed = [
    { id: 1, title: 'Google Maps Rolls Out Eco-Routing Globally', desc: 'Google Maps Platform utilizes machine learning to display paths that burn the lowest fuel, already saving over 2 million metric tons of CO2.', source: 'GreenTech News', link: 'https://google.com' },
    { id: 2, title: 'Global Solar Capacity Hits Landmark Records', desc: 'Solar grids accounted for 64% of all new electricity installations globally last year, accelerating fossil fuel phase-outs.', source: 'EcoTimes', link: 'https://google.com' },
    { id: 3, title: 'Fungi Enzymes Dissolve Plastics in Hours', desc: 'Biologists engineer a fungal enzyme strain that breaks down plastic waste in landfills with zero carbon outputs.', source: 'BioScience Daily', link: 'https://google.com' }
  ];

  const handleCompleteLesson = (id, title, xp) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, done: true } : l))
    );
    showToast(`Lesson Completed! Earned +${xp} XP`, 'success');
    incrementStreak();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--primary-900)' }}>Eco Learning Hub & News 📖</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '2px' }}>
          Enhance your environmental literacy through micro-learning tasks and check up-to-date green headlines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Micro Learning lists */}
        <Card title="Micro-Learning Lessons" subtitle="Read and complete to earn bonus sustainability stats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                style={{
                  padding: '12px 16px',
                  backgroundColor: lesson.done ? 'var(--primary-50)' : 'var(--white)',
                  border: lesson.done ? '1px solid var(--primary-200)' : '1px solid var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-900)' }}>
                    {lesson.title}
                  </h4>
                  <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '700' }}>
                    {lesson.duration}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--gray-600)', lineHeight: '1.5' }}>
                  {lesson.desc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: '700' }}>
                    +{lesson.xp} XP Points
                  </span>
                  {lesson.done ? (
                    <span style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Completed &bull; Earned
                    </span>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => handleCompleteLesson(lesson.id, lesson.title, lesson.xp)}>
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Green News feed */}
        <Card title="Green News Feed" subtitle="Environmental headlines powered by AI recommendations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            {newsFeed.map((news) => (
              <div
                key={news.id}
                style={{
                  borderBottom: '1px solid var(--gray-100)',
                  paddingBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', color: 'var(--primary-600)', fontWeight: '800', textTransform: 'uppercase' }}>
                    {news.source}
                  </span>
                  <a href={news.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: 'var(--gray-400)' }}>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gray-800)', lineHeight: '1.3' }}>
                  {news.title}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--gray-500)', lineHeight: '1.4', marginTop: '2px' }}>
                  {news.desc}
                </p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default LearnPage;
