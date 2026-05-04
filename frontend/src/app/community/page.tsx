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
  date: string;
  title: string;
  body: string;
};

const reviews: Review[] = [
  {
    id: 1,
    location: 'Selva Verde Lodge',
    city: 'Sarapiquí', country: 'Costa Rica',
    category: 'Eco-Lodge', rating: 5,
    reviewer: 'Priya Sharma', date: '3 days ago',
    title: 'Genuinely sustainable, not just greenwashed',
    body: 'Solar panels powering everything, on-site composting, rainwater harvesting visible across the property. Staff are mostly locals and they actively run reforestation programs guests can join.',
  },
  {
    id: 2,
    location: 'Kyoto Bamboo Inn',
    city: 'Arashiyama', country: 'Japan',
    category: 'Boutique Hotel', rating: 4,
    reviewer: 'Marcus Weber', date: '1 week ago',
    title: 'Strong on materials, weaker on energy',
    body: 'Beautiful traditional construction with sustainable bamboo and reclaimed wood. Locally-sourced food was excellent. Half-star deduction — energy mix is still mostly grid, no visible renewables.',
  },
  {
    id: 3,
    location: 'Atlas Mountain Trek Co.',
    city: 'Imlil', country: 'Morocco',
    category: 'Tour Operator', rating: 5,
    reviewer: 'Emma Rodriguez', date: '2 weeks ago',
    title: 'Pack-in pack-out is non-negotiable for them',
    body: 'Guides actively educate every group on Leave No Trace. They contract directly with Berber families and a large share of fees goes back into village schools. Refreshing to see structural impact.',
  },
  {
    id: 4,
    location: 'Floating Reed Restaurant',
    city: 'Puno', country: 'Peru',
    category: 'Restaurant', rating: 4,
    reviewer: 'James Okafor', date: '3 weeks ago',
    title: 'Hyper-local sourcing done right',
    body: 'Everything on the menu was caught or grown within a few kilometers of Lake Titicaca. Owned and run by a Uros family. The only reason it isn\u2019t five stars is the single-use plastic for takeaway.',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: 'inline-flex', gap: '2px', color: '#F59E0B' }}>
    {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= rating} className="w-4 h-4" />)}
  </div>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <article style={{
    background: 'white', borderRadius: '16px', padding: '28px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    border: '1px solid rgba(5,150,105,0.08)',
  }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', gap: '16px', marginBottom: '16px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#064E3B', marginBottom: '6px' }}>
          {review.location}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#064E3B', opacity: 0.6 }}>
          <MapPinIcon className="w-3 h-3" />
          <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '13px' }}>
            {review.city}, {review.country} · {review.category}
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
    <p style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '14px', color: '#064E3B', opacity: 0.75, lineHeight: 1.65, marginBottom: '16px' }}>
      {review.body}
    </p>

    <div style={{
      paddingTop: '16px', borderTop: '1px solid rgba(5,150,105,0.08)',
      fontFamily: 'Open Sans, sans-serif', fontSize: '13px', color: '#064E3B', opacity: 0.7,
    }}>
      <strong style={{ color: '#064E3B', opacity: 1 }}>{review.reviewer}</strong> · {review.date}
    </div>
  </article>
);

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

const EmptyState = ({ label }: { label: string }) => (
  <div style={{
    background: 'white', borderRadius: '16px',
    padding: '80px 24px', textAlign: 'center',
    border: '1px dashed rgba(5,150,105,0.2)',
  }}>
    <p style={{
      fontFamily: 'Open Sans, sans-serif', fontSize: '14px',
      color: '#064E3B', opacity: 0.5,
    }}>
      {label} — coming next commit
    </p>
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
          {tab === 'reviews' ? <ReviewsSection /> : <EmptyState label="Challenges" />}
        </div>
      </section>
    </main>
  );
}