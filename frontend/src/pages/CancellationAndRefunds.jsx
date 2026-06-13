import PageShell from './PageShell.jsx'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#0197B2] mb-3">{title}</h2>
      <div className="text-slate-700 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function CancellationAndRefunds() {
  return (
    <PageShell
      title="Cancellation & Refunds"
      subtitle="Our policy for VYUGA 2026 registrations."
      titleClass="text-slate-900"
      subtitleClass="text-slate-600"
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

        <Section title="1. Free Registration">
          <p>Registration for all VYUGA 2026 events is completely <strong>free of charge</strong>. No payment is collected at any stage of the registration process, so no refund policy applies.</p>
        </Section>

        <Section title="2. Cancellation by Participant">
          <p>Since registration is free, there is no financial obligation. If you have registered but are unable to attend, you are welcome to simply notify us via email so we can manage attendance accordingly.</p>
        </Section>

        <Section title="3. Event Cancellation or Postponement">
          <p>In the unlikely event that VYUGA 2026 is cancelled or postponed by the organizers, all registered participants will be notified promptly via the email address provided during registration. Any rescheduled event will automatically honour existing registrations.</p>
        </Section>

        <Section title="4. Contact Us">
          <p>For any questions or to cancel your registration, please reach out to us at <a href="mailto:vyuga@nexyugainnovations.com" className="text-[#0197B2] underline">vyuga@nexyugainnovations.com</a> with your registered name and event details.</p>
        </Section>
      </div>
    </PageShell>
  )
}
