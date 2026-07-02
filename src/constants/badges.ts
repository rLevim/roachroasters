export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  role: 'roach_roaster' | 'bugaphobe' | 'both';
  threshold: number | null;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { slug: 'first_blood', name: 'First Blood', description: 'First roach killed', icon: '🪳', category: 'kills', role: 'roach_roaster', threshold: 1 },
  { slug: 'exterminator_training', name: 'Exterminator in Training', description: '10 roaches killed', icon: '🔫', category: 'kills', role: 'roach_roaster', threshold: 10 },
  { slug: 'roach_wrangler', name: 'Roach Wrangler', description: '50 roaches killed', icon: '🤠', category: 'kills', role: 'roach_roaster', threshold: 50 },
  { slug: 'century_slayer', name: 'Century Slayer', description: '100 roaches killed', icon: '💯', category: 'kills', role: 'roach_roaster', threshold: 100 },
  { slug: 'the_exterminator', name: 'The Exterminator', description: '500 roaches killed', icon: '☠️', category: 'kills', role: 'roach_roaster', threshold: 500 },
  { slug: 'legendary_pest_control', name: 'Legendary Pest Control', description: '1,000 roaches killed', icon: '👑', category: 'kills', role: 'roach_roaster', threshold: 1000 },
  { slug: 'five_star_slayer', name: '5-Star Slayer', description: '10 five-star reviews received', icon: '⭐', category: 'reviews', role: 'roach_roaster', threshold: 10 },
  { slug: 'first_alert', name: 'First Alert Posted', description: 'Posted your first Roach Alert', icon: '🚨', category: 'bravery', role: 'bugaphobe', threshold: 1 },
  { slug: 'ten_alerts', name: '10 Alerts Resolved', description: '10 Roach Alerts resolved', icon: '🎯', category: 'bravery', role: 'bugaphobe', threshold: 10 },
  { slug: 'trusted_bugaphobe', name: 'Trusted Bugaphobe', description: '5+ reviews given', icon: '🤝', category: 'reviews', role: 'bugaphobe', threshold: 5 },
];

export const LEVELS = [
  { name: 'Rookie', minXp: 0 },
  { name: 'Exterminator In Training', minXp: 500 },
  { name: 'Roach Wrangler', minXp: 2000 },
  { name: 'Senior Slayer', minXp: 5000 },
  { name: 'Elite Roaster', minXp: 10000 },
  { name: 'The Exterminator', minXp: 25000 },
] as const;

export function getLevelForXp(xp: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i].name;
  }
  return LEVELS[0].name;
}

export function getNextLevel(xp: number): { name: string; minXp: number } | null {
  for (const level of LEVELS) {
    if (xp < level.minXp) return level;
  }
  return null;
}
