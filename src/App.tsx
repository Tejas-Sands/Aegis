import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from './components/PageTransition'
import { AuthProvider } from './components/AuthProvider'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import Settings from './pages/Settings'
import About from './pages/About'
import NotFound from './pages/NotFound'
import LoadingScreen from './components/LoadingScreen'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Global overlays */}
      <Cursor />
      <ScrollProgress />

      {/* Loading gate */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Main content — visible after load */}
      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: loaded ? 'auto' : 'none',
        }}
      >
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/incidents" element={<PageTransition><Incidents /></PageTransition>} />
              <Route path="/incidents/:id" element={<PageTransition><IncidentDetail /></PageTransition>} />
              <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </div>
    </>
  )
}
