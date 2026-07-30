'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-purple-deep">
      <nav className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="RoachRoasters" className="w-8 h-8 object-contain" />
          <span className="text-lg font-black text-white tracking-wide">RoachRoasters</span>
        </Link>
        <Link href="/" className="text-sm text-purple-light hover:text-white transition-colors">
          Back to Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-ink mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: July 30, 2026</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <p>This Privacy Policy explains how RoachRoasters (&quot;RoachRoasters,&quot; &quot;we,&quot; &quot;us&quot;) collects, uses, and shares information when you use our website and app (the &quot;Service&quot;). RoachRoasters is a community platform that connects people who need help with cockroaches (&quot;Bugaphobes&quot;) with people willing to help (&quot;Roach Roasters&quot;). By using the Service, you agree to this Policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">1. Information We Collect</h2>
              <p><strong>Account information.</strong> When you create an account we collect your email address and password (passwords are stored in hashed form by our authentication provider), and your display name.</p>
              <p className="mt-2"><strong>Sign-in with Google or Facebook.</strong> If you sign in using Google or Facebook, we receive basic profile information from that provider — typically your name, email address, and profile picture. We do not receive your Google or Facebook password.</p>
              <p className="mt-2"><strong>Profile information.</strong> Information you choose to add to your profile, such as a profile photo, short bio, city, a social/profile link, your role (Bugaphobe or Roach Roaster), and, for Roach Roasters, a notification radius and a PayPal.me username.</p>
              <p className="mt-2"><strong>Location.</strong> When you post a roach alert or share your location, we collect your device&apos;s approximate geographic coordinates (latitude and longitude). We use this to match alerts with nearby Roach Roasters. You can control location access through your browser or device settings.</p>
              <p className="mt-2"><strong>Content and activity.</strong> Alerts, jobs, chat messages, reviews and ratings, and support requests you submit through the Service.</p>
              <p className="mt-2"><strong>Payment information.</strong> Tips are optional. Card payments are processed by Stripe; we do not store your full card number — we may retain limited details such as the card brand and last four digits. PayPal.me tips occur directly between users on PayPal and are subject to PayPal&apos;s own policies.</p>
              <p className="mt-2"><strong>Push notifications.</strong> If you enable notifications, we store a push subscription (a browser-provided endpoint and encryption keys) so we can send you alerts about nearby roaches and new messages.</p>
              <p className="mt-2"><strong>Technical information.</strong> Basic device and browser information and general usage data, and cookies or local storage used to keep you signed in and operate the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">2. How We Use Information</h2>
              <p>We use the information we collect to: create and manage your account; connect Bugaphobes with nearby Roach Roasters; enable messaging, reviews, and coordination; send push notifications you have opted into; facilitate optional tips; provide support; keep the Service safe (including moderation and preventing abuse); and improve the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">3. How Information Is Shared</h2>
              <p><strong>With other users.</strong> Your display name, photo, city, bio, social link, ratings, and reviews are visible to other users. When you are matched on a job, the other user can see the information needed to coordinate. Do not share sensitive personal details (such as your exact home address) in chat.</p>
              <p className="mt-2"><strong>With service providers.</strong> We use trusted third parties to run the Service, who process data only on our behalf:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Supabase</strong> — authentication, database, and file storage.</li>
                <li><strong>Vercel</strong> — website hosting.</li>
                <li><strong>Google and Facebook</strong> — optional sign-in.</li>
                <li><strong>Stripe</strong> — card payment processing.</li>
                <li><strong>Browser push services</strong> (such as Google&apos;s Firebase Cloud Messaging and Apple/Mozilla push services) — delivery of notifications.</li>
              </ul>
              <p className="mt-2"><strong>We do not sell your personal information.</strong> We may disclose information if required by law or to protect the rights, safety, or property of our users or the public.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">4. Location Data</h2>
              <p>Location is used only to match roach alerts with nearby Roach Roasters and to power proximity-based features. We do not continuously track your location in the background. You can disable location sharing at any time in your browser or device settings, though some features may not work without it.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">5. Notifications</h2>
              <p>Push notifications are optional and require your permission. You can turn them off at any time in your browser or device settings, or by removing notification permission for the site, which stops future notifications.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">6. Data Retention</h2>
              <p>We keep your information for as long as your account is active or as needed to provide the Service. When you delete your account, we delete or anonymize your personal information, except where we must retain certain data to comply with legal obligations, resolve disputes, or enforce our agreements.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">7. Your Rights and Choices</h2>
              <p>You can view and edit most of your profile information at any time in the app. Depending on where you live, you may have rights to access, correct, delete, or export your personal information, or to object to certain processing. To exercise these rights, or to delete your account, contact us using the details below.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">8. Security</h2>
              <p>We use reasonable technical and organizational measures to protect your information, including encrypted connections and access controls. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">9. Children</h2>
              <p>RoachRoasters is intended for users who are at least 18 years old. We do not knowingly collect personal information from anyone under 18.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">10. International Users</h2>
              <p>The Service is operated using providers that may store and process data in various countries. By using the Service, you understand your information may be transferred to and processed in locations outside your country of residence.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">11. Changes to This Policy</h2>
              <p>We may update this Policy from time to time. When we do, we will revise the &quot;Last updated&quot; date above. Your continued use of the Service after changes take effect means you accept the updated Policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">12. Contact Us</h2>
              <p>If you have questions about this Policy or your information, contact us at{' '}
                <a href="mailto:rotem.levim@gmail.com" className="text-purple-mid font-semibold underline">rotem.levim@gmail.com</a>.
              </p>
            </section>

            <section className="pt-2">
              <p className="text-xs text-gray-400">
                See also our{' '}
                <Link href="/terms-of-use" className="text-purple-mid font-semibold underline">Terms of Use</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
