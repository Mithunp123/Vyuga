import PageShell from './PageShell.jsx'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#0197B2] mb-3">{title}</h2>
      <div className="text-slate-700 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function TermsAndConditions() {
  return (
    <PageShell
      title="Terms and Conditions"
      subtitle="Please read these terms carefully before registering for VYUGA events."
      titleClass="text-slate-900"
      subtitleClass="text-slate-600"
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500 mb-8">Last updated: April 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>By accessing and using the VYUGA event registration platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
        </Section>

        <Section title="2. Event Registration">
          <p>Registration for VYUGA events requires payment of a registration fee (Inno Fest - ₹599, Special Talent Hunt - ₹499, Short Film - ₹899) per submission. Registration is confirmed only upon successful payment via our payment gateway (Razorpay).</p>
          <p>Each registration is valid for one team or individual as specified in the respective event form. Duplicate registrations may be cancelled without a refund.</p>
        </Section>

        <Section title="3. Payment">
          <p>All payments are processed securely through Razorpay. VYUGA does not store your card or banking details on our servers.</p>
          <p>The registration fees are Inno Fest - ₹599, Special Talent Hunt - ₹499, and Short Film - ₹899 (Indian Rupees) and are inclusive of all applicable taxes. Payment must be completed online at the time of registration.</p>
        </Section>

        <Section title="4. Eligibility">
          <p>Participants must meet the eligibility criteria specified for each event (e.g., disability type, age, institution). VYUGA reserves the right to verify eligibility and disqualify any participant found ineligible.</p>
        </Section>

        <Section title="5. Code of Conduct">
          <p>All participants are expected to conduct themselves respectfully and professionally at all VYUGA events. Harassment, discrimination, or disruptive behaviour will result in immediate disqualification and removal.</p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>By submitting an innovation idea, performance, or creative work, participants grant VYUGA the right to showcase, photograph, or feature the submission in promotional materials with appropriate attribution.</p>
        </Section>

        <Section title="7. Liability">
          <p>VYUGA shall not be liable for any direct, indirect, incidental, or consequential damages arising from participation in our events. Participants attend and participate at their own risk.</p>
        </Section>

        <Section title="8. Changes to Terms">
          <p>VYUGA reserves the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the platform constitutes acceptance of the revised terms.</p>
        </Section>

        <Section title="9. Contact">
          <p>For any questions regarding these terms, please contact us at <a href="mailto:vyuga@nexyugainnovations.com" className="text-[#0197B2] underline">vyuga@nexyugainnovations.com</a>.</p>
        </Section>
      </div>
    </PageShell>
  )
}
