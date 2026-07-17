'use client';

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';

export type Lang = 'en' | 'he';

type TranslationValue = string | Record<string, unknown>;
type Translations = Record<string, TranslationValue>;

const en: Translations = {
  // Navbar
  'nav.home': 'Home',
  'nav.roasters': 'Roasters',
  'nav.alerts': 'Alerts',
  'nav.activity': 'Activity',
  'nav.stats': 'Stats',
  'nav.profile': 'Profile',
  'nav.leaderboard': 'Leaderboard',
  'nav.support': 'Help & Support',
  'nav.verify': 'Get Verified',
  'nav.signOut': 'Sign Out',

  // Landing page
  'landing.login': 'Log In',
  'landing.signup': 'Sign Up',
  'landing.hero.title1': 'See a roach?',
  'landing.hero.title2': 'Get it handled.',
  'landing.hero.desc': 'RoachRoasters connects people who spot cockroaches with brave heroes who eliminate them — fast, free, and on demand.',
  'landing.hero.cta': 'Get Started Free',
  'landing.hero.howItWorks': 'How It Works',
  'landing.hero.free': '100% free to use. No fees, no subscriptions.',

  'landing.howItWorks.title': 'How It Works',
  'landing.howItWorks.desc': 'From spotting a roach to getting it handled — the whole process takes minutes.',
  'landing.howItWorks.step1.title': 'Spot a Roach',
  'landing.howItWorks.step1.desc': 'Post an alert with your location and how urgent it is. Nearby Roasters get notified instantly.',
  'landing.howItWorks.step2.title': 'Get Matched',
  'landing.howItWorks.step2.desc': 'A verified Roach Roaster accepts your alert and heads your way. Chat in real-time to coordinate.',
  'landing.howItWorks.step3.title': 'Problem Solved',
  'landing.howItWorks.step3.desc': 'The roach is gone. Rate your Roaster and get on with your roach-free life.',

  'landing.preview.title': 'See It in Action',
  'landing.preview.desc': 'Real-time chat, instant alerts, and seamless coordination — all from your phone.',
  'landing.preview.browse': 'Browse Alerts',
  'landing.preview.chat': 'Real-time Chat',
  'landing.preview.dashboard': 'Your Dashboard',

  'landing.twoSides.title': 'Two Sides, One Platform',
  'landing.twoSides.bugaphobes': 'Bugaphobes',
  'landing.twoSides.bugaphobes.desc': "Terrified of cockroaches? You're not alone. Post an alert and a Roach Roaster will come save the day — no judgment, just relief.",
  'landing.twoSides.bugaphobes.1': 'Post alerts in seconds',
  'landing.twoSides.bugaphobes.2': 'Real-time chat with your Roaster',
  'landing.twoSides.bugaphobes.3': 'Completely free to use',
  'landing.twoSides.roasters': 'Roach Roasters',
  'landing.twoSides.roasters.desc': "Not afraid of a few roaches? Be a hero for those who need it. Accept alerts, eliminate roaches, and earn tips from grateful Bugaphobes.",
  'landing.twoSides.roasters.1': 'Help people and be a hero',
  'landing.twoSides.roasters.2': 'Receive "Buy a Coffee" tips',
  'landing.twoSides.roasters.3': 'Climb the leaderboard',

  'landing.stats.available': 'Available',
  'landing.stats.response': 'Response Time',
  'landing.stats.verified': 'Verified Roasters',
  'landing.stats.fees': 'No Hidden Fees',

  'landing.cta.title': 'Ready to live roach-free?',
  'landing.cta.desc': "Join RoachRoasters today — it's completely free. Whether you need help or want to be the hero.",
  'landing.cta.button': "Sign Up Now — It's Free",

  'landing.support.title': 'Liked the service?',
  'landing.support.desc': 'RoachRoasters is free for everyone. If you enjoy the platform, buy me a coffee so I can keep expanding it!',
  'landing.support.button': 'Buy Me a Coffee',

  'landing.footer.terms': 'Terms of Use',

  // Home page
  'home.welcome': 'Hey,',
  'home.bugaphobe': 'Bugaphobe',
  'home.roaster': 'Roach Roaster',
  'home.bravery': 'Bravery',
  'home.reviews': 'Reviews',
  'home.rating': 'Rating',
  'home.postAlert': 'Post a Roach Alert',
  'home.myAlerts': 'My Alerts',
  'home.nearbyAlerts': 'Nearby Alerts',
  'home.noAlerts': 'No alerts yet',
  'home.responses': 'responses',

  // Browse
  'browse.roasters': 'Find a Roaster',
  'browse.alerts': 'Nearby Alerts',

  // Activity
  'activity.title': 'Activity',
  'activity.active': 'Active',
  'activity.completed': 'Completed',
  'activity.noJobs': 'No jobs yet',

  // Chat
  'chat.typeMessage': 'Type a message...',
  'chat.tipRoaster': 'Buy a Coffee for',
  'chat.jobCompleted': 'Job completed',

  // Profile
  'profile.title': 'Profile',
  'profile.edit': 'Edit Profile',
  'profile.save': 'Save',
  'profile.cancel': 'Cancel',
  'profile.displayName': 'Display Name',
  'profile.bio': 'Bio',
  'profile.paypalMe': 'PayPal.me Username',
  'profile.jobsDone': 'Jobs Done',
  'profile.xp': 'XP',

  // Role select
  'role.title': 'Choose Your Side',
  'role.subtitle': 'Choose your role to get started',
  'role.bugaphobe': "I'm afraid of cockroaches and need someone brave to come deal with them!",
  'role.roaster': "Cockroaches don't scare me! I'll help others and be a hero.",
  'role.continue': 'Continue',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.retry': 'Try Again',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.submit': 'Submit',
  'common.close': 'Close',
};

const he: Translations = {
  // Navbar
  'nav.home': 'בית',
  'nav.roasters': 'ג׳וק-קוטלים',
  'nav.alerts': 'התראות',
  'nav.activity': 'פעילות',
  'nav.stats': 'סטטיסטיקה',
  'nav.profile': 'פרופיל',
  'nav.leaderboard': 'טבלת מובילים',
  'nav.support': 'עזרה ותמיכה',
  'nav.verify': 'אימות חשבון',
  'nav.signOut': 'התנתק',

  // Landing page
  'landing.login': 'התחברות',
  'landing.signup': 'הרשמה',
  'landing.hero.title1': 'ראית ג׳וק?',
  'landing.hero.title2': 'נטפל בזה.',
  'landing.hero.desc': 'ג׳וק-קוטל מחבר בין אנשים שמבחינים בג׳וקים לגיבורים אמיצים שמסלקים אותם — מהר, בחינם, ולפי דרישה.',
  'landing.hero.cta': 'התחל בחינם',
  'landing.hero.howItWorks': 'איך זה עובד',
  'landing.hero.free': '100% חינם. ללא עמלות, ללא מנויים.',

  'landing.howItWorks.title': 'איך זה עובד',
  'landing.howItWorks.desc': 'מרגע שמזהים ג׳וק ועד שמטפלים בו — כל התהליך לוקח דקות.',
  'landing.howItWorks.step1.title': 'זיהית ג׳וק',
  'landing.howItWorks.step1.desc': 'פרסם התראה עם המיקום שלך ורמת הדחיפות. ג׳וק-קוטלים בסביבה מקבלים הודעה מיידית.',
  'landing.howItWorks.step2.title': 'התאמה',
  'landing.howItWorks.step2.desc': 'ג׳וק-קוטל מאומת מקבל את ההתראה ויוצא לדרך. שוחחו בצ׳אט בזמן אמת לתיאום.',
  'landing.howItWorks.step3.title': 'בעיה נפתרה',
  'landing.howItWorks.step3.desc': 'הג׳וק נעלם. דרגו את הג׳וק-קוטל שלכם והמשיכו בחיים ללא ג׳וקים.',

  'landing.preview.title': 'ראו את זה בפעולה',
  'landing.preview.desc': 'צ׳אט בזמן אמת, התראות מיידיות, ותיאום חלק — הכל מהטלפון.',
  'landing.preview.browse': 'עיון בהתראות',
  'landing.preview.chat': 'צ׳אט בזמן אמת',
  'landing.preview.dashboard': 'לוח הבקרה שלך',

  'landing.twoSides.title': 'שני צדדים, פלטפורמה אחת',
  'landing.twoSides.bugaphobes': 'ג׳וקופובים',
  'landing.twoSides.bugaphobes.desc': 'מפחדים מג׳וקים? אתם לא לבד. פרסמו התראה וג׳וק-קוטל יגיע להציל את המצב — בלי שיפוטיות, רק הקלה.',
  'landing.twoSides.bugaphobes.1': 'פרסום התראות בשניות',
  'landing.twoSides.bugaphobes.2': 'צ׳אט בזמן אמת עם הג׳וק-קוטל',
  'landing.twoSides.bugaphobes.3': 'חינם לחלוטין',
  'landing.twoSides.roasters': 'ג׳וק-קוטלים',
  'landing.twoSides.roasters.desc': 'לא מפחדים מכמה ג׳וקים? היו גיבורים למי שצריך. קבלו התראות, סלקו ג׳וקים, וקבלו טיפים מג׳וקופובים אסירי תודה.',
  'landing.twoSides.roasters.1': 'עזרו לאנשים והיו גיבורים',
  'landing.twoSides.roasters.2': 'קבלו טיפים "קנו לי קפה"',
  'landing.twoSides.roasters.3': 'טפסו בטבלת המובילים',

  'landing.stats.available': 'זמין',
  'landing.stats.response': 'זמן תגובה',
  'landing.stats.verified': 'ג׳וק-קוטלים מאומתים',
  'landing.stats.fees': 'ללא עמלות נסתרות',

  'landing.cta.title': 'מוכנים לחיים ללא ג׳וקים?',
  'landing.cta.desc': 'הצטרפו לג׳וק-קוטל היום — זה לגמרי בחינם. בין אם אתם צריכים עזרה או רוצים להיות הגיבורים.',
  'landing.cta.button': 'הירשמו עכשיו — זה חינם',

  'landing.support.title': 'אהבתם את השירות?',
  'landing.support.desc': 'ג׳וק-קוטל חינמי לכולם. אם אתם נהנים מהפלטפורמה, קנו לי קפה כדי שאוכל להמשיך להרחיב אותה!',
  'landing.support.button': 'קנו לי קפה',

  'landing.footer.terms': 'תנאי שימוש',

  // Home page
  'home.welcome': 'היי,',
  'home.bugaphobe': 'ג׳וקופוב/ית',
  'home.roaster': 'ג׳וק-קוטל',
  'home.bravery': 'אומץ',
  'home.reviews': 'ביקורות',
  'home.rating': 'דירוג',
  'home.postAlert': 'פרסם התראת ג׳וק',
  'home.myAlerts': 'ההתראות שלי',
  'home.nearbyAlerts': 'התראות בסביבה',
  'home.noAlerts': 'אין התראות עדיין',
  'home.responses': 'תגובות',

  // Browse
  'browse.roasters': 'מצא ג׳וק-קוטל',
  'browse.alerts': 'התראות בסביבה',

  // Activity
  'activity.title': 'פעילות',
  'activity.active': 'פעיל',
  'activity.completed': 'הושלם',
  'activity.noJobs': 'אין משימות עדיין',

  // Chat
  'chat.typeMessage': 'כתוב הודעה...',
  'chat.tipRoaster': 'קנה קפה ל',
  'chat.jobCompleted': 'המשימה הושלמה',

  // Profile
  'profile.title': 'פרופיל',
  'profile.edit': 'עריכת פרופיל',
  'profile.save': 'שמור',
  'profile.cancel': 'ביטול',
  'profile.displayName': 'שם תצוגה',
  'profile.bio': 'ביו',
  'profile.paypalMe': 'שם משתמש PayPal.me',
  'profile.jobsDone': 'משימות שהושלמו',
  'profile.xp': 'ניסיון',

  // Role select
  'role.title': 'בחרו צד',
  'role.subtitle': 'בחרו תפקיד כדי להתחיל',
  'role.bugaphobe': 'אני מפחד/ת מג׳וקים וצריך/ה מישהו אמיץ שיטפל בהם!',
  'role.roaster': 'ג׳וקים לא מפחידים אותי! אני אעזור לאחרים ואהיה גיבור.',
  'role.continue': 'המשך',

  // Common
  'common.loading': 'טוען...',
  'common.error': 'משהו השתבש',
  'common.retry': 'נסו שוב',
  'common.back': 'חזרה',
  'common.next': 'הבא',
  'common.submit': 'שלח',
  'common.close': 'סגור',
};

const translations: Record<Lang, Translations> = { en, he };

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  dir: 'ltr',
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('roachroasters-lang') as Lang | null;
    if (saved === 'he' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('roachroasters-lang', newLang);
  }, []);

  const t = useCallback(
    (key: string) => {
      const val = translations[lang][key];
      if (typeof val === 'string') return val;
      return key;
    },
    [lang]
  );

  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
