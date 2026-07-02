export interface OnboardingSlide {
  title: string;
  description: string;
  icon: string;
}

export const BUGAPHOBE_ONBOARDING: OnboardingSlide[] = [
  { title: 'Post a Roach Alert', description: 'Spotted a cockroach? Post an alert and nearby Roach Roasters will come to your rescue!', icon: '🚨' },
  { title: 'Browse Nearby Roasters', description: 'See Roach Roasters near you with their ratings, prices, and kill counts.', icon: '🔍' },
  { title: 'Safe & Secure Payments', description: 'Pay securely through the app. You only get charged after you approve the completed roast.', icon: '💳' },
  { title: 'Rate & Review', description: 'After each roast, rate your Roaster. Help the community find the best exterminators!', icon: '⭐' },
  { title: 'Safety First', description: 'Share your location via the secure in-app pin. Never share your address in plain text.', icon: '🛡️' },
];

export const ROASTER_ONBOARDING: OnboardingSlide[] = [
  { title: 'Get Roach Alerts', description: 'When someone nearby spots a cockroach, you\'ll get a notification. Respond fast to get the job!', icon: '📱' },
  { title: 'Respond & Chat', description: 'Tap "I\'ll Roast It!" to respond. Chat with the Bugaphobe to coordinate.', icon: '💬' },
  { title: 'Get Paid Monthly', description: 'Set your price. After the Bugaphobe approves, earnings are sent to your PayPal monthly.', icon: '💰' },
  { title: 'Level Up & Earn Badges', description: 'Every roast earns XP. Climb the ranks from Rookie to The Exterminator!', icon: '🏆' },
  { title: 'Set Up PayPal', description: 'Add your PayPal email in your profile to receive monthly payouts. Easy!', icon: '🔗' },
];
