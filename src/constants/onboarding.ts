export interface OnboardingSlide {
  titleKey: string;
  descKey: string;
  icon: string;
}

export const BUGAPHOBE_ONBOARDING: OnboardingSlide[] = [
  { titleKey: 'ob.b1.title', descKey: 'ob.b1.desc', icon: '🚨' },
  { titleKey: 'ob.b2.title', descKey: 'ob.b2.desc', icon: '🔍' },
  { titleKey: 'ob.b3.title', descKey: 'ob.b3.desc', icon: '☕' },
  { titleKey: 'ob.b4.title', descKey: 'ob.b4.desc', icon: '⭐' },
  { titleKey: 'ob.b5.title', descKey: 'ob.b5.desc', icon: '🛡️' },
];

export const ROASTER_ONBOARDING: OnboardingSlide[] = [
  { titleKey: 'ob.r1.title', descKey: 'ob.r1.desc', icon: '📱' },
  { titleKey: 'ob.r2.title', descKey: 'ob.r2.desc', icon: '💬' },
  { titleKey: 'ob.r3.title', descKey: 'ob.r3.desc', icon: '☕' },
  { titleKey: 'ob.r4.title', descKey: 'ob.r4.desc', icon: '🏆' },
  { titleKey: 'ob.r5.title', descKey: 'ob.r5.desc', icon: '🔗' },
];
