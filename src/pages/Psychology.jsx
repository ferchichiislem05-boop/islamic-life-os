import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useAppStore from '../store/useAppStore.js'
import SessionDisplay from '../components/SessionDisplay.jsx'
import { generatePsychSession } from '../services/claudeApi.js'
import { useChartColors } from '../hooks/useChartColors.js'
import clsx from 'clsx'

const CATEGORIES = [
  { id: 'money', icon: '💰', color: 'border-yellow-600' },
  { id: 'fear', icon: '😰', color: 'border-blue-600' },
  { id: 'sadness', icon: '😔', color: 'border-indigo-600' },
  { id: 'childhood', icon: '👶', color: 'border-pink-600' },
  { id: 'confidence', icon: '💪', color: 'border-orange-600' },
  { id: 'relationships', icon: '❤️', color: 'border-red-600' },
  { id: 'future', icon: '🔮', color: 'border-purple-600' },
  { id: 'anger', icon: '😤', color: 'border-red-700' },
  { id: 'procrastination', icon: '🏃', color: 'border-green-600' },
  { id: 'tawakkul', icon: '🤲', color: 'border-teal-600' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-border rounded-lg px-3 py-2 text-xs">
        <p className="text-text-primary font-medium">{label}</p>
        <p className="text-accent-gold">{payload[0].value} sessions</p>
      </div>
    )
  }
  return null
}

export default function Psychology() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { psychSessions, savePsychSession, toggleSessionBookmark, getSessionsByCategory } = useAppStore()

  const [selectedCategory, setSelectedCategory] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentSession, setCurrentSession] = useState(null)
  const [viewingSession, setViewingSession] = useState(null)
  const [historyFilter, setHistoryFilter] = useState('all')
  const [showHistory, setShowHistory] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const outputRef = useRef(null)

  const lang = i18n.language
  const chartColors = useChartColors()

  // Handle navigation from Seerah page
  useEffect(() => {
    if (location.state?.seerahContext) {
      const ctx = location.state.seerahContext
      setInput(`I want to understand how the Seerah story "${ctx.title}" applies to my current life situation. Key lesson: ${ctx.lesson}`)
    }
    if (location.state?.sessionId) {
      const session = psychSessions.find((s) => s.id === location.state.sessionId)
      if (session) setViewingSession(session)
    }
  }, [location.state])

  const handleStartSession = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setCurrentSession(null)
    setViewingSession(null)
    try {
      const aiResponse = await generatePsychSession(input, selectedCategory)
      const session = {
        topic: input.slice(0, 100),
        category: selectedCategory,
        aiResponse,
        notes: '',
        bookmarked: false,
      }
      savePsychSession(session)
      const saved = useAppStore.getState().psychSessions[0]
      setCurrentSession(saved)
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setError(t('psychology.error') + ' ' + (err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const categoryData = getSessionsByCategory()
  const barData = Object.entries(categoryData).map(([cat, count]) => ({
    name: t(`psychology.categories.${cat}`).slice(0, 12),
    count,
    cat,
  }))

  // Build line chart data (sessions per day, last 14 days)
  const lineData = (() => {
    const days = {}
    psychSessions.forEach((s) => {
      const d = format(new Date(s.date), 'MMM d')
      days[d] = (days[d] || 0) + 1
    })
    return Object.entries(days).slice(-14).map(([date, count]) => ({ date, count }))
  })()

  const topStruggle = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0]

  const filteredHistory = psychSessions.filter((s) => {
    if (historyFilter === 'bookmarked') return s.bookmarked
    if (historyFilter !== 'all') return s.category === historyFilter
    return true
  })

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('psychology.title')}</h1>
        <p className="text-text-muted text-sm">{t('psychology.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-[260px,1fr] gap-5">
        {/* LEFT — Category Explorer */}
        <div className="space-y-4">
          <div className="card">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">
              {t('psychology.topic_explorer')}
            </p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)
                  }
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all',
                    selectedCategory === cat.id
                      ? `bg-bg-primary border ${cat.color} text-text-primary font-medium`
                      : 'text-text-muted hover:bg-bg-surface hover:text-text-primary'
                  )}
                >
                  <span className="text-base shrink-0">{cat.icon}</span>
                  <span className="truncate">{t(`psychology.categories.${cat.id}`)}</span>
                  {categoryData[cat.id] > 0 && (
                    <span className="ml-auto badge-gold shrink-0">
                      {categoryData[cat.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Top insight */}
          {topStruggle && (
            <div className="belief-block">
              <p className="text-xs text-amber-400 font-medium mb-1">{t('psychology.top_focus')}</p>
              <p className="text-amber-200 font-semibold">
                {CATEGORIES.find((c) => c.id === topStruggle[0])?.icon}{' '}
                {t(`psychology.categories.${topStruggle[0]}`)}
              </p>
              <p className="text-amber-300 text-xs mt-1">
                {topStruggle[1]} {t('psychology.sessions_keep_returning')}
              </p>
            </div>
          )}

          {/* Charts toggle */}
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="w-full btn-outline text-sm py-2"
          >
            📊 {showCharts ? t('psychology.hide_charts') : t('psychology.show_charts')}
          </button>
        </div>

        {/* RIGHT — Main panel */}
        <div className="space-y-4">
          {/* Charts panel */}
          {showCharts && (
            <div className="card space-y-6 animate-in">
              <h3 className="font-semibold text-text-primary">{t('psychology.session_analytics')}</h3>

              {barData.length > 0 ? (
                <div>
                  <p className="text-xs text-text-muted mb-2">{t('stats.sessions_breakdown')}</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="name" tick={{ fill: chartColors.tick, fontSize: 10 }} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center py-4">{t('stats.no_data')}</p>
              )}

              {lineData.length > 1 && (
                <div>
                  <p className="text-xs text-text-muted mb-2">{t('stats.sessions_chart')}</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="date" tick={{ fill: chartColors.tick, fontSize: 10 }} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#C9A84C"
                        strokeWidth={2}
                        dot={{ fill: '#C9A84C', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Session input */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text-primary">
                {selectedCategory
                  ? `${CATEGORIES.find((c) => c.id === selectedCategory)?.icon} ${t(`psychology.categories.${selectedCategory}`)}`
                  : t('psychology.new_session')}
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-text-faint hover:text-text-primary text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('psychology.describe_feeling')}
              rows={5}
              className="textarea-field text-sm mb-3"
            />

            <button
              onClick={handleStartSession}
              disabled={loading || !input.trim()}
              className="w-full btn-gold py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">☽</span>
                  {t('psychology.ai_thinking')}
                </>
              ) : (
                t('psychology.start_session')
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Session output */}
          {(currentSession || viewingSession) && (
            <div ref={outputRef} className="animate-in">
              <SessionDisplay
                session={viewingSession || currentSession}
                isNew={!viewingSession}
              />
            </div>
          )}

          {/* Session history */}
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between card hover:border-accent-gold transition-all"
            >
              <span className="font-semibold text-text-primary">
                📚 {t('psychology.history.title')} ({psychSessions.length})
              </span>
              <span className="text-text-muted">{showHistory ? '▲' : '▼'}</span>
            </button>

            {showHistory && (
              <div className="mt-3 space-y-3 animate-in">
                {/* Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: t('psychology.history.all') },
                    { id: 'bookmarked', label: t('psychology.history.bookmarked') },
                    ...CATEGORIES.map((c) => ({ id: c.id, label: `${c.icon} ${t(`psychology.categories.${c.id}`)}` })),
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setHistoryFilter(f.id)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all shrink-0',
                        historyFilter === f.id
                          ? 'bg-accent-gold text-bg-primary font-medium'
                          : 'bg-bg-surface text-text-muted hover:text-text-primary'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredHistory.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-4">
                    {t('psychology.history.empty')}
                  </p>
                ) : (
                  filteredHistory.map((session) => (
                    <div
                      key={session.id}
                      className={clsx(
                        'card cursor-pointer transition-all hover:border-accent-gold',
                        viewingSession?.id === session.id && 'border-accent-gold'
                      )}
                      onClick={() => {
                        setViewingSession(viewingSession?.id === session.id ? null : session)
                        setCurrentSession(null)
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {session.category && (
                              <span className="text-sm">
                                {CATEGORIES.find((c) => c.id === session.category)?.icon}
                              </span>
                            )}
                            <p className="font-medium text-text-primary text-sm truncate">
                              {session.aiResponse?.pattern || session.topic || 'Session'}
                            </p>
                          </div>
                          <p className="text-text-muted text-xs truncate">{session.topic}</p>
                          <p className="text-text-faint text-xs mt-1">
                            {format(new Date(session.date), 'MMM d, yyyy · h:mm a')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSessionBookmark(session.id)
                            }}
                            className={clsx(
                              'text-lg transition-all',
                              session.bookmarked
                                ? 'text-accent-gold'
                                : 'text-text-faint hover:text-accent-gold'
                            )}
                          >
                            {session.bookmarked ? '★' : '☆'}
                          </button>
                          <span className="text-text-faint text-sm">
                            {viewingSession?.id === session.id ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {viewingSession?.id === session.id && (
                        <div className="mt-4 border-t border-border pt-4 animate-in">
                          <SessionDisplay session={session} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
