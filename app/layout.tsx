import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthInitializer } from '@/components/AuthInitializer';
import { NotificationInit } from '@/components/NotificationInit';
import { ToastContainer } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
    <html lang="en">
      <body className="bg-lavender min-h-screen font-sans antialiased">
        <AuthInitializer />
        <NotificationInit />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ToastContainer />
      </body>
    </html>
  );
}
