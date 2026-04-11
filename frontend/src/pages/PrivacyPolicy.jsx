import PageShell from './PageShell.jsx'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#0197B2] mb-3">{title}</h2>
      <div className="text-slate-700 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function PrivacyPolicy() {
  return (
    <PageShell
      title="Privacy Policy"
      subtitle="We are committed to protecting your personal information."
      titleClass="text-slate-900"
      subtitleClass="text-slate-600"
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500 mb-8">Last updated: April 2026</p>

        <Section title="1. Information We Collect">
          <p>When you register for a VYUGA event, we collect the following personal information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Full name, email address, and phone number</li>
            <li>Organization or institution name</li>
            <li>Disability type (for events requiring this information)</li>
            <li>Team member details</li>
            <li>Payment transaction reference (not card details)</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use your personal data solely for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Processing event registrations and sending confirmation emails</li>
            <li>Communicating event updates and shortlisting decisions</li>
            <li>Verifying eligibility for specific events</li>
            <li>Administrative and statistical purposes related to the event</li>
          </ul>
        </Section>

        <Section title="3. Data Storage and Security">
          <p>Your data is stored securely on Supabase (cloud database infrastructure). We do not store payment card details — all payment processing is handled by Razorpay, which is PCI-DSS compliant.</p>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or misuse.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We do not sell, trade, or rent your personal information to third parties. Data may be shared with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Razorpay – for secure payment processing</li>
            <li>Event organizers and judges – for evaluation purposes only</li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>Our website uses minimal cookies required for basic functionality and session management. We do not use tracking or advertising cookies.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, please contact us at <a href="mailto:harishvikas48@gmail.com" className="text-[#0197B2] underline">harishvikas48@gmail.com</a>.</p>
        </Section>

        <Section title="7. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
        </Section>

        <Section title="8. Contact">
          <p>For any privacy-related queries, contact us at <a href="mailto:harishvikas48@gmail.com" className="text-[#0197B2] underline">harishvikas48@gmail.com</a>.</p>
        </Section>
      </div>
    </PageShell>
  )
}
