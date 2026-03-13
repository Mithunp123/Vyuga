import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </header>
        <div className="pt-8">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

