export interface OnboardingSlide {
  title: string;
  description: string;
  icon: string;
}

export const BUGAPHOBE_ONBOARDING: OnboardingSlide[] = [
  { title: 'Post a Roach Alert', description: 'Spotted a cockroach? Post an alert and nearby Roach Roasters will come to your rescue!', icon: '🚨' },
  { title: 'Browse Nearby Roasters', description: 'See Roach Roasters near you with their ratings and kill counts.', icon: '🔍' },
  { title: 'Totally Free', description: 'RoachRoasters is 100% free. If you\'d like to say thanks, you can buy your Roaster a coffee via PayPal.', icon: '☕' },
  { title: 'Rate & Review', description: 'After each roast, rate your Roaster. Help the community find the best exterminators!', icon: '⭐' },
  { title: 'Safety First', description: 'Share your location via the secure in-app pin. Never share your address in plain text.', icon: '🛡️' },
];

export const ROASTER_ONBOARDING: OnboardingSlide[] = [
  { title: 'Get Roach Alerts', description: 'When someone nearby spots a cockroach, you\'ll get a notification. Respond fast to help out!', icon: '📱' },
  { title: 'Respond & Chat', description: 'Tap "I\'ll Roast It!" to respond. Chat with the Bugaphobe to coordinate.', icon: '💬' },
  { title: 'Earn Tips', description: 'Grateful Bugaphobes can send you a "Buy a Coffee" tip via PayPal. Set up your PayPal.me link in your profile!', icon: '☕' },
  { title: 'Level Up & Earn Badges', description: 'Every roast earns XP. Climb the ranks from Rookie to The Exterminator!', icon: '🏆' },
  { title: 'Set Up PayPal.me', description: 'Add your PayPal.me username in your profile so Bugaphobes can tip you. It\'s optional but appreciated!', icon: '🔗' },
];
