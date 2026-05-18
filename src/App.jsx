import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Adhkar from './pages/Adhkar.jsx'
import Psychology from './pages/Psychology.jsx'
import Seerah from './pages/Seerah.jsx'
import Stats from './pages/Stats.jsx'
import useAppStore from './store/useAppStore.js'

export default function App() {
  const { i18n } = useTranslation()
  const { prefs, checkAndUpdateStreak } = useAppStore()

  useEffect(() => {
    if (prefs.lang) {
      i18n.changeLanguage(prefs.lang)
      document.documentElement.lang = prefs.lang
      document.documentElement.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [prefs.lang, i18n])

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', prefs.theme === 'light')
  }, [prefs.theme])

  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="adhkar" element={<Adhkar />} />
          <Route path="psychology" element={<Psychology />} />
          <Route path="seerah" element={<Seerah />} />
          <Route path="stats" element={<Stats />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
