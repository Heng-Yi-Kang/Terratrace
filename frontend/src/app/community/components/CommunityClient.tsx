'use client';

import { useState } from 'react';
import PageHeader from './PageHeader';
import TabSwitcher from './TabSwitcher';
import ReviewsSection from './ReviewsSection';
import ChallengesSection from './ChallengesSection';
import type { Tab } from './types';
import {
  useCommunityBadges,
  useCommunityChallenges,
  useCommunityLeaderboard,
  useCommunityReviews,
  useCommunitySummary,
} from '@/hooks/useCommunity';
import { useUser } from '@/hooks/useUser';

export default function CommunityClient() {
  const [tab, setTab] = useState<Tab>('reviews');
  const { data: user } = useUser();
  const [reviewFilter, setReviewFilter] = useState('All');
  const reviews = useCommunityReviews(reviewFilter);
  const challenges = useCommunityChallenges();
  const badges = useCommunityBadges();
  const leaders = useCommunityLeaderboard();
  const summary = useCommunitySummary();

  const isLoading =
    tab === 'reviews'
      ? reviews.isLoading
      : challenges.isLoading || badges.isLoading || leaders.isLoading || summary.isLoading;
  const isError =
    tab === 'reviews'
      ? reviews.isError
      : challenges.isError || badges.isError || leaders.isError || summary.isError;

  return (
    <main className="min-h-screen bg-emerald-50">
      <PageHeader summary={summary.data} />
      <section className="px-6 py-12 lg:pb-24">
        <div className="mx-auto max-w-6xl">
          <TabSwitcher active={tab} onChange={setTab} />

          {isLoading && (
            <div className="rounded-xl border border-emerald-100 bg-white p-8 text-center text-sm font-semibold text-emerald-900/60 shadow-sm">
              Loading community impact data...
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-red-100 bg-white p-8 text-center text-sm font-semibold text-red-600 shadow-sm">
              Community impact data could not be loaded.
            </div>
          )}

          {!isLoading && !isError && tab === 'reviews' && (
            <ReviewsSection
              reviews={reviews.data ?? []}
              filter={reviewFilter}
              onFilterChange={setReviewFilter}
              isSignedIn={!!user}
            />
          )}

          {!isLoading && !isError && tab === 'challenges' && (
            <ChallengesSection
              challenges={challenges.data ?? []}
              badges={badges.data ?? []}
              leaders={leaders.data ?? []}
              points={summary.data?.points ?? 0}
              isSignedIn={!!user}
            />
          )}
        </div>
      </section>
    </main>
  );
}
