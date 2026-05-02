import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAppStore from '../../store/useAppStore.js'
import clsx from 'clsx'

const NAV_ITEMS = [
  { path: '/',           labelKey: 'nav.dashboard',   icon: '🏠', exact: true },
  { path: '/adhkar',     labelKey: 'nav.adhkar',       icon: '📿' },
  { path: '/psychology', labelKey: 'nav.psychology',   icon: '🧠' },
  { path: '/seerah',     labelKey: 'nav.seerah',       icon: '🌙' },
  { path: '/stats',      labelKey: 'nav.stats',        icon: '📊' },
]

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
  { code: 'fr', label: 'FR' },
]

export default function Layout() {
  const { t, i18n } = useTranslation()
  const { prefs, setLang } = useAppStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isRTL = prefs.lang === 'ar'

  const handleLang = (code) => {
    setLang(code)
    i18n.changeLanguage(code)
    document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Top header ─────────────────────────────────────────── */}
      <header
        className="
          sticky top-0 z-40
          bg-bg-surface border-b border-border
          px-4 h-14 flex items-center justify-between gap-3
        "
      >
        {/* Brand + hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden btn-ghost p-2 text-lg leading-none"
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="flex items-center gap-2 select-none">
            <span className="text-accent-gold text-xl leading-none">☽</span>
            <div className="hidden sm:block">
              <p className="text-text-primary font-semibold text-sm leading-tight">
                Islamic Life OS
              </p>
              <p className="text-text-faint text-[10px] leading-tight" dir="rtl">
                نظام الحياة الإسلامي
              </p>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center max-w-xl mx-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-accent-gold text-bg-primary shadow-gold'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-card'
                )
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Language switcher */}
        <div className="flex items-center gap-0.5 shrink-0">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleLang(code)}
              className={clsx(
                'w-8 h-7 rounded text-xs font-semibold transition-all duration-150',
                prefs.lang === code
                  ? 'bg-accent-gold text-bg-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-card'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Mobile drawer backdrop ──────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60" />

          {/* Drawer panel */}
          <aside
            className={clsx(
              'absolute top-0 bottom-0 w-64 bg-bg-surface border-border flex flex-col',
              isRTL ? 'right-0 border-l' : 'left-0 border-r'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-accent-gold text-xl leading-none">☽</span>
                <p className="font-semibold text-text-primary text-sm">Islamic Life OS</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-ghost p-1.5 text-base leading-none"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-accent-gold text-bg-primary shadow-gold'
                        : 'text-text-muted hover:text-text-primary hover:bg-bg-card'
                    )
                  }
                >
                  <span className="text-xl leading-none w-6 text-center">{item.icon}</span>
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* Drawer lang footer */}
            <div className="p-4 border-t border-border shrink-0">
              <p className="text-text-faint text-xs mb-2 uppercase tracking-wider">
                Language
              </p>
              <div className="flex gap-2">
                {LANGS.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => { handleLang(code); setDrawerOpen(false) }}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all',
                      prefs.lang === code
                        ? 'bg-accent-gold text-bg-primary'
                        : 'bg-bg-card text-text-muted hover:text-text-primary border border-border'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Page content ───────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24 md:pb-8 animate-in">
        <Outlet />
      </main>

      {/* ── Mobile bottom tab bar ───────────────────────────────── */}
      <nav
        className="
          mobile-nav md:hidden
          bg-bg-surface border-t border-border
          flex items-stretch
        "
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-150',
                isActive ? 'text-accent-gold' : 'text-text-faint'
              )
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[9px] font-medium leading-tight">
              {t(item.labelKey).split(' ')[0]}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
