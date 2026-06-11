export type Tab = 'reviews' | 'challenges';

export type Review = {
  id: string;
  userId?: string | null;
  locationId?: string | null;
  location: string;
  city?: string | null;
  country?: string | null;
  category: string;
  rating: number;
  reviewer: string;
  reviewerInitials: string;
  createdAt: string;
  title: string;
  body: string;
  practices: string[];
  helpful: number;
  verified: boolean;
  color: string;
  viewerMarkedHelpful: boolean;
  viewerCanEdit: boolean;
};

export type Challenge = {
  id: string;
  slug: string;
  title: string;
  description: string;
  reward: string;
  points: number;
  badge: string;
  badgeColor: string;
  badgeIcon: string;
  category: 'Active' | 'Featured' | 'Streak';
  progress: number;
  total: number;
  unit: string;
  participants: number;
  daysLeft: number | null;
  joinedAt?: string | null;
  completedAt?: string | null;
};

export type EarnedBadge = {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedAt?: string | null;
};

export type Leader = {
  id: string;
  rank: number;
  name: string;
  points: number;
  badges: number;
  you: boolean;
};
