import { Navigate, Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import Program from './pages/Program.jsx'
import AboutPage from './pages/AboutPage.jsx'
import SpeakersPage from './pages/SpeakersPage.jsx'
import SponsorsPage from './pages/SponsorsPage.jsx'
import ExhibitorsPage from './pages/ExhibitorsPage.jsx'

import ProjectsSchedule from './pages/ProjectsSchedule.jsx'
import ProjectsWorkshops from './pages/ProjectsWorkshops.jsx'
import ProjectsKeynotes from './pages/ProjectsKeynotes.jsx'
import ProjectsSpeakers from './pages/ProjectsSpeakers.jsx'
import ProjectsCallForPaper from './pages/ProjectsCallForPaper.jsx'
import ProjectsStudentDesignChallenge from './pages/ProjectsStudentDesignChallenge.jsx'

import AttendRegister from './pages/AttendRegister.jsx'
import AttendAccommodation from './pages/AttendAccommodation.jsx'
import AttendTravel from './pages/AttendTravel.jsx'
import InnovationUnifiedForm from './pages/InnovationUnifiedForm.jsx'
import TalentOrgRegistration from './pages/TalentOrgRegistration.jsx'
import TalentStudentNomination from './pages/TalentStudentNomination.jsx'
import TalentParentNomination from './pages/TalentParentNomination.jsx'
import CricketTeamForm from './pages/CricketTeamForm.jsx'
import BlindChessForm from './pages/BlindChessForm.jsx'
import ShortFilmForm from './pages/ShortFilmForm.jsx'

import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import JuryLogin from './pages/JuryLogin.jsx'
import JuryDashboard from './pages/JuryDashboard.jsx'
import ErrorLogs from './pages/ErrorLogs.jsx'
import AccessibilityWidget from './components/AccessibilityWidget.jsx'

import TermsAndConditions from './pages/TermsAndConditions.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import ShippingPolicy from './pages/ShippingPolicy.jsx'
import ContactUs from './pages/ContactUs.jsx'
import CancellationAndRefunds from './pages/CancellationAndRefunds.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'

export default function App() {
  return (
    <>
    <ScrollToTop />
    <AccessibilityWidget />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/speakers" element={<SpeakersPage />} />
      <Route path="/sponsors" element={<SponsorsPage />} />


   
 
      <Route path="/attend/register" element={<AttendRegister />} />
      <Route path="/attend/accommodation" element={<AttendAccommodation />} />
      <Route path="/attend/travel-information" element={<AttendTravel />} />

      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/shipping" element={<ShippingPolicy />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/refunds" element={<CancellationAndRefunds />} />

      <Route path="/register/innovation" element={<InnovationUnifiedForm />} />
      <Route path="/register/innovation-college" element={<InnovationUnifiedForm />} />
      <Route path="/register/innovation-pwd" element={<InnovationUnifiedForm />} />
      <Route path="/register/talent-org" element={<Navigate to="/register/talent-student" replace />} />
      <Route path="/register/talent-student" element={<TalentStudentNomination />} />
      <Route path="/register/talent-parent" element={<TalentParentNomination />} />
      <Route path="/register/cricket" element={<CricketTeamForm />} />
      <Route path="/register/chess" element={<BlindChessForm />} />
      <Route path="/register/shortfilm" element={<ShortFilmForm />} />

      {/* ── Admin (private) ── */}
      <Route path="/vyuga-admin" element={<AdminLogin />} />
      <Route path="/vyuga-admin/dashboard" element={<AdminDashboard />} />
      <Route path="/errorlog" element={<ErrorLogs />} />
      
      {/* ── Jury Portal ── */}
      <Route path="/jury-login" element={<JuryLogin />} />
      <Route path="/jury-dashboard" element={<JuryDashboard />} />

      <Route path="/payment-success" element={<PaymentSuccess />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
