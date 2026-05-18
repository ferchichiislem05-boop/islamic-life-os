import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar,
} from 'recharts'
import useAppStore from '../store/useAppStore.js'
import adhkarDatabase, { adhkarCategories } from '../data/adhkar.js'
import StreakWidget from '../components/StreakWidget.jsx'
import { useChartColors } from '../hooks/useChartColors.js'

const COLORS = ['#C9A84C', '#52B788', '#0D9488', '#D97706', '#F0D98A', '#DB2777', '#2563EB']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-border rounded-lg px-3 py-2 text-xs">
        <p className="text-text-primary font-medium">{label || payload[0].name}</p>
        <p className="text-accent-gold">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

function StatCard({ label, value, sub, color = 'text-accent-gold' }) {
  return (
    <div className="card text-center">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-text-primary text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Stats() {
  const { t, i18n } = useTranslation()
  const {
    adhkarProgress,
    streak,
    psychSessions,
    getTotalDhikrAllTime,
    getSessionsByCategory,
    getConsistencyScore,
  } = useAppStore()

  const lang = i18n.language
  const chartColors = useChartColors()
  const totalAllTime = getTotalDhikrAllTime()
  const sessionsByCategory = getSessionsByCategory()
  const consistencyScore = getConsistencyScore()

  // Adhkar by category for pie chart
  const adhkarByCategory = useMemo(() => {
    return adhkarCategories.map((cat) => {
      const catAdhkar = adhkarDatabase.filter((a) => a.category === cat.id)
      const totalCount = catAdhkar.reduce(
        (sum, a) => sum + (adhkarProgress[a.id]?.totalAllTime || 0),
        0
      )
      return {
        name: cat.label[lang] || cat.label.en,
        value: totalCount,
        icon: cat.icon,
      }
    }).filter((d) => d.value > 0)
  }, [adhkarProgress, lang])

  // Sessions timeline (last 30 days)
  const sessionsTimeline = useMemo(() => {
    const days = {}
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(today, i), 'MMM d')
      days[d] = 0
    }
    psychSessions.forEach((s) => {
      const d = format(new Date(s.date), 'MMM d')
      if (d in days) days[d] += 1
    })
    return Object.entries(days).map(([date, count]) => ({ date, count }))
  }, [psychSessions])

  // Sessions by category for bar chart
  const sessionsCatData = Object.entries(sessionsByCategory).map(([cat, count]) => ({
    name: t(`psychology.categories.${cat}`).slice(0, 14),
    count,
  }))

  // Radar chart: balance across categories
  const radarData = ['money', 'fear', 'sadness', 'confidence', 'relationships', 'tawakkul', 'anger'].map(
    (cat) => ({
      subject: t(`psychology.categories.${cat}`).slice(0, 10),
      sessions: sessionsByCategory[cat] || 0,
    })
  )

  // Top struggle
  const topStruggle = Object.entries(sessionsByCategory).sort((a, b) => b[1] - a[1])[0]

  // Most used adhkar
  const mostUsedAdhkar = useMemo(() => {
    return [...adhkarDatabase]
      .map((a) => ({
        ...a,
        total: adhkarProgress[a.id]?.totalAllTime || 0,
      }))
      .filter((a) => a.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [adhkarProgress])

  // Weekly counts (this week)
  const weeklyAdhkar = useMemo(() => {
    return adhkarDatabase.filter((a) => adhkarProgress[a.id]?.completedToday).length
  }, [adhkarProgress])

  // Consistency score color
  const scoreColor =
    consistencyScore >= 80
      ? 'text-accent-green'
      : consistencyScore >= 50
      ? 'text-accent-gold'
      : 'text-amber-500'

  const handleExportPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('Islamic Life OS — Personal Report', 20, 20)
      doc.setFontSize(12)
      doc.text(`Total Dhikr All Time: ${totalAllTime}`, 20, 40)
      doc.text(`Current Streak: ${streak.current} days`, 20, 50)
      doc.text(`Longest Streak: ${streak.longest} days`, 20, 60)
      doc.text(`Total Sessions: ${psychSessions.length}`, 20, 70)
      doc.text(`Consistency Score: ${consistencyScore}/100`, 20, 80)
      if (topStruggle) {
        doc.text(`Top Focus Area: ${t(`psychology.categories.${topStruggle[0]}`)}`, 20, 90)
      }
      doc.text(`Report generated: ${format(new Date(), 'PPP')}`, 20, 110)
      doc.save('islamic-life-report.pdf')
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('stats.title')}</h1>
          <p className="text-text-muted text-sm">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <button onClick={handleExportPDF} className="btn-outline text-sm px-4 py-2">
          📄 {t('stats.export_pdf')}
        </button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label={t('stats.total_dhikr')}
          value={totalAllTime.toLocaleString()}
          sub={t('stats.all_time')}
        />
        <StatCard
          label={t('stats.streak_record')}
          value={streak.longest}
          sub={`${t('stats.days')} — ${t('stats.best_ever')}`}
          color="text-accent-green"
        />
        <StatCard
          label={t('stats.sessions_total')}
          value={psychSessions.length}
          sub={t('stats.sessions_label')}
          color="text-teal-400"
        />
        <div className="card text-center">
          <p className={`text-3xl font-bold ${scoreColor}`}>{consistencyScore}</p>
          <p className="text-text-primary text-sm font-medium mt-1">{t('stats.consistency_score')}</p>
          <div className="mt-2 h-1.5 bg-bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-gold rounded-full transition-all"
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak heatmap */}
      <StreakWidget />

      {/* Adhkar by category pie */}
      {adhkarByCategory.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">{t('stats.category_chart')}</h3>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={adhkarByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {adhkarByCategory.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {adhkarByCategory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-text-muted text-sm">{entry.name}</span>
                  </div>
                  <span className="text-text-primary text-sm font-medium">
                    {entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sessions timeline */}
      {psychSessions.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">{t('stats.sessions_chart')} — {t('stats.last_30')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sessionsTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.tick, fontSize: 10 }}
                interval={6}
              />
              <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#C9A84C"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#C9A84C' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sessions by category bar */}
      {sessionsCatData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">{t('stats.sessions_breakdown')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sessionsCatData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: chartColors.tick, fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: chartColors.tick, fontSize: 10 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#C9A84C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Radar chart: balance */}
      {psychSessions.length >= 3 && (
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">{t('stats.focus_balance')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={chartColors.grid} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: chartColors.tick, fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: '#4A3820', fontSize: 8 }} />
              <Radar
                dataKey="sessions"
                stroke="#C9A84C"
                fill="#C9A84C"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Most used adhkar */}
      {mostUsedAdhkar.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">{t('stats.most_recited')}</h3>
          <div className="space-y-3">
            {mostUsedAdhkar.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-accent-gold font-bold w-6 text-sm shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p dir="rtl" className="font-arabic text-text-primary text-base truncate">
                    {a.arabic.slice(0, 50)}...
                  </p>
                  <p className="text-text-muted text-xs">{a.source}</p>
                </div>
                <span className="text-accent-gold font-bold shrink-0">
                  {a.total.toLocaleString()}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Islamic Profile */}
      <div className="card border-accent-gold gold-glow">
        <h3 className="font-semibold text-accent-gold mb-4">{t('stats.profile')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-text-muted text-xs font-medium uppercase mb-2">Your Path</p>
            <p className="text-text-primary font-semibold">
              {totalAllTime > 1000
                ? `🌟 ${t('stats.path_consistent')}`
                : totalAllTime > 100
                ? `📿 ${t('stats.path_growing')}`
                : `🌱 ${t('stats.path_beginning')}`}
            </p>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium uppercase mb-2">
              {t('stats.top_struggle')}
            </p>
            <p className="text-text-primary font-semibold">
              {topStruggle
                ? t(`psychology.categories.${topStruggle[0]}`)
                : 'No sessions yet'}
            </p>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium uppercase mb-2">{t('stats.today_adhkar')}</p>
            <p className="text-text-primary font-semibold">
              {weeklyAdhkar}/{adhkarDatabase.length} {t('stats.completed')}
            </p>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium uppercase mb-2">
              {t('stats.consistency_score')}
            </p>
            <p className={`font-bold text-xl ${scoreColor}`}>{consistencyScore}/100</p>
          </div>
        </div>

        {psychSessions.length === 0 && totalAllTime === 0 && (
          <div className="mt-4 text-center py-4">
            <p className="text-text-muted">{t('stats.no_data')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
