import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import useAppStore from '../store/useAppStore.js'
import CompletionRing from '../components/CompletionRing.jsx'
import StreakWidget from '../components/StreakWidget.jsx'
import adhkarDatabase from '../data/adhkar.js'

function getGreeting(lang) {
  const hour = new Date().getHours()
  const keys = {
    en: hour < 5 ? 'greeting_night' : hour < 7 ? 'greeting_fajr' : hour < 12 ? 'greeting_sabah' : hour < 15 ? 'greeting_dhuhr' : hour < 17 ? 'greeting_asr' : hour < 20 ? 'greeting_maghrib' : 'greeting_isha',
    ar: hour < 5 ? 'greeting_night' : hour < 7 ? 'greeting_fajr' : hour < 12 ? 'greeting_sabah' : hour < 15 ? 'greeting_dhuhr' : hour < 17 ? 'greeting_asr' : hour < 20 ? 'greeting_maghrib' : 'greeting_isha',
    fr: hour < 5 ? 'greeting_night' : hour < 7 ? 'greeting_fajr' : hour < 12 ? 'greeting_sabah' : hour < 15 ? 'greeting_dhuhr' : hour < 17 ? 'greeting_asr' : hour < 20 ? 'greeting_maghrib' : 'greeting_isha',
  }
  return `dashboard.${keys[lang] || keys.en}`
}

const QUICK_CARDS = [
  {
    path: '/adhkar',
    icon: '📿',
    title: { en: 'Adhkar Hub', ar: 'مركز الأذكار', fr: "Centre d'Adhkar" },
    desc: { en: 'Morning, evening & daily dhikr', ar: 'أذكار الصباح والمساء', fr: 'Dhikr quotidien' },
    color: 'border-accent-gold',
    iconBg: 'bg-accent-gold bg-opacity-20',
  },
  {
    path: '/psychology',
    icon: '🧠',
    title: { en: 'Psychology Lab', ar: 'مختبر النفس', fr: 'Labo de Psychologie' },
    desc: { en: 'Quran meets your psychology', ar: 'القرآن يلتقي بنفسيتك', fr: 'Le Coran rencontre votre psychologie' },
    color: 'border-teal-600',
    iconBg: 'bg-teal-800 bg-opacity-30',
  },
  {
    path: '/seerah',
    icon: '🌙',
    title: { en: 'Seerah Atlas', ar: 'أطلس السيرة', fr: 'Atlas de la Seerah' },
    desc: { en: 'Prophet ﷺ as personality model', ar: 'النبي ﷺ نموذجاً للشخصية', fr: 'Le Prophète ﷺ comme modèle' },
    color: 'border-amber-600',
    iconBg: 'bg-amber-800 bg-opacity-30',
  },
]

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const { adhkarProgress, streak, psychSessions, getTotalDhikrAllTime } = useAppStore()
  const lang = i18n.language

  const totalToday = adhkarDatabase.length
  const completedToday = adhkarDatabase.filter(
    (a) => adhkarProgress[a.id]?.completedToday
  ).length
  const totalAllTime = getTotalDhikrAllTime()

  const now = new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero greeting */}
      <div className="card border-accent-gold gold-glow text-center py-8">
        <p className="text-text-muted text-sm mb-1">{format(now, 'EEEE, MMMM d yyyy')}</p>
        <h1 className="text-3xl font-bold text-accent-gold mb-2">
          {t(getGreeting(lang))} 🌟
        </h1>
        <p dir={lang === 'ar' ? 'rtl' : 'ltr'} className="text-text-muted text-sm">
          {t('dashboard.subtitle')}
        </p>
        <p className="text-text-faint font-arabic text-lg mt-3" dir="rtl">
          {t('common.bismillah')}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent-gold">{totalAllTime.toLocaleString()}</p>
          <p className="text-text-muted text-xs mt-1">{t('dashboard.total_dhikr')}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent-green">{streak.current}</p>
          <p className="text-text-muted text-xs mt-1">{t('dashboard.streak_days')}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-teal-400">{psychSessions.length}</p>
          <p className="text-text-muted text-xs mt-1">{t('dashboard.sessions')}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-400">{streak.longest}</p>
          <p className="text-text-muted text-xs mt-1">Best Streak</p>
        </div>
      </div>

      {/* Progress + Streak side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's completion */}
        <div className="card flex items-center gap-6">
          <CompletionRing done={completedToday} total={totalToday} size={110} />
          <div>
            <p className="text-text-muted text-sm mb-1">{t('dashboard.completion')}</p>
            <p className="text-xl font-bold text-text-primary">
              {completedToday}/{totalToday}
            </p>
            <p className="text-text-muted text-sm">adhkar completed</p>
            <Link to="/adhkar" className="mt-3 btn-gold inline-block text-sm px-4 py-1.5">
              {completedToday < totalToday ? t('dashboard.start_morning') : t('dashboard.continue')}
            </Link>
          </div>
        </div>

        {/* Streak */}
        <StreakWidget />
      </div>

      {/* Quick access cards */}
      <div>
        <h2 className="section-title">{t('dashboard.quick_access')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {QUICK_CARDS.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className={`card border hover:gold-glow transition-all duration-200 hover:scale-[1.02] active:scale-100 ${card.color}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.iconBg}`}>
                {card.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-1">
                {card.title[lang] || card.title.en}
              </h3>
              <p className="text-text-muted text-sm">
                {card.desc[lang] || card.desc.en}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent sessions preview */}
      {psychSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Recent Sessions</h2>
            <Link to="/psychology" className="text-accent-gold text-sm hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {psychSessions.slice(0, 3).map((session) => (
              <Link
                key={session.id}
                to="/psychology"
                state={{ sessionId: session.id }}
                className="card hover:border-accent-gold transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">🧠</span>
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">
                      {session.aiResponse?.pattern || session.topic || 'Session'}
                    </p>
                    <p className="text-text-muted text-xs">
                      {format(new Date(session.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {session.bookmarked && <span className="text-accent-gold shrink-0">★</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
