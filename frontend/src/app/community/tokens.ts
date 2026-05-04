/**
 * Design tokens for the Community Impact module.
 *
 * Mirrors the green palette from globals.css and the landing page hero.
 */

export const tokens = {
  // Brand
  primary:    '#059669',  // emerald-600
  secondary:  '#10B981',  // emerald-500
  cta:        '#FBBF24',  // amber (matches "Start Your Eco Journey" button)
  background: '#ECFDF5',  // emerald-50
  text:       '#064E3B',  // emerald-900

  // Functional accents
  amber:  '#F59E0B',  // ratings, points, streak callouts
  streak: '#F59E0B',  // legacy alias for streak/fire categories
} as const;

export type Token = keyof typeof tokens;