import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from '../components/CompetitionCard';
import EntryModal from '../components/EntryModal';
import { useButtonSound } from '../hooks/useButtonSound';
import './Home.css';

interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  currency: string;
  cashAlternative: boolean;
  cashAlternativeAmount: number;
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  status: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
  prizeIncludes?: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const launchPhases = [
  {
    title: 'Phase 1: Organic Launch',
    timeframe: 'Week 1-4 · Month 1',
    budget: '£0 upfront · £1.5K-£4K reinvested from early profit by week 4',
    tactics: [
      'Deploy on free or low-cost production infrastructure with SSL, backups, monitoring, payment processing, and verification flows.',
      'Launch TikTok, Instagram, YouTube Shorts, Twitter/X, Reddit, Discord, and Facebook with 3-5 daily posts and rapid comment response.',
      'Batch 30 free-tool videos in week 1, launch referral rewards in week 3, and reinvest only realized profits into low-cost paid channels in week 4.',
    ],
    outcomes: [
      'Month 1 target: 3K-5K total users',
      'Revenue target: £15K-£25K',
      'Profit target: £7.5K-£12.5K',
    ],
  },
  {
    title: 'Phase 2: Paid Growth',
    timeframe: 'Month 2-3 · Week 5-12',
    budget: 'Reinvest £7.5K-£32.5K of earned profits',
    tactics: [
      'Scale best-performing organic creatives into TikTok, Facebook/Instagram, Google Search, Reddit, YouTube pre-roll, and affiliate campaigns.',
      'Keep referral loops and daily social posting active so paid traffic compounds with organic word-of-mouth.',
      'Continuously cut weak channels and double down on the strongest CPC, CTR, and paid-entry conversion sources.',
    ],
    outcomes: [
      'Month 2 target: 7.5K-13K total users',
      'Month 3 target: 14.5K-25K total users',
      'Running profit target by end of month 3: £40.25K-£71K',
    ],
  },
  {
    title: 'Phase 3: Rapid Scaling',
    timeframe: 'Month 4-8 · Week 13-32',
    budget: 'Reinvest £36.25K+ from prior profits',
    tactics: [
      'Scale proven paid channels aggressively while testing adjacent audiences and creatives in smaller controlled budgets.',
      'Use strong referral mechanics, visible winner stories, and social proof to improve conversion efficiency as media spend rises.',
      'Treat each month as a scale-and-prune cycle: expand winners, pause laggards, and protect cash with weekly contribution-margin reviews.',
    ],
    outcomes: [
      'Break-even scale target in month 4: £66.25K-£112.5K monthly profit',
      'Month 8 target: 116K-205K total users',
      'Cumulative profit target by month 8: £698K-£1.287M',
    ],
  },
  {
    title: 'Phase 4: PR & Viral Push',
    timeframe: 'Month 6-8',
    budget: 'Primarily sweat equity and rev-share',
    tactics: [
      'Pitch milestone press releases around 100K users, £1M prize pot, fairness, and insurance-backed guarantees.',
      'Run influencer outreach using affiliate commission, free entries, and exclusive access instead of cash retainers.',
      'Turn milestone moments into short-form content, social proof threads, and community celebration assets.',
    ],
    outcomes: [
      'Press-assisted awareness spikes layered on top of paid growth',
      'Additional organic user surges from milestones and influencer mentions',
    ],
  },
  {
    title: 'Phase 5: Path to £10M',
    timeframe: 'Month 9-20',
    budget: '40-50% of monthly profits recycled into acquisition',
    tactics: [
      'Operate a disciplined reinvestment engine: scale marketing from operating cash only, never from debt or upfront founder capital.',
      'Focus on CAC discipline, repeat-entry behavior, referral lift, and premium draw mix so margin expands alongside volume.',
      'Use monthly milestone reviews to keep the business on the 20-month run-rate plan.',
    ],
    outcomes: [
      'Month 12 target: £500K-£625K monthly profit',
      'Month 16 target: £875K-£1M monthly profit',
      'Month 20 target: £1.125M-£1.25M monthly profit, exceeding a £10M annual run rate',
    ],
  },
] as const;

const ringFencedRules = [
  'Ring-fence every draw in its own profitability model: entry target must fully cover prize cost, payment fees, referral bonuses, insurance/compliance costs, reserve, and target margin before launch.',
  'Set a minimum contribution margin per draw and keep a separate reserve buffer so one underperforming draw cannot consume working capital from another draw.',
  'Cap acquisition spend per user so blended CAC stays safely below gross profit per entrant, especially once referral bonuses are active.',
  'Reinvest only realized profit — not projected revenue — into paid ads, affiliate commissions, and channel testing.',
  'Review draw economics weekly: if conversion, payment fees, or prize costs move, adjust entry targets or pause launch plans before margin is diluted.',
] as const;

const weekOnePlan = [
  {
    day: 'Day 1 · Monday',
    blocks: [
      {
        title: 'Morning',
        items: [
          'Deploy platform to production, test core flows, enable SSL/TLS, configure database backups, and activate free-tier monitoring.',
        ],
      },
      {
        title: 'Afternoon',
        items: [
          'Create TikTok, Instagram, YouTube, Twitter/X, and Reddit accounts with consistent branding and platform links.',
        ],
      },
      {
        title: 'Evening',
        items: [
          'Set up Meta Business Suite and a free scheduler, then map the first week’s content calendar.',
        ],
      },
    ],
  },
  {
    day: 'Day 2 · Tuesday',
    blocks: [
      {
        title: 'Morning',
        items: [
          'Create 10 short-form launch videos covering welcome, fairness, insurance backing, referrals, countdowns, prize showcase, odds, and platform differentiation.',
        ],
      },
      {
        title: 'Afternoon',
        items: [
          'Upload and schedule TikTok and Instagram Reels, write captions, and add relevant competition/prize/winner hashtags.',
        ],
      },
      {
        title: 'Evening',
        items: [
          'Publish intro Reddit posts in relevant communities, create the Discord server, and invite initial beta users.',
        ],
      },
    ],
  },
  {
    day: 'Day 3 · Wednesday',
    blocks: [
      {
        title: 'Morning',
        items: [
          'Brand the YouTube channel, publish 3-5 Shorts, and record a longer explainer video about fair draws and guaranteed prizes.',
        ],
      },
      {
        title: 'Afternoon',
        items: [
          'Publish the “Why I built this platform” Twitter/X thread and link the launch bonus offer.',
        ],
      },
      {
        title: 'Evening',
        items: [
          'Create the Facebook page assets, About section, banner, and contact details.',
        ],
      },
    ],
  },
  {
    day: 'Day 4 · Thursday',
    blocks: [
      {
        title: 'Morning',
        items: [
          'Create Telegram and WhatsApp Business channels if appropriate, then set up Mailchimp/Brevo and a welcome email sequence.',
        ],
      },
      {
        title: 'Afternoon',
        items: [
          'Reach out to 10-20 personal contacts with unique referral links and a direct request for feedback and first entries.',
        ],
      },
      {
        title: 'Evening',
        items: [
          'Post daily content across all channels and maintain multi-platform consistency.',
        ],
      },
    ],
  },
  {
    day: 'Day 5 · Friday',
    blocks: [
      {
        title: 'Morning',
        items: [
          'Review which videos, hooks, and channels are driving views, comments, and clicks.',
        ],
      },
      {
        title: 'Afternoon',
        items: [
          'Build the FAQ, landing-page answers, customer support responses, and auto-responder.',
        ],
      },
      {
        title: 'Evening',
        items: [
          'Launch the official “LIVE NOW” announcement simultaneously across all channels.',
        ],
      },
    ],
  },
  {
    day: 'Day 6-7 · Weekend',
    blocks: [
      {
        title: 'Saturday',
        items: [
          'Reply to all early-user inquiries, post weekend content, study top performers, and create more of what is working.',
        ],
      },
      {
        title: 'Sunday',
        items: [
          'Plan week 2, batch 10-15 new videos, monitor feedback, fix issues, send thank-you emails, and request testimonials.',
        ],
      },
    ],
  },
] as const;

const growthWeeks = [
  {
    title: 'Week 2 · Launch & First Organic Users',
    targets: 'Total users: 500-800 · Revenue/Profit: £1.5K-£4K · Cost: £0',
    actions: [
      'Post launch messaging across every owned channel at once and highlight fair, transparent, guaranteed, insurance-backed draws.',
      'Publish Reddit posts in relevant communities while following subreddit rules and doing genuine engagement.',
      'Join Discord servers, answer questions, and promote only where appropriate.',
      'Post founder-story and fairness threads on Twitter/X and direct the first 100 users toward bonus-entry messaging.',
    ],
  },
  {
    title: 'Week 3 · Referral Program Activation',
    targets: 'Total users: 800-1.5K · New registrations: 500-700 · Revenue/Profit: £4K-£7.5K',
    actions: [
      'Implement referral tracking, referrer/referee pairing, custom URLs, bonus automation, and email notifications.',
      'Launch +£2 referrer and +£2 referee incentives funded from house margin rather than outside capital.',
      'Send referral emails, in-app prompts, SMS reminders, and shareable social graphics.',
      'Track referral-driven signups separately so you can protect per-draw margin while scaling the offer.',
    ],
  },
  {
    title: 'Week 4 · Scale Organic + First Reinvestment',
    targets: 'Total users: 3K-5K · Revenue: £15K-£25K · Net profit week: £6K-£8.5K',
    actions: [
      'Analyze winning organic formats, increase posting frequency, and respond to every meaningful comment within an hour.',
      'Open TikTok, Reddit, Facebook/Instagram, Google, and affiliate accounts using only profits generated in weeks 1-3.',
      'Use best-performing organic creatives as ads and pause underperformers quickly based on CPC and paid-entry conversion.',
      'Keep daily ring-fenced draw reviews so ad spend never outruns the margin available from each live competition.',
    ],
  },
] as const;

const monthSummaries = [
  'Month 1: 3K-5K users · £7.5K-£12.5K profit · £1.5K-£4K marketing spend from profits only',
  'Month 2: 7.5K-13K users · £18.75K-£32.5K profit · £7.5K-£12.5K reinvestment budget',
  'Month 3: 14.5K-25K users · £36.25K-£62.5K profit · compounding paid + organic growth',
  'Month 4: 26.5K-45K users · £66.25K-£112.5K profit · break-even scale achieved',
  'Month 5-8: accelerate to 116K-205K users and £698K-£1.287M cumulative profit',
] as const;

const freeTools = [
  {
    category: 'Content Creation',
    items: ['CapCut', 'DaVinci Resolve', 'OBS Studio', 'Shotcut', 'Canva', 'Figma', 'Pexels', 'Pixabay', 'Unsplash'],
  },
  {
    category: 'Social Scheduling & Community',
    items: ['Meta Business Suite', 'Buffer', 'Later', 'TweetDeck', 'Discord', 'Reddit', 'Facebook Groups', 'Telegram'],
  },
  {
    category: 'Email, SMS & Automation',
    items: ['Mailchimp', 'Brevo', 'ConvertKit', 'Substack', 'Twilio trial credits', 'MessageBird', 'Plivo', 'Zapier', 'IFTTT'],
  },
  {
    category: 'Analytics & Tracking',
    items: ['Google Analytics', 'Plausible', 'Hotjar', 'Amplitude', 'Google Tag Manager', 'Facebook Pixel', 'TikTok Pixel'],
  },
  {
    category: 'Payments',
    items: ['Stripe', 'PayPal', 'Square'],
  },
] as const;

const contentCalendar = [
  {
    title: 'Week 1 · Launch Week',
    items: [
      'Welcome video',
      'How it works explainer',
      'Insurance guarantee',
      'Fair draws promise',
      'Referral bonus',
      'First draw countdown',
      'How to enter tutorial',
      'Prize showcase',
      'Why this platform',
      'Join now CTA',
    ],
  },
  {
    title: 'Week 2 · Growth Week',
    items: [
      'Daily top-performing repeats',
      'Winner celebration',
      'Pot growing animation',
      'Early-user testimonial',
      'Referral success story',
      'Odds improving highlight',
    ],
  },
  {
    title: 'Week 3 · Optimization',
    items: [
      '5x pot-growing videos',
      '3x winner celebrations',
      '3x referral-bonus videos',
      '2x odds/FOMO clips',
      '1x new feature or draw type',
    ],
  },
  {
    title: 'Week 4 · Scale',
    items: [
      'Replicate 3 highest-performing videos',
      'Add filters, effects, and B-roll',
      'Create compilation videos',
      'Produce meme-style edits',
      'Publish user-generated-content compilations',
    ],
  },
  {
    title: 'Month 2 · Paid Growth Content Mix',
    items: [
      'Turn the best organic videos into TikTok, Meta, Reddit, and YouTube ad creatives',
      'Post daily winner proof, referral reminders, and fairness explainer snippets',
      'Publish 2 longer YouTube videos each week answering FAQs and showing transparent draw mechanics',
      'Create carousel ads highlighting pot size, guaranteed prizes, insurance backing, and how to enter',
      'Feature user testimonials and community screenshots to support retargeting and email campaigns',
    ],
  },
  {
    title: 'Month 3 · Scaling & Social Proof',
    items: [
      'Double down on top-performing hooks with fresh edits, creators, and captions',
      'Create milestone posts around user growth, bigger pots, and repeat-winner stories',
      'Publish influencer/affiliate collaboration clips and community reaction content',
      'Run comparison-style content that explains why fair, ring-fenced draws outperform weak competitors',
      'Promote urgency around countdowns, improving odds, and limited-time referral incentives',
    ],
  },
] as const;

const metrics = {
  daily: [
    'Users acquired (new and total)',
    'Revenue and profit (daily and cumulative)',
    'Organic vs paid user split',
    'Referral conversion rate',
    'Cost per user and cost per £ revenue',
    'Social reach and engagement by platform',
    'Top-performing videos and most viral asset',
    'Average entries per user and average cost per entry',
  ],
  monthly: [
    'Total users acquired',
    'Total revenue and profit',
    'Marketing spend and ROI',
    'MoM growth percentage',
    'Organic vs paid split',
    'Repeat-user rate',
    'User acquisition cost',
    'Customer lifetime value',
  ],
} as const;

const milestones = [
  'Week 1: 300-500 users · £1.5K-£2.5K profit',
  'Week 2: 500-800 users · £2.5K-£4K profit',
  'Week 3: 800-1.5K users · £4K-£6K profit',
  'Week 4 / Month 1 close: 3K-5K users · £7.5K-£12.5K profit',
  'Month 20: 450K-500K users · £1.125M-£1.25M monthly profit · £10M+ annual run rate',
] as const;

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const playSound = useButtonSound();

  useEffect(() => {
    fetch(`${API_URL}/api/competitions`)
      .then((res) => res.json())
      .then((data) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load competitions. Please try again later.');
        setLoading(false);
      });
  }, []);

  const liveComps = competitions.filter((c) => c.status === 'live');
  const comingSoon = competitions.filter((c) => c.status === 'coming-soon');

  const cardCompetitions = competitions.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    prizeType: c.prizeType,
    prizeAmount: c.prizeAmount,
    prizeDetails: {
      currency: c.currency,
      description: c.prizeType,
      includes: c.prizeIncludes,
    },
    entryPrice: c.entryPrice,
    totalEntries: c.totalEntries,
    soldEntries: c.soldEntries,
    endsIn: c.endsIn,
    tags: c.tags,
    profitMargin: c.profitMargin,
    expectedWinners: c.expectedWinners,
    status: c.status,
  }));

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <span className="hero-badge">🏆 UAE Premium Competitions</span>
          <h1 className="hero-title">Win Life-Changing Prizes</h1>
          <p className="hero-subtitle">
            Fair draws · Cash alternatives · Transparent odds · Guaranteed winners
          </p>
          <div className="hero-badges">
            <div className="badge"><span className="badge-icon">💰</span><span className="badge-text">Cash Alternatives</span></div>
            <div className="badge"><span className="badge-icon">📊</span><span className="badge-text">Transparent Odds</span></div>
            <div className="badge"><span className="badge-icon">✅</span><span className="badge-text">Guaranteed Winners</span></div>
            <div className="badge"><span className="badge-icon">🔴</span><span className="badge-text">Live Draws</span></div>
          </div>
          <a href="#competitions" className="btn-cta btn-interactive" onMouseDown={playSound}>VIEW COMPETITIONS ↓</a>
        </div>
      </section>

      {/* Stats bar */}
      <div className="home-stats">
        <div className="container">
          <div className="home-stats__inner">
            <div className="home-stat"><strong>{competitions.length}</strong><span>Competitions</span></div>
            <div className="home-stat"><strong>{liveComps.length}</strong><span>Live Now</span></div>
            <div className="home-stat"><strong>£18.4M</strong><span>Annual Prizes</span></div>
            <div className="home-stat"><strong>100%</strong><span>Cash Alternative</span></div>
          </div>
        </div>
      </div>

      {/* Competitions */}
      <section className="competitions-section" id="competitions">
        <div className="container">
          <h2 className="section-title">🎯 LIVE COMPETITIONS</h2>
          {loading && <p className="loading">Loading competitions...</p>}
          {error && <p className="loading" style={{ color: '#f87171' }}>{error}</p>}
          {!loading && !error && (
            <div className="competitions-grid">
              {cardCompetitions.map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  onEnter={(id) => {
                    const c = competitions.find((x) => x.id === id);
                    if (c) setSelectedComp(c);
                  }}
                />
              ))}
            </div>
          )}
          {comingSoon.length > 0 && (
            <p className="coming-soon-note">
              ⏳ <strong>{comingSoon.length} competition{comingSoon.length > 1 ? 's' : ''} coming soon</strong> — check back shortly!
            </p>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <h2 className="section-title">WHY CHOOSE US</h2>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Bank-grade security and SSL encryption on all transactions</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📡</div>
              <h3>Live Fair Draws</h3>
              <p>Every draw is conducted live and verifiably fair</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💰</div>
              <h3>Cash Alternative</h3>
              <p>Every prize has a cash equivalent — you always have the choice</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📊</div>
              <h3>Transparent Odds</h3>
              <p>40% house margin shown publicly. No hidden fees or surprises</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🧮</div>
              <h3>Ring-Fenced Draw Economics</h3>
              <p>Every draw is budgeted to stay ring-fenced with a healthy profit margin before reinvestment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="playbook-section" id="launch-playbook">
        <div className="container">
          <h2 className="section-title">🚀 ZERO-FUNDING LAUNCH PLAYBOOK</h2>
          <p className="playbook-intro">
            Complete 20-month operator blueprint to scale from launch to a £10M annual profit run rate using zero upfront capital, disciplined reinvestment, and ring-fenced draw economics.
          </p>

          <div className="playbook-grid">
            {launchPhases.map((phase) => (
              <article key={phase.title} className="playbook-card">
                <p className="playbook-card__eyebrow">{phase.timeframe}</p>
                <h3>{phase.title}</h3>
                <p className="playbook-card__budget">{phase.budget}</p>
                <ul>
                  {phase.tactics.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="playbook-card__outcomes">
                  {phase.outcomes.map((outcome) => (
                    <span key={outcome}>{outcome}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ring-fence-section" id="ring-fenced-draws">
        <div className="container">
          <h2 className="section-title">💷 RING-FENCED DRAW &amp; PROFIT MARGIN RULES</h2>
          <div className="checklist-card">
            <ul className="checklist-list">
              {ringFencedRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="action-plan-section" id="week-one-plan">
        <div className="container">
          <h2 className="section-title">📅 WEEK 1 DAILY ACTION PLAN</h2>
          <div className="timeline-grid">
            {weekOnePlan.map((day) => (
              <article key={day.day} className="timeline-card">
                <h3>{day.day}</h3>
                {day.blocks.map((block) => (
                  <div key={block.title} className="timeline-block">
                    <h4>{block.title}</h4>
                    <ul className="checklist-list">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="action-plan-section action-plan-section--alt" id="growth-sprints">
        <div className="container">
          <h2 className="section-title">⚡ WEEK 2-4 GROWTH SPRINTS</h2>
          <div className="playbook-grid">
            {growthWeeks.map((week) => (
              <article key={week.title} className="playbook-card">
                <p className="playbook-card__eyebrow">{week.targets}</p>
                <h3>{week.title}</h3>
                <ul>
                  {week.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="summary-bar">
            {monthSummaries.map((summary) => (
              <span key={summary}>{summary}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="resources-section" id="free-tools">
        <div className="container">
          <h2 className="section-title">🛠️ FREE TOOLS &amp; RESOURCES</h2>
          <div className="resources-grid">
            {freeTools.map((group) => (
              <article key={group.category} className="resource-card">
                <h3>{group.category}</h3>
                <ul className="chip-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="resources-section resources-section--alt" id="content-calendar">
        <div className="container">
          <h2 className="section-title">🎬 MONTH 1-3 CONTENT CALENDAR</h2>
          <div className="resources-grid">
            {contentCalendar.map((week) => (
              <article key={week.title} className="resource-card">
                <h3>{week.title}</h3>
                <ul className="checklist-list">
                  {week.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics-section" id="metrics">
        <div className="container">
          <h2 className="section-title">📈 DAILY METRICS &amp; SUCCESS MILESTONES</h2>
          <div className="metrics-grid">
            <article className="resource-card">
              <h3>Daily Tracking Sheet</h3>
              <ul className="checklist-list">
                {metrics.daily.map((metric) => (
                  <li key={metric}>{metric}</li>
                ))}
              </ul>
            </article>
            <article className="resource-card">
              <h3>Monthly Scorecard</h3>
              <ul className="checklist-list">
                {metrics.monthly.map((metric) => (
                  <li key={metric}>{metric}</li>
                ))}
              </ul>
            </article>
            <article className="resource-card">
              <h3>Key Milestones</h3>
              <ul className="checklist-list">
                {milestones.map((milestone) => (
                  <li key={milestone}>{milestone}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} UAE Competition Platform · Fair, Transparent &amp; Compliant Draws</p>
          <Link to="/dashboard" className="footer-dash-link">📊 View Live Dashboard →</Link>
        </div>
      </footer>

      {selectedComp && (
        <EntryModal competition={selectedComp} onClose={() => setSelectedComp(null)} />
      )}
    </div>
  );
}
