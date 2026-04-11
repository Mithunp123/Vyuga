import PageShell from './PageShell.jsx'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactUs() {
  return (
    <PageShell
      title="Contact Us"
      subtitle="Get in touch with the VYUGA organizers."
      titleClass="text-slate-900"
      subtitleClass="text-slate-600"
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        
        <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-8 sm:p-12 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Reach Out</h3>
              <p className="text-slate-600 mb-8">
                If you have any questions regarding event registration, sponsorship opportunities, or require special accommodations, please don't hesitate to reach out to our team.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#0197B2] p-3 rounded-full text-white shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Email</p>
                    <a href="mailto:connect@nexyugainnovations.com" className="text-[#0197B2] hover:underline">connect@nexyugainnovations.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#0197B2] p-3 rounded-full text-white shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Phone</p>
                    <p className="text-slate-600">04288-274374</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#0197B2] p-3 rounded-full text-white shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Address</p>
                    <p className="text-slate-600">K.S.Rangasamy College of Technology<br />Tiruchengode, Tamil Nadu, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-full min-h-[300px]">
              <iframe
                title="KSRCT Map"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1864.1303872982849!2d77.82830417895998!3d11.362597697460115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba964016c607823%3A0x580736a65c2b0005!2sK.S.RANGASAMY%20COLLEGE%20OF%20TECHNOLOGY!5e1!3m2!1sen!2sin!4v1773465944265!5m2!1sen!2sin"
              />
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  )
}
