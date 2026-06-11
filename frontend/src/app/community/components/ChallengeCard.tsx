'use client';

import { useState } from 'react';
import { BoltIcon, FireIcon, StarIcon, ArrowRightIcon, LeafIcon, GlobeIcon, PencilIcon } from './Icons';
import type { Challenge } from './types';
import { useJoinCommunityChallenge, useUpdateCommunityChallengeProgress } from '@/hooks/useCommunity';

interface ChallengeCardProps {
  challenge: Challenge;
  isSignedIn: boolean;
}

const catColors: Record<Challenge['category'], string> = {
  Active: '#FBBF24',
  Featured: '#059669',
  Streak: '#F59E0B',
};

function BadgeIcon({ icon }: { icon: string }) {
  if (icon === 'bolt') return <BoltIcon />;
  if (icon === 'fire') return <FireIcon />;
  if (icon === 'globe') return <GlobeIcon />;
  if (icon === 'pencil') return <PencilIcon />;
  return <LeafIcon />;
}

export default function ChallengeCard({ challenge, isSignedIn }: ChallengeCardProps) {
  const [hovered, setHovered] = useState(false);
  const joinChallenge = useJoinCommunityChallenge();
  const updateProgress = useUpdateCommunityChallengeProgress();
  const pct = Math.min(100, (challenge.progress / challenge.total) * 100);
  const color = catColors[challenge.category];
  const enrolled = Boolean(challenge.joinedAt) || challenge.progress > 0 || Boolean(challenge.completedAt);
  const completed = Boolean(challenge.completedAt) || challenge.progress >= challenge.total;
  const busy = joinChallenge.isPending || updateProgress.isPending;
  const buttonLabel = !isSignedIn
    ? 'Log in'
    : completed
      ? 'Completed'
      : enrolled
        ? 'Continue'
        : 'Join';

  const handleAction = () => {
    if (!isSignedIn || completed || busy) return;
    if (!enrolled) {
      joinChallenge.mutate(challenge.id);
      return;
    }
    updateProgress.mutate({ id: challenge.id, progress: Math.min(challenge.total, challenge.progress + 1) });
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 transition-all duration-200 ${
        hovered ? 'shadow-lg -translate-y-0.5' : 'shadow-sm'
      }`}
    >
      {/* Category strip */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: color }} />

      {/* Header */}
      <div className="mb-3.5 mt-2 flex items-start justify-between gap-3">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: `${color}1a`, color }}
        >
          {challenge.category === 'Streak' && <FireIcon className="h-3 w-3" />}
          {challenge.category === 'Featured' && <StarIcon className="h-3 w-3" filled />}
          {challenge.category === 'Active' && <BoltIcon className="h-3 w-3" />}
          {challenge.category.toUpperCase()}
        </div>
        <span className="text-xs text-emerald-900/60">
          {challenge.daysLeft === null ? 'Open challenge' : `${challenge.daysLeft} days left`}
        </span>
      </div>

      {/* Badge + title */}
      <div className="mb-3 flex items-center gap-3.5">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${challenge.badgeColor}, ${challenge.badgeColor}cc)` }}
        >
          <BadgeIcon icon={challenge.badgeIcon} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-0.5 font-display text-lg font-bold text-emerald-900">{challenge.title}</h3>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            <BoltIcon className="h-3 w-3" />
            +{challenge.points} pts · {challenge.badge}
          </div>
        </div>
      </div>

      <p className="mb-5 text-sm text-emerald-900/70 leading-relaxed">{challenge.description}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900">Progress</span>
          <span className="font-display text-sm font-bold" style={{ color }}>
            {challenge.progress} / {challenge.total} {challenge.unit}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-emerald-100 pt-4">
        <span className="text-xs text-emerald-900/60">{challenge.participants.toLocaleString()} joined</span>
        <button
          onClick={handleAction}
          disabled={!isSignedIn || completed || busy}
          title={isSignedIn ? buttonLabel : 'Log in to join challenges'}
          className="inline-flex items-center gap-1.5 bg-transparent border-none text-emerald-600 py-1 font-semibold text-sm cursor-pointer transition-all duration-200 hover:gap-2.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Saving...' : buttonLabel}
          {!completed && <ArrowRightIcon className="h-3 w-3" />}
        </button>
      </div>
    </article>
  );
}
