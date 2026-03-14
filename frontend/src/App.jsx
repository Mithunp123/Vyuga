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
import InnovationCollegeForm from './pages/InnovationCollegeForm.jsx'
import InnovationPWDForm from './pages/InnovationPWDForm.jsx'
import TalentOrgRegistration from './pages/TalentOrgRegistration.jsx'
import TalentStudentNomination from './pages/TalentStudentNomination.jsx'
import CricketTeamForm from './pages/CricketTeamForm.jsx'

import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/program" element={<Program />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/speakers" element={<SpeakersPage />} />
      <Route path="/sponsors" element={<SponsorsPage />} />
      <Route path="/exhibitors" element={<ExhibitorsPage />} />

      <Route path="/projects/schedule" element={<ProjectsSchedule />} />
      <Route path="/projects/workshops" element={<ProjectsWorkshops />} />
      <Route path="/projects/keynotes" element={<ProjectsKeynotes />} />
      <Route path="/projects/speakers" element={<ProjectsSpeakers />} />
      <Route path="/projects/call-for-paper" element={<ProjectsCallForPaper />} />
      <Route
        path="/projects/student-design-challenge"
        element={<ProjectsStudentDesignChallenge />}
      />

      <Route path="/attend/register" element={<AttendRegister />} />
      <Route path="/attend/accommodation" element={<AttendAccommodation />} />
      <Route path="/attend/travel-information" element={<AttendTravel />} />

      <Route path="/register/innovation-college" element={<InnovationCollegeForm />} />
      <Route path="/register/innovation-pwd" element={<InnovationPWDForm />} />
      <Route path="/register/talent-org" element={<TalentOrgRegistration />} />
      <Route path="/register/talent-student" element={<TalentStudentNomination />} />
      <Route path="/register/cricket" element={<CricketTeamForm />} />

      {/* ── Admin (private) ── */}
      <Route path="/vyuga-admin" element={<AdminLogin />} />
      <Route path="/vyuga-admin/dashboard" element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
