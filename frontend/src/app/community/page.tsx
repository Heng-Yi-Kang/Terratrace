'use client';

import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

const LeafIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
  </svg>
);

const StarIcon = ({ filled = false, className = 'w-5 h-5' }: { filled?: boolean; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const TrophyIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

const MapPinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const FilterIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

const PencilIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const ThumbsUpIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
  </svg>
);

const CheckBadgeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const FireIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
  </svg>
);

const BoltIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const GlobeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9zm0 0c2.485 0 4.5-4.03 4.5-9A9 9 0 008.716 4.747M12 3c-2.485 0-4.5 4.03-4.5 9" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = () => (
  <header style={{
    background: 'linear-gradient(135deg, #059669 0%, #047857 60%, #064E3B 100%)',
    padding: '64px 24px 80px',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: '-100px', right: '-50px',
      width: '400px', height: '400px',
      background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', bottom: '-100px', left: '-100px',
      width: '350px', height: '350px',
      background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none',
    }} />

    <div style={{ maxWidth: '1152px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
        borderRadius: '100px', padding: '8px 18px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        <LeafIcon className="w-4 h-4" />
        <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: 'white' }}>
          Community Impact
        </span>
      </div>

      <h1 style={{
        fontFamily: 'Poppins, sans-serif', fontWeight: 700,
        fontSize: 'clamp(32px, 5vw, 52px)',
        color: 'white', lineHeight: 1.15,
        marginBottom: '16px', maxWidth: '720px',
      }}>
        Build the Movement,<br />
        <span style={{ color: '#10B981' }}>One Trip at a Time.</span>
      </h1>
      <p style={{
        fontFamily: 'Open Sans, sans-serif', fontSize: '17px',
        color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
        maxWidth: '560px',
      }}>
        Rate places for their green practices, share what you witnessed, and earn badges as you hit low-carbon milestones together with travelers worldwide.
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px', marginTop: '40px', maxWidth: '720px',
      }}>
        {[
          { value: '48,213', label: 'Eco-reviews submitted' },
          { value: '2,847', label: 'Active challenges' },
          { value: '186K', label: 'Badges earned' },
          { value: '92%', label: 'Verified ratings' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px', padding: '16px 18px',
          }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: 'white' }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </header>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'reviews' | 'challenges';

const TabSwitcher = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => (
  <div style={{
    background: 'white', borderRadius: '14px', padding: '6px',
    display: 'inline-flex', gap: '4px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
    border: '1px solid rgba(5,150,105,0.1)',
    marginBottom: '32px',
  }}>
    {([
      { id: 'reviews' as Tab, label: 'Eco-Reviews', icon: <StarIcon className="w-4 h-4" /> },
      { id: 'challenges' as Tab, label: 'Challenges', icon: <TrophyIcon className="w-4 h-4" /> },
    ]).map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px',
          border: 'none', cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px',
          background: active === t.id ? '#059669' : 'transparent',
          color: active === t.id ? 'white' : '#064E3B',
          transition: 'all 200ms ease',
        }}
      >
        {t.icon}
        {t.label}
      </button>
    ))}
  </div>
);

// ─── Reviews ──────────────────────────────────────────────────────────────────

type Review = {
  id: number;
  location: string;
  city: string;
  country: string;
  category: string;
  rating: number;
  reviewer: string;
  reviewerInitials: string;
  date: string;
  title: string;
  body: string;
  practices: string[];
  helpful: number;
  verified: boolean;
  color: string;
};

const reviews: Review[] = [
  {
    id: 1,
    location: 'Selva Verde Lodge', city: 'Sarapiquí', country: 'Costa Rica',
    category: 'Eco-Lodge', rating: 5,
    reviewer: 'Priya Sharma', reviewerInitials: 'PS', date: '3 days ago',
    title: 'Genuinely sustainable, not just greenwashed',
    body: 'Solar panels powering everything, on-site composting, rainwater harvesting visible across the property. Staff are mostly locals and they actively run reforestation programs guests can join.',
    practices: ['Solar Energy', 'Local Hiring', 'Reforestation', 'Zero Waste'],
    helpful: 142, verified: true, color: '#FBBF24',
  },
  {
    id: 2,
    location: 'Kyoto Bamboo Inn', city: 'Arashiyama', country: 'Japan',
    category: 'Boutique Hotel', rating: 4,
    reviewer: 'Marcus Weber', reviewerInitials: 'MW', date: '1 week ago',
    title: 'Strong on materials, weaker on energy',
    body: 'Beautiful traditional construction with sustainable bamboo and reclaimed wood. Locally-sourced food was excellent. Half-star deduction — energy mix is still mostly grid, no visible renewables.',
    practices: ['Local Food', 'Sustainable Materials', 'Water Conservation'],
    helpful: 89, verified: true, color: '#059669',
  },
  {
    id: 3,
    location: 'Atlas Mountain Trek Co.', city: 'Imlil', country: 'Morocco',
    category: 'Tour Operator', rating: 5,
    reviewer: 'Emma Rodriguez', reviewerInitials: 'ER', date: '2 weeks ago',
    title: 'Pack-in pack-out is non-negotiable for them',
    body: 'Guides actively educate every group on Leave No Trace. They contract directly with Berber families and a large share of fees goes back into village schools. Refreshing to see structural impact.',
    practices: ['Leave No Trace', 'Community Investment', 'Fair Wages'],
    helpful: 203, verified: true, color: '#10B981',
  },
  {
    id: 4,
    location: 'Floating Reed Restaurant', city: 'Puno', country: 'Peru',
    category: 'Restaurant', rating: 4,
    reviewer: 'James Okafor', reviewerInitials: 'JO', date: '3 weeks ago',
    title: 'Hyper-local sourcing done right',
    body: 'Everything on the menu was caught or grown within a few kilometers of Lake Titicaca. Owned and run by a Uros family. The only reason it isn\u2019t five stars is the single-use plastic for takeaway.',
    practices: ['Hyper-Local Food', 'Indigenous-Owned', 'Cultural Heritage'],
    helpful: 67, verified: false, color: '#FBBF24',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: 'inline-flex', gap: '2px', color: '#F59E0B' }}>
    {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= rating} className="w-4 h-4" />)}
  </div>
);

const ReviewCard = ({ review }: { review: Review }) => {
  const [hovered, setHovered] = useState(false);
  const [helpful, setHelpful] = useState(review.helpful);
  const [marked, setMarked] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: '16px', padding: '28px',
        boxShadow: hovered ? '0 10px 15px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        border: '1px solid rgba(5,150,105,0.08)',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: '16px', marginBottom: '16px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#064E3B' }}>
              {review.location}
            </h3>
            <span style={{
              fontFamily: 'Open Sans, sans-serif', fontSize: '11px', fontWeight: 600,
              background: `${review.color}1a`, color: review.color,
              padding: '3px 10px', borderRadius: '100px',
            }}>
              {review.category}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#064E3B', opacity: 0.6 }}>
            <MapPinIcon className="w-3 h-3" />
            <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '13px' }}>
              {review.city}, {review.country}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <StarRating rating={review.rating} />
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#064E3B' }}>
            {review.rating}.0 / 5
          </span>
        </div>
      </div>

      <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#064E3B', marginBottom: '8px' }}>
        {review.title}
      </h4>
      <p style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '14px', color: '#064E3B', opacity: 0.75, lineHeight: 1.65, marginBottom: '20px' }}>
        {review.body}
      </p>

      {/* Sustainable practice tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
        {review.practices.map(p => (
          <span key={p} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontFamily: 'Open Sans, sans-serif', fontSize: '11px', fontWeight: 600,
            background: 'rgba(251,191,36,0.1)', color: '#FBBF24',
            padding: '4px 10px', borderRadius: '100px',
          }}>
            <LeafIcon className="w-3 h-3" />
            {p}
          </span>
        ))}
      </div>

      {/* Footer: reviewer + helpful */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '16px', borderTop: '1px solid rgba(5,150,105,0.08)', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: `linear-gradient(135deg, ${review.color}33, ${review.color}66)`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px',
            color: review.color,
          }}>
            {review.reviewerInitials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#064E3B' }}>
                {review.reviewer}
              </span>
              {review.verified && (
                <span style={{ color: '#059669' }} title="Verified traveler">
                  <CheckBadgeIcon className="w-4 h-4" />
                </span>
              )}
            </div>
            <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '11px', color: '#064E3B', opacity: 0.55 }}>
              {review.date}
            </span>
          </div>
        </div>

        <button
          onClick={() => { setMarked(!marked); setHelpful(h => marked ? h - 1 : h + 1); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: marked ? 'rgba(5,150,105,0.1)' : 'transparent',
            border: `1px solid ${marked ? '#059669' : 'rgba(5,150,105,0.2)'}`,
            color: marked ? '#059669' : '#064E3B',
            padding: '6px 12px', borderRadius: '100px',
            fontFamily: 'Open Sans, sans-serif', fontWeight: 600, fontSize: '12px',
            cursor: 'pointer', transition: 'all 200ms ease',
          }}
        >
          <ThumbsUpIcon className="w-3 h-3" />
          {helpful}
        </button>
      </div>
    </article>
  );
};

const ReviewsSection = () => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Eco-Lodge', 'Boutique Hotel', 'Tour Operator', 'Restaurant'];
  const filtered = filter === 'All' ? reviews : reviews.filter(r => r.category === filter);

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <FilterIcon className="w-4 h-4" />
          <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '13px', color: '#064E3B', opacity: 0.6, marginRight: '4px' }}>
            Filter:
          </span>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '100px',
                border: '1px solid',
                borderColor: filter === f ? '#059669' : 'rgba(5,150,105,0.15)',
                background: filter === f ? '#059669' : 'white',
                color: filter === f ? 'white' : '#064E3B',
                fontFamily: 'Open Sans, sans-serif', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 200ms ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#FBBF24', color: 'white',
          padding: '10px 18px', borderRadius: '8px', border: 'none',
          fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(251,191,36,0.35)',
          transition: 'all 200ms ease',
        }}>
          <PencilIcon className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
      }}>
        {filtered.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          fontFamily: 'Open Sans, sans-serif', color: '#064E3B', opacity: 0.5,
        }}>
          No reviews in this category yet. Be the first to write one!
        </div>
      )}
    </div>
  );
};

// ─── Challenges ───────────────────────────────────────────────────────────────

type Challenge = {
  id: number;
  title: string;
  description: string;
  reward: string;
  points: number;
  badge: string;
  badgeColor: string;
  badgeIcon: React.ReactNode;
  category: 'Active' | 'Featured' | 'Streak';
  progress: number;
  total: number;
  unit: string;
  participants: number;
  daysLeft: number;
};

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Low Carbon Week',
    description: 'Keep your daily travel emissions under 5kg CO\u2082 for 7 consecutive days.',
    reward: 'Carbon Crusher Badge', points: 500,
    badge: 'Carbon Crusher', badgeColor: '#FBBF24',
    badgeIcon: <LeafIcon />,
    category: 'Active',
    progress: 5, total: 7, unit: 'days',
    participants: 12483, daysLeft: 2,
  },
  {
    id: 2,
    title: 'Train Over Plane',
    description: 'Choose rail travel over flights for 3 trips of 500km or less.',
    reward: 'Rail Champion Badge', points: 750,
    badge: 'Rail Champion', badgeColor: '#059669',
    badgeIcon: <BoltIcon />,
    category: 'Featured',
    progress: 1, total: 3, unit: 'trips',
    participants: 8201, daysLeft: 28,
  },
  {
    id: 3,
    title: 'Eco-Reviewer Streak',
    description: 'Write 10 verified eco-reviews of certified-green stays this month.',
    reward: 'Community Voice Badge', points: 400,
    badge: 'Community Voice', badgeColor: '#10B981',
    badgeIcon: <PencilIcon />,
    category: 'Streak',
    progress: 7, total: 10, unit: 'reviews',
    participants: 4521, daysLeft: 12,
  },
  {
    id: 4,
    title: 'Plant a Forest',
    description: 'Offset 1 ton of CO\u2082 by supporting verified reforestation partners.',
    reward: 'Forest Guardian Badge', points: 1000,
    badge: 'Forest Guardian', badgeColor: '#FBBF24',
    badgeIcon: <GlobeIcon />,
    category: 'Featured',
    progress: 720, total: 1000, unit: 'kg',
    participants: 2987, daysLeft: 60,
  },
];

const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const [hovered, setHovered] = useState(false);
  const pct = (challenge.progress / challenge.total) * 100;
  const catColors: Record<Challenge['category'], string> = {
    Active: '#FBBF24',
    Featured: '#059669',
    Streak: '#F59E0B',
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: '16px', padding: '24px',
        boxShadow: hovered ? '0 10px 15px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        border: '1px solid rgba(5,150,105,0.08)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Category strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: catColors[challenge.category],
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: '12px', marginBottom: '14px', marginTop: '6px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: `${catColors[challenge.category]}1a`,
          color: catColors[challenge.category],
          padding: '4px 10px', borderRadius: '100px',
          fontFamily: 'Open Sans, sans-serif', fontSize: '11px', fontWeight: 700,
        }}>
          {challenge.category === 'Streak' && <FireIcon className="w-3 h-3" />}
          {challenge.category === 'Featured' && <StarIcon className="w-3 h-3" filled />}
          {challenge.category === 'Active' && <BoltIcon className="w-3 h-3" />}
          {challenge.category.toUpperCase()}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontFamily: 'Open Sans, sans-serif', fontSize: '12px', color: '#064E3B', opacity: 0.6,
        }}>
          ⏱ {challenge.daysLeft} days left
        </div>
      </div>

      {/* Badge + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        <div style={{
          width: '56px', height: '56px', flexShrink: 0,
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${challenge.badgeColor}, ${challenge.badgeColor}cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
          boxShadow: `0 6px 16px ${challenge.badgeColor}55`,
        }}>
          {challenge.badgeIcon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#064E3B', marginBottom: '2px' }}>
            {challenge.title}
          </h3>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontFamily: 'Open Sans, sans-serif', fontSize: '12px', fontWeight: 600,
            color: '#F59E0B',
          }}>
            <BoltIcon className="w-3 h-3" />
            +{challenge.points} pts · {challenge.badge}
          </div>
        </div>
      </div>

      <p style={{
        fontFamily: 'Open Sans, sans-serif', fontSize: '13px',
        color: '#064E3B', opacity: 0.7, lineHeight: 1.6, marginBottom: '20px',
      }}>
        {challenge.description}
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '6px',
        }}>
          <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '12px', fontWeight: 600, color: '#064E3B' }}>
            Progress
          </span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 700, color: catColors[challenge.category] }}>
            {challenge.progress} / {challenge.total} {challenge.unit}
          </span>
        </div>
        <div style={{
          height: '8px', background: 'rgba(5,150,105,0.1)',
          borderRadius: '100px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: `linear-gradient(90deg, ${catColors[challenge.category]}, ${catColors[challenge.category]}cc)`,
            borderRadius: '100px',
            transition: 'width 600ms ease',
          }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '16px', borderTop: '1px solid rgba(5,150,105,0.08)',
      }}>
        <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '12px', color: '#064E3B', opacity: 0.6 }}>
          {challenge.participants.toLocaleString()} joined
        </span>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'transparent', color: '#059669',
          border: 'none', padding: '4px 0',
          fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px',
          cursor: 'pointer', transition: 'gap 200ms ease',
        }}>
          Continue
          <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>
    </article>
  );
};

const earnedBadges = [
  { name: 'First Step', icon: <LeafIcon />, color: '#FBBF24', earned: true, date: 'Jan 2025' },
  { name: 'Plastic-Free', icon: <BoltIcon />, color: '#059669', earned: true, date: 'Mar 2025' },
  { name: 'Local Hero', icon: <MapPinIcon />, color: '#10B981', earned: true, date: 'Apr 2025' },
  { name: 'Streak: 7', icon: <FireIcon />, color: '#F59E0B', earned: true, date: 'Apr 2025' },
  { name: 'Carbon Crusher', icon: <LeafIcon />, color: '#FBBF24', earned: false, date: '' },
  { name: 'Rail Champion', icon: <BoltIcon />, color: '#059669', earned: false, date: '' },
];

const BadgeShelf = () => (
  <div style={{
    background: 'white', borderRadius: '16px', padding: '28px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    border: '1px solid rgba(5,150,105,0.08)',
    marginBottom: '24px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#064E3B', marginBottom: '2px' }}>
          Your Badge Collection
        </h3>
        <p style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '13px', color: '#064E3B', opacity: 0.6 }}>
          {earnedBadges.filter(b => b.earned).length} earned · {earnedBadges.filter(b => !b.earned).length} locked
        </p>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
        padding: '8px 16px', borderRadius: '100px',
        border: '1px solid rgba(245,158,11,0.3)',
      }}>
        <BoltIcon className="w-4 h-4" />
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#064E3B' }}>
          2,340 points
        </span>
      </div>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
      gap: '12px',
    }}>
      {earnedBadges.map(b => (
        <div
          key={b.name}
          style={{
            background: b.earned ? `linear-gradient(135deg, ${b.color}11, ${b.color}06)` : 'rgba(5,150,105,0.04)',
            border: `1px solid ${b.earned ? b.color + '33' : 'rgba(5,150,105,0.08)'}`,
            borderRadius: '12px', padding: '16px 12px',
            textAlign: 'center',
            opacity: b.earned ? 1 : 0.45,
            transition: 'transform 200ms ease',
            cursor: 'default',
          }}
          title={b.earned ? `Earned ${b.date}` : 'Not yet earned'}
        >
          <div style={{
            width: '44px', height: '44px',
            background: b.earned ? `linear-gradient(135deg, ${b.color}, ${b.color}cc)` : 'rgba(5,150,105,0.15)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: b.earned ? 'white' : '#064E3B',
            margin: '0 auto 8px',
            boxShadow: b.earned ? `0 4px 12px ${b.color}55` : 'none',
            filter: b.earned ? 'none' : 'grayscale(0.5)',
          }}>
            {b.icon}
          </div>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '12px', color: '#064E3B' }}>
            {b.name}
          </div>
          {b.earned && (
            <div style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '10px', color: '#064E3B', opacity: 0.5, marginTop: '2px' }}>
              {b.date}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const Leaderboard = () => {
  const leaders = [
    { rank: 1, name: 'Sofia Chen', points: 12480, badges: 24, you: false },
    { rank: 2, name: 'David Park', points: 11203, badges: 21, you: false },
    { rank: 3, name: 'Aisha Rahman', points: 9856, badges: 19, you: false },
    { rank: 47, name: 'You', points: 2340, badges: 4, you: true },
  ];

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '28px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      border: '1px solid rgba(5,150,105,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TrophyIcon className="w-5 h-5" />
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#064E3B' }}>
          This Week&apos;s Leaderboard
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {leaders.map(l => {
          const isPodium = l.rank <= 3;
          const podiumColors = ['#F59E0B', '#94A3B8', '#D97706'];
          return (
            <div
              key={l.rank}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: '10px',
                background: l.you ? 'rgba(5,150,105,0.08)' : 'transparent',
                border: l.you ? '1px solid rgba(5,150,105,0.2)' : '1px solid transparent',
              }}
            >
              <div style={{
                width: '32px', height: '32px', flexShrink: 0,
                background: isPodium ? podiumColors[l.rank - 1] : 'rgba(5,150,105,0.1)',
                color: isPodium ? 'white' : '#064E3B',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '13px',
              }}>
                {l.rank}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px',
                  color: l.you ? '#059669' : '#064E3B',
                }}>
                  {l.name}{l.you && ' (you)'}
                </div>
                <div style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '11px', color: '#064E3B', opacity: 0.55 }}>
                  {l.badges} badges
                </div>
              </div>
              <div style={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#064E3B',
              }}>
                {l.points.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      <button style={{
        width: '100%', marginTop: '16px',
        background: 'transparent', color: '#059669',
        border: '1px solid rgba(5,150,105,0.2)', padding: '10px',
        borderRadius: '8px', cursor: 'pointer',
        fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px',
        transition: 'all 200ms ease',
      }}>
        View Full Leaderboard
      </button>
    </div>
  );
};

const ChallengesSection = () => (
  <div>
    <BadgeShelf />

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
      gap: '24px',
    }} className="challenges-grid">
      <div>
        <h3 style={{
          fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px',
          color: '#064E3B', marginBottom: '16px',
        }}>
          Active Challenges
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {challenges.map(c => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      </div>

      <div style={{ position: 'sticky', top: '24px', alignSelf: 'start' }} className="leaderboard-col">
        <Leaderboard />
      </div>
    </div>

    <style>{`
      @media (max-width: 900px) {
        .challenges-grid { grid-template-columns: 1fr !important; }
        .leaderboard-col { position: static !important; }
      }
    `}</style>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityImpactPage() {
  const [tab, setTab] = useState<Tab>('reviews');

  return (
    <main style={{ minHeight: '100vh', background: '#ECFDF5' }}>
      <PageHeader />
      <section style={{ padding: '48px 24px 96px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <TabSwitcher active={tab} onChange={setTab} />
          {tab === 'reviews' ? <ReviewsSection /> : <ChallengesSection />}
        </div>
      </section>
    </main>
  );
}