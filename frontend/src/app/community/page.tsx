'use client';

import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

const LeafIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
  </svg>
);

const StarIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const TrophyIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
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

// ─── Empty placeholder ────────────────────────────────────────────────────────

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
          {tab === 'reviews'
            ? <EmptyState label="Eco-reviews" />
            : <EmptyState label="Challenges" />}
        </div>
      </section>
    </main>
  );
}