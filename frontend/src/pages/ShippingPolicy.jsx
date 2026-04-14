import PageShell from './PageShell.jsx'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#0197B2] mb-3">{title}</h2>
      <div className="text-slate-700 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function ShippingPolicy() {
  return (
    <PageShell
      title="Shipping & Delivery Policy"
      subtitle="Information regarding the delivery of our services."
      titleClass="text-slate-900"
      subtitleClass="text-slate-600"
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500 mb-8">Last updated: April 2026</p>

        <Section title="1. Digital Event Registration">
          <p>VYUGA is an in-person and digital event. The registration fee collected is for participation in the event.</p>
          <p>As this is a service/event registration, there are no physical goods or products to be shipped or delivered to the participants.</p>
        </Section>

        <Section title="2. Delivery of Confirmation">
          <p>Upon successful payment of the registration fee (Inno Fest - ₹599, Special Talent Hunt - ₹499, Short Film - ₹899), you will immediately receive a digital confirmation via email.</p>
          <p>This email contains your registration details, transaction ID, and further instructions. This digital confirmation constitutes the full "delivery" of our service prior to the event date.</p>
        </Section>

        <Section title="3. Event Check-in">
          <p>On the day of the event, participants must present their digital confirmation email (on their mobile device or printed) at the registration desk at K.S.Rangasamy College of Technology to gain entry.</p>
        </Section>

        <Section title="4. Contact Us">
          <p>If you have not received your confirmation email within 24 hours of successful payment, please check your spam folder or contact us at <a href="mailto:connect@nexyugainnovations.com" className="text-[#0197B2] underline">connect@nexyugainnovations.com</a>.</p>
        </Section>
      </div>
    </PageShell>
  )
}
