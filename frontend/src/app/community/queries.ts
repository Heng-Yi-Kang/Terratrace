import { createClient } from '@/utils/supabase/client';
import { tokens } from './tokens';
import type { Review, Challenge, EarnedBadge, Leader } from './components/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryColor(category: string): string {
  switch (category) {
    case 'Boutique Hotel':
    case 'Accommodation':
      return tokens.primary;
    case 'Tour Operator':
    case 'Transport':
      return tokens.secondary;
    default:
      return tokens.cta;
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

type ReviewRow = Record<string, unknown>;

function mapRow(row: ReviewRow): Review {
  const loc = (Array.isArray(row.locations) ? row.locations[0] : row.locations) as Record<string, unknown> | null;
  const profile = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as Record<string, unknown> | null | undefined;
  const reviewer = (profile?.full_name as string | undefined) ?? 'Eco Traveler';
  const category = (loc?.category as string) ?? '';

  return {
    id: row.id as string,
    location: (loc?.name as string) ?? 'Unknown Location',
    city: (loc?.city as string) ?? '',
    country: (loc?.country as string) ?? '',
    category,
    rating: row.rating as number,
    reviewer,
    reviewerInitials: initials(reviewer),
    date: relativeDate(row.created_at as string),
    title: row.title as string,
    body: row.body as string,
    practices: (row.practices as string[]) ?? [],
    helpful: (row.helpful_count as number) ?? 0,
    verified: (row.verified as boolean) ?? false,
    color: categoryColor(category),
  };
}

export async function fetchReviews(): Promise<Review[]> {
  const supabase = createClient();
  if (!supabase) return [];

  // Try with profiles join first; fall back without it if the table is absent.
  let result = await supabase
    .from('eco_reviews')
    .select(`
      id, rating, title, body, practices, verified, created_at, helpful_count,
      locations ( name, city, country, category ),
      profiles ( full_name )
    `)
    .order('created_at', { ascending: false });

  if (result.error) {
    result = await supabase
      .from('eco_reviews')
      .select(`
        id, rating, title, body, practices, verified, created_at, helpful_count,
        locations ( name, city, country, category )
      `)
      .order('created_at', { ascending: false });
  }

  if (result.error || !result.data) return [];
  return (result.data as ReviewRow[]).map(mapRow);
}

export async function toggleHelpful(
  reviewId: string,
  userId: string,
  mark: boolean,
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  if (mark) {
    await supabase
      .from('review_helpful')
      .upsert({ review_id: reviewId, user_id: userId }, { onConflict: 'review_id,user_id' });
  } else {
    await supabase
      .from('review_helpful')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);
  }
}

// ─── Challenges ───────────────────────────────────────────────────────────────

type RawChallenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  total: number;
  unit: string;
  points: number;
  badge_name: string;
  badge_color: string;
  badge_icon: string;
  participants: number;
  ends_at: string | null;
};

// Returns challenges without `badgeIcon` (React node) — callers add the icon.
export type ChallengeData = Omit<Challenge, 'badgeIcon'> & { badgeIconKey: string };

export async function fetchChallenges(userId: string): Promise<ChallengeData[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data: challengesRaw, error } = await supabase
    .from('challenges')
    .select('id, title, description, category, total, unit, points, badge_name, badge_color, badge_icon, participants, ends_at');

  if (error || !challengesRaw) return [];
  const challenges = challengesRaw as RawChallenge[];

  const { data: progress } = await supabase
    .from('user_challenges')
    .select('challenge_id, progress')
    .eq('user_id', userId);

  const progressMap = new Map(
    ((progress ?? []) as { challenge_id: string; progress: number }[]).map(
      (p) => [p.challenge_id, p.progress],
    ),
  );

  return challenges.map((c) => {
    const daysLeft = c.ends_at
      ? Math.max(0, Math.round((new Date(c.ends_at).getTime() - Date.now()) / 86_400_000))
      : 0;

    return {
      id: c.id as unknown as number, // Challenge.id is typed as number; cast to satisfy type until schema is updated
      title: c.title,
      description: c.description,
      reward: `${c.badge_name} Badge`,
      points: c.points,
      badge: c.badge_name,
      badgeColor: c.badge_color,
      badgeIconKey: c.badge_icon,
      category: c.category as 'Active' | 'Featured' | 'Streak',
      progress: progressMap.get(c.id) ?? 0,
      total: c.total,
      unit: c.unit,
      participants: c.participants,
      daysLeft,
    };
  });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export async function fetchUserBadges(userId: string): Promise<EarnedBadge[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_name, badge_color, badge_icon, earned_at')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((row: { badge_name: string; badge_color: string; badge_icon: string; earned_at: string | null }) => ({
    name: row.badge_name,
    // icon is a React node — callers must substitute based on badge_icon key
    icon: null,
    color: row.badge_color,
    earned: true,
    date: row.earned_at
      ? new Date(row.earned_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '',
  }));
}

// ─── Points ───────────────────────────────────────────────────────────────────

export async function fetchUserPoints(userId: string): Promise<number> {
  const supabase = createClient();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single();

  if (error || !data) return 0;
  return (data as { points: number }).points ?? 0;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function fetchLeaderboard(userId: string): Promise<Leader[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, points, badge_count')
    .order('points', { ascending: false })
    .limit(10);

  if (error || !data) return [];

  const leaders = (data as Array<{ id: string; full_name: string | null; points: number; badge_count: number }>).map(
    (row, index) => ({
      rank: index + 1,
      name: row.full_name ?? 'Eco Traveler',
      points: row.points ?? 0,
      badges: row.badge_count ?? 0,
      you: row.id === userId,
    }),
  );

  // If the current user isn't in the top 10, append their row.
  const userInList = leaders.some((l) => l.you);
  if (!userInList) {
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name, points, badge_count')
      .eq('id', userId)
      .single();

    if (userData) {
      const u = userData as { full_name: string | null; points: number; badge_count: number };
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('points', u.points ?? 0);

      leaders.push({
        rank: (count ?? 0) + 1,
        name: u.full_name ?? 'You',
        points: u.points ?? 0,
        badges: u.badge_count ?? 0,
        you: true,
      });
    }
  }

  return leaders;
}

// ─── Locations ────────────────────────────────────────────────────────────────

export type LocationOption = {
  id: string;
  name: string;
  category: string;
  city: string;
  country: string;
};

export async function fetchLocations(): Promise<LocationOption[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('locations')
    .select('id, name, category, city, country')
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data as LocationOption[];
}

// ─── Create Review ────────────────────────────────────────────────────────────

export type NewReview = {
  locationId: string;
  userId: string;
  rating: number;
  title: string;
  body: string;
  practices: string[];
};

export async function createReview(
  input: NewReview,
): Promise<{ ok: boolean; error?: string }> {
  if (!input.locationId) return { ok: false, error: 'Please select a location.' };
  if (input.rating < 1 || input.rating > 5) return { ok: false, error: 'Rating must be between 1 and 5.' };
  if (input.title.trim().length < 3) return { ok: false, error: 'Title must be at least 3 characters.' };
  if (input.body.trim().length < 10) return { ok: false, error: 'Review must be at least 10 characters.' };

  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };

  const { error } = await supabase.from('eco_reviews').insert({
    location_id: input.locationId,
    user_id: input.userId,
    rating: input.rating,
    title: input.title.trim(),
    body: input.body.trim(),
    practices: input.practices,
    verified: false,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
