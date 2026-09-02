import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './WellbeingSupport.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const advisorTopics = [
  {
    id: 'overwhelmed',
    label: 'Feeling overwhelmed',
    title: 'Pause and reduce the pressure',
    response: 'Take one slow breath in and one longer breath out. Focus on the next ten minutes only, reduce decisions where you can, and step away from the screen briefly if possible.',
    nextStep: 'If this feeling keeps building, reach out to a trusted person or a licensed mental health professional for support.',
  },
  {
    id: 'stress',
    label: 'High stress or anxiety',
    title: 'Ground yourself in the present',
    response: 'Try naming five things you can see, four you can feel, three you can hear, two you can smell, and one you can taste. Short grounding exercises can help lower the intensity of anxious moments.',
    nextStep: 'If anxiety is disrupting sleep, work, or safety, professional support is a strong next step.',
  },
  {
    id: 'motivation',
    label: 'Low energy or motivation',
    title: 'Shrink the task and create movement',
    response: 'Pick one tiny action that takes less than five minutes and do only that. Progress often returns more easily after a small start than after waiting to feel ready.',
    nextStep: 'If low mood or lack of energy persists, consider contacting a clinician or local support service.',
  },
  {
    id: 'urgent',
    label: 'Need urgent help',
    title: 'Immediate safety comes first',
    response: 'If you may be at risk of harming yourself or someone else, or you do not feel safe right now, contact local emergency services immediately or go to the nearest emergency department.',
    nextStep: 'You can also contact a local crisis line or ask a trusted person to stay with you while you get urgent help.',
  },
] as const;

const awarenessPoints = [
  'Visible support access from every page through the floating help badge.',
  'Awareness-first guidance that avoids pretending to replace licensed care.',
  'Clear escalation language for urgent situations and immediate safety concerns.',
] as const;

export default function WellbeingSupport() {
  const location = useLocation();
  const [selectedTopicId, setSelectedTopicId] = useState<(typeof advisorTopics)[number]['id']>('overwhelmed');
  const [donating, setDonating] = useState(false);
  const [donationMessage, setDonationMessage] = useState<string | null>(null);
  const donationState = new URLSearchParams(location.search).get('donation');

  const selectedTopic = useMemo(
    () => advisorTopics.find((topic) => topic.id === selectedTopicId) ?? advisorTopics[0],
    [selectedTopicId],
  );

  const handleDonate = async () => {
    setDonating(true);
    setDonationMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/charity/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        setDonationMessage(data.error || 'Could not start charity checkout right now.');
      } else if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        setDonationMessage(data.message || 'Charity support is available in demo mode.');
      }
    } catch {
      setDonationMessage('Could not connect to the charity checkout service right now.');
    } finally {
      setDonating(false);
    }
  };

  return (
    <main className="wellbeing-support">
      <section className="wellbeing-support__hero">
        <div className="container">
          <p className="wellbeing-support__eyebrow">Support &amp; Awareness</p>
          <h1>AI Mental Health Advisor visibility is now built into the demo</h1>
          <p>
            This page gives the app a visible wellbeing layer with a persistent help badge, a guided
            advisor surface, and clear awareness messaging. It is supportive product guidance, not a
            replacement for professional medical or crisis care.
          </p>
          <button className="wellbeing-support__btn wellbeing-support__btn--charity" onClick={handleDonate} disabled={donating}>
            {donating ? 'Starting charity checkout…' : '💛 One-Click Charity Button'}
          </button>
          <div className="wellbeing-support__actions">
            <Link to="/dashboard" className="wellbeing-support__btn wellbeing-support__btn--primary">Back to dashboard</Link>
            <Link to="/feature-centre" className="wellbeing-support__btn">Open feature centre</Link>
          </div>
        </div>
      </section>

      <section className="wellbeing-support__section">
        <div className="container wellbeing-support__layout">
          <article className="wellbeing-support__advisor">
            {donationState && (
              <div className={`wellbeing-support__status wellbeing-support__status--${donationState}`}>
                {donationState === 'success'
                  ? 'Thank you for supporting the charity flow. Your donation checkout completed successfully.'
                  : 'Charity checkout was canceled. You can use the one-click button again whenever you are ready.'}
              </div>
            )}
            {donationMessage && (
              <div className="wellbeing-support__status wellbeing-support__status--info">
                {donationMessage}
              </div>
            )}
            <div className="wellbeing-support__advisor-header">
              <span>AI Mental Health Advisor</span>
              <strong>Awareness-first demo</strong>
            </div>
            <h2>Choose what kind of support you want to show</h2>
            <div className="wellbeing-support__topic-grid">
              {advisorTopics.map((topic) => (
                <button
                  key={topic.id}
                  className={`wellbeing-support__topic${selectedTopic.id === topic.id ? ' wellbeing-support__topic--active' : ''}`}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  {topic.label}
                </button>
              ))}
            </div>
            <div className="wellbeing-support__response">
              <h3>{selectedTopic.title}</h3>
              <p>{selectedTopic.response}</p>
              <p>{selectedTopic.nextStep}</p>
            </div>
          </article>

          <aside className="wellbeing-support__awareness">
            <h2>Help awareness layer</h2>
            <ul>
              {awarenessPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="wellbeing-support__notice">
              <strong>Important:</strong>
              <p>
                If someone is in immediate danger or feels unsafe, the right action is to contact
                local emergency services or a local crisis resource right away.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
