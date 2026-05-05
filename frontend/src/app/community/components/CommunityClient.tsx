'use client';

import { useState } from 'react';
import PageHeader from './PageHeader';
import TabSwitcher from './TabSwitcher';
import ReviewsSection from './ReviewsSection';
import ChallengesSection from './ChallengesSection';
import { LeafIcon, BoltIcon, MapPinIcon, FireIcon, PencilIcon, GlobeIcon } from './Icons';
import { tokens } from '../tokens';
import type { Tab, Review, Challenge, EarnedBadge, Leader } from './types';

// ─── Static Data ──────────────────────────────────────────────────────────────

const REVIEWS: Review[] = [
  {
    id: 1,
    location: 'Selva Verde Lodge',
    city: 'Sarapiquí',
    country: 'Costa Rica',
    category: 'Eco-Lodge',
    rating: 5,
    reviewer: 'Priya Sharma',
    reviewerInitials: 'PS',
    date: '3 days ago',
    title: 'Genuinely sustainable, not just greenwashed',
    body: 'Solar panels powering everything, on-site composting, rainwater harvesting visible across the property. Staff are mostly locals and they actively run reforestation programs guests can join.',
    practices: ['Solar Energy', 'Local Hiring', 'Reforestation', 'Zero Waste'],
    helpful: 142,
    verified: true,
    color: tokens.cta,
  },
  {
    id: 2,
    location: 'Kyoto Bamboo Inn',
    city: 'Arashiyama',
    country: 'Japan',
    category: 'Boutique Hotel',
    rating: 4,
    reviewer: 'Marcus Weber',
    reviewerInitials: 'MW',
    date: '1 week ago',
    title: 'Strong on materials, weaker on energy',
    body: 'Beautiful traditional construction with sustainable bamboo and reclaimed wood. Locally-sourced food was excellent. Half-star deduction — energy mix is still mostly grid, no visible renewables.',
    practices: ['Local Food', 'Sustainable Materials', 'Water Conservation'],
    helpful: 89,
    verified: true,
    color: tokens.primary,
  },
  {
    id: 3,
    location: 'Atlas Mountain Trek Co.',
    city: 'Imlil',
    country: 'Morocco',
    category: 'Tour Operator',
    rating: 5,
    reviewer: 'Emma Rodriguez',
    reviewerInitials: 'ER',
    date: '2 weeks ago',
    title: 'Pack-in pack-out is non-negotiable for them',
    body: 'Guides actively educate every group on Leave No Trace. They contract directly with Berber families and a large share of fees goes back into village schools. Refreshing to see structural impact.',
    practices: ['Leave No Trace', 'Community Investment', 'Fair Wages'],
    helpful: 203,
    verified: true,
    color: tokens.secondary,
  },
  {
    id: 4,
    location: 'Floating Reed Restaurant',
    city: 'Puno',
    country: 'Peru',
    category: 'Restaurant',
    rating: 4,
    reviewer: 'James Okafor',
    reviewerInitials: 'JO',
    date: '3 weeks ago',
    title: 'Hyper-local sourcing done right',
    body: "Everything on the menu was caught or grown within a few kilometers of Lake Titicaca. Owned and run by a Uros family. The only reason it isn't five stars is the single-use plastic for takeaway.",
    practices: ['Hyper-Local Food', 'Indigenous-Owned', 'Cultural Heritage'],
    helpful: 67,
    verified: false,
    color: tokens.cta,
  },
];

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
            <ReviewsSection reviews={REVIEWS} />
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