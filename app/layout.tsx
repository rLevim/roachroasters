import type { Metadata, Viewport } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-assistant',
  display: 'swap',
});
import { AuthInitializer } from '@/components/AuthInitializer';
import { NotificationInit } from '@/components/NotificationInit';
import { ProfileLinkBanner } from '@/components/ProfileLinkBanner';
import { ToastContainer } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientProviders } from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'RoachRoasters - Fear No Roach',
  description: 'Connect with Roach Roasters near you to handle your cockroach problems. Post alerts, get matched, and have your pest problem solved fast.',
  manifest: '/manifest.json',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: 'RoachRoasters - Fear No Roach',
    description: 'The marketplace for cockroach removal. Post an alert and get matched with a Roach Roaster near you.',
    type: 'website',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#534AB7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={assistant.variable}>
      <body className="bg-lavender min-h-screen font-sans antialiased">
        <ClientProviders>
          <AuthInitializer />
          <NotificationInit />
          <ProfileLinkBanner />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <ToastContainer />
        </ClientProviders>
      </body>
    </html>
  );
}
