'use client';

import { useState } from 'react';
import PageHeader from './PageHeader';
import TabSwitcher from './TabSwitcher';
import ReviewsSection from './ReviewsSection';
import ChallengesSection from './ChallengesSection';
import { LeafIcon, BoltIcon, MapPinIcon, FireIcon, PencilIcon, GlobeIcon } from './Icons';
import { tokens } from '../tokens';
import type { Tab, Challenge, EarnedBadge, Leader } from './types';

// ─── Static Data ──────────────────────────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Low Carbon Week',
    description: 'Keep your daily travel emissions under 5kg CO₂ for 7 consecutive days.',
    reward: 'Carbon Crusher Badge',
    points: 500,
    badge: 'Carbon Crusher',
    badgeColor: tokens.cta,
    badgeIcon: <LeafIcon />,
    category: 'Active',
    progress: 5,
    total: 7,
    unit: 'days',
    participants: 12483,
    daysLeft: 2,
  },
  {
    id: 2,
    title: 'Train Over Plane',
    description: 'Choose rail travel over flights for 3 trips of 500km or less.',
    reward: 'Rail Champion Badge',
    points: 750,
    badge: 'Rail Champion',
    badgeColor: tokens.primary,
    badgeIcon: <BoltIcon />,
    category: 'Featured',
    progress: 1,
    total: 3,
    unit: 'trips',
    participants: 8201,
    daysLeft: 28,
  },
  {
    id: 3,
    title: 'Eco-Reviewer Streak',
    description: 'Write 10 verified eco-reviews of certified-green stays this month.',
    reward: 'Community Voice Badge',
    points: 400,
    badge: 'Community Voice',
    badgeColor: tokens.secondary,
    badgeIcon: <PencilIcon />,
    category: 'Streak',
    progress: 7,
    total: 10,
    unit: 'reviews',
    participants: 4521,
    daysLeft: 12,
  },
  {
    id: 4,
    title: 'Plant a Forest',
    description: 'Offset 1 ton of CO₂ by supporting verified reforestation partners.',
    reward: 'Forest Guardian Badge',
    points: 1000,
    badge: 'Forest Guardian',
    badgeColor: tokens.cta,
    badgeIcon: <GlobeIcon />,
    category: 'Featured',
    progress: 720,
    total: 1000,
    unit: 'kg',
    participants: 2987,
    daysLeft: 60,
  },
];

const BADGES: EarnedBadge[] = [
  { name: 'First Step', icon: <LeafIcon />, color: tokens.cta, earned: true, date: 'Jan 2025' },
  { name: 'Plastic-Free', icon: <BoltIcon />, color: tokens.primary, earned: true, date: 'Mar 2025' },
  { name: 'Local Hero', icon: <MapPinIcon />, color: tokens.secondary, earned: true, date: 'Apr 2025' },
  { name: 'Streak: 7', icon: <FireIcon />, color: tokens.streak, earned: true, date: 'Apr 2025' },
  { name: 'Carbon Crusher', icon: <LeafIcon />, color: tokens.cta, earned: false, date: '' },
  { name: 'Rail Champion', icon: <BoltIcon />, color: tokens.primary, earned: false, date: '' },
];

const LEADERS: Leader[] = [
  { rank: 1, name: 'Sofia Chen', points: 12480, badges: 24, you: false },
  { rank: 2, name: 'David Park', points: 11203, badges: 21, you: false },
  { rank: 3, name: 'Aisha Rahman', points: 9856, badges: 19, you: false },
  { rank: 47, name: 'You', points: 2340, badges: 4, you: true },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CommunityClient() {
  const [tab, setTab] = useState<Tab>('reviews');

  return (
    <main className="min-h-screen bg-emerald-50">
      <PageHeader />
      <section className="px-6 py-12 lg:pb-24">
        <div className="mx-auto max-w-6xl">
          <TabSwitcher active={tab} onChange={setTab} />
          {tab === 'reviews' ? (
            <ReviewsSection />
          ) : (
            <ChallengesSection
              challenges={CHALLENGES}
              badges={BADGES}
              leaders={LEADERS}
              points={2340}
            />
          )}
        </div>
      </section>
    </main>
  );
}