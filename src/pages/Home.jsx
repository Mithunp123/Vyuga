import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import About from '../components/About.jsx'
import Schedule from '../components/Schedule.jsx'
import Speakers from '../components/Speakers.jsx'
import Sponsors from '../components/Sponsors.jsx'
import Exhibitors from '../components/Exhibitors.jsx'
import Gallery from '../components/Gallery.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Schedule />
        <Speakers />
        <Sponsors />
        <Exhibitors />
        <Gallery />
      </main>
      <Footer />
    </div>
  )
}

