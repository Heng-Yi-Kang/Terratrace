'use client';

import ChallengeCard from './ChallengeCard';
import BadgeShelf from './BadgeShelf';
import Leaderboard from './Leaderboard';
import type { Challenge, EarnedBadge, Leader } from './types';

interface ChallengesSectionProps {
  challenges: Challenge[];
  badges: EarnedBadge[];
  leaders: Leader[];
  points: number;
  isSignedIn: boolean;
}

export default function ChallengesSection({ challenges, badges, leaders, points, isSignedIn }: ChallengesSectionProps) {
  return (
    <div>
      <BadgeShelf badges={badges} points={points} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenges grid */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 font-display text-xl font-bold text-emerald-900">Active Challenges</h3>
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">
            {challenges.map(c => <ChallengeCard key={c.id} challenge={c} isSignedIn={isSignedIn} />)}
          </div>
          {challenges.length === 0 && (
            <div className="rounded-xl border border-emerald-100 bg-white p-8 text-center text-sm font-semibold text-emerald-900/50">
              No active challenges are available yet.
            </div>
          )}
        </div>

        {/* Sticky leaderboard */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Leaderboard leaders={leaders} />
          </div>
        </div>
      </div>
    </div>
  );
}
