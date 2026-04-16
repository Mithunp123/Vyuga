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

        <Section title="1. Refund Policy">
          <p>All registration fees for VYUGA events are strictly non-refundable. Once a payment is made, it cannot be refunded under any standard circumstances.</p>
        </Section>

        <Section title="2. Cancellation by Participant">
          <p>If you have registered but are no longer able to attend the event, you may notify us of your cancellation. However, please note that no refunds of the fee will be issued for voluntary cancellations.</p>
        </Section>

        <Section title="3. Event Cancellation">
          <p>A refund will only be initiated in the unlikely event that the VYUGA event is entirely cancelled by the organizers. If the event is postponed, your registration will automatically be transferred to the new dates.</p>
        </Section>

        <Section title="4. Failed Transactions">
          <p>If a transaction fails but money has been debited from your account, it will automatically be refunded by your bank or the payment gateway (Razorpay) within 5-7 business days.</p>
        </Section>

        <Section title="5. Contact for Refund Queries">
          <p>For any queries related to failed transactions or eligible refunds, please reach out to us at <a href="mailto:vyuga@nexyugainnovations.com" className="text-[#0197B2] underline">vyuga@nexyugainnovations.com</a> with your Order ID.</p>
        </Section>
      </div>
    </PageShell>
  )
}
