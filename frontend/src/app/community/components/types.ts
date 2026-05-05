export type Tab = 'reviews' | 'challenges';

export type Review = {
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

export type Challenge = {
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

export type EarnedBadge = {
  name: string;
  icon: React.ReactNode;
  color: string;
  earned: boolean;
  date: string;
};

export type Leader = {
  rank: number;
  name: string;
  points: number;
  badges: number;
  you: boolean;
};