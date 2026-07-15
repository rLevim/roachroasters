'use client';

import Link from 'next/link';

export default function TermsOfUsePage() {
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-ink mb-2">Terms of Use</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: July 15, 2025</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">1. Acceptance of Terms</h2>
              <p>By creating an account on RoachRoasters or using the platform in any way, you agree to be bound by these Terms of Use. If you do not agree, do not use the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">2. Description of Service</h2>
              <p>RoachRoasters is a free community platform that connects individuals who need help dealing with cockroaches (&quot;Bugaphobes&quot;) with individuals willing to help (&quot;Roach Roasters&quot;). The platform provides tools for posting alerts, real-time messaging, and coordination between users.</p>
              <p className="mt-2">RoachRoasters does not employ, contract, or certify any Roach Roaster. All Roach Roasters are independent individuals acting on their own behalf.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">3. Use at Your Own Risk</h2>
              <p className="font-semibold text-red-700">By using RoachRoasters, you acknowledge and accept that you use this service entirely at your own risk.</p>
              <p className="mt-2">RoachRoasters is a platform that facilitates connections between users. We do not perform background checks, verify qualifications, or guarantee the quality, safety, or outcome of any interaction between users. You are solely responsible for your own safety and any decisions you make based on interactions through the platform.</p>
              <p className="mt-2">By inviting a Roach Roaster into your home or property, you acknowledge that you do so voluntarily and at your own risk. RoachRoasters bears no responsibility for any damage to property, personal injury, theft, or any other loss that may occur during or as a result of a service interaction.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">4. Eligibility</h2>
              <p>You must be at least 18 years old to use RoachRoasters. By creating an account, you represent that you meet this age requirement.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">5. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate, current, and complete information during registration.</p>
              <p className="mt-2">Each person may only maintain one account. Creating multiple accounts may result in all accounts being suspended.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">6. User Conduct</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Treat all users with respect and courtesy</li>
                <li>Provide accurate information in alerts and communications</li>
                <li>Not use the platform for any illegal activity</li>
                <li>Not harass, threaten, or intimidate other users</li>
                <li>Not post false or misleading alerts</li>
                <li>Not use the platform to solicit services unrelated to pest control</li>
                <li>Not attempt to circumvent or manipulate the platform&apos;s systems</li>
              </ul>
              <p className="mt-2">Violations of these conduct rules may result in immediate account suspension or permanent ban at our sole discretion.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">7. Safety Guidelines</h2>
              <p>For your safety, we strongly recommend:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Do not share your exact address in chat messages; use the in-app location pin instead</li>
                <li>Inform a friend or family member when a Roach Roaster is coming to your location</li>
                <li>Meet in well-lit, accessible areas when possible</li>
                <li>Trust your instincts — if something feels wrong, cancel the service</li>
                <li>Do not share personal financial information with other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">8. Tipping and Payments</h2>
              <p>RoachRoasters is a free platform. There are no fees to post alerts or respond to them. Bugaphobes may optionally tip Roach Roasters via external payment services (such as PayPal) as a token of appreciation. These transactions occur entirely outside the RoachRoasters platform, and we bear no responsibility for any disputes arising from such payments.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">9. Reviews and Ratings</h2>
              <p>Users may leave reviews and ratings after completed services. Reviews must be honest and based on genuine experiences. Fake, manipulated, or retaliatory reviews are prohibited and will be removed. Repeated violations may result in account suspension.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">10. Location Data</h2>
              <p>RoachRoasters collects location data when you create an alert or share your location with another user. This data is used solely for the purpose of connecting nearby users and is not sold to third parties. You may revoke location permissions at any time through your device settings, though this may limit the functionality of the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">11. Intellectual Property</h2>
              <p>All content, branding, design, and code on RoachRoasters are the property of RoachRoasters and may not be copied, modified, or distributed without prior written permission.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">12. Limitation of Liability</h2>
              <p>RoachRoasters is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. To the fullest extent permitted by law:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>RoachRoasters shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the platform</li>
                <li>RoachRoasters is not responsible for the actions, behavior, or conduct of any user</li>
                <li>RoachRoasters does not guarantee that the service will be uninterrupted, secure, or error-free</li>
                <li>RoachRoasters is not a pest control company and makes no guarantees about the effectiveness of any service provided by Roach Roasters</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">13. Indemnification</h2>
              <p>You agree to indemnify and hold harmless RoachRoasters, its owners, operators, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, your violation of these terms, or your interaction with other users.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">14. Account Termination</h2>
              <p>We reserve the right to suspend or terminate your account at any time and for any reason, including but not limited to violations of these Terms of Use. You may delete your account at any time by contacting support.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">15. Changes to Terms</h2>
              <p>We may update these Terms of Use from time to time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. We will notify users of material changes via the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">16. Governing Law</h2>
              <p>These Terms of Use shall be governed by and construed in accordance with the laws of Israel, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-purple-ink mb-2">17. Contact</h2>
              <p>For questions about these Terms of Use, contact us at <a href="mailto:rotem.levim@gmail.com" className="text-purple-mid hover:text-purple-dark underline">rotem.levim@gmail.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
