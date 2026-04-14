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
      subtitle="Our policy for managing registration cancellations."
      titleClass="text-slate-900"
      subtitleClass="text-slate-600"
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500 mb-8">Last updated: April 2026</p>

        <Section title="1. Registration Fee">
          <p>The registration fees for VYUGA events are Inno Fest - ₹599, Special Talent Hunt - ₹499, and Short Film - ₹899. These fees are strictly non-refundable under standard circumstances due to the administrative costs involved in processing registrations and allocating event resources.</p>
        </Section>

        <Section title="2. Cancellation by Participant">
          <p>If you have registered but are no longer able to attend the event, you may cancel your registration by notifying us. However, please note that no refunds will be issued for voluntary cancellations.</p>
        </Section>

        <Section title="3. Event Cancellation or Postponement">
          <p>In the unlikely event that VYUGA is cancelled by the organizers entirely, registered participants will be entitled to a full refund of their registration fee (Inno Fest: ₹599, Special Talent Hunt: ₹499, Short Film: ₹899).</p>
          <p>If the event is postponed, your registration will automatically be transferred to the new date. If you cannot attend the new date, you may request a refund within 7 days of the postponement announcement.</p>
        </Section>

        <Section title="4. Failed Transactions">
          <p>If a transaction fails but money has been debited from your account, it will automatically be refunded by your bank or the payment gateway (Razorpay) within 5-7 business days.</p>
        </Section>

        <Section title="5. Contact for Refund Queries">
          <p>For any queries related to failed transactions or eligible refunds, please reach out to us at <a href="mailto:connect@nexyugainnovations.com" className="text-[#0197B2] underline">connect@nexyugainnovations.com</a> with your Order ID.</p>
        </Section>
      </div>
    </PageShell>
  )
}
