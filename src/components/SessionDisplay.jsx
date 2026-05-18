import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAppStore from '../store/useAppStore.js'
import { validatePsychResponse } from '../services/claudeApi.js'
import clsx from 'clsx'

// ─── Sub-components ────────────────────────────────────────────────────────

function AyahCard({ ayah }) {
  return (
    <div className="ayat-card mb-3">
      <div dir="rtl" className="mb-3">
        <p className="arabic-text">{ayah.arabic}</p>
      </div>
      <p className="text-text-secondary text-sm italic leading-relaxed mb-2">
        "{ayah.translation}"
      </p>
      <div className="flex items-start gap-2 flex-wrap">
        <span className="badge-gold shrink-0">{ayah.surah}</span>
        {ayah.relevance && (
          <p className="text-text-muted text-xs">{ayah.relevance}</p>
        )}
      </div>
    </div>
  )
}

function HadithCard({ hadith }) {
  return (
    <div className="hadith-card mb-3">
      {hadith.arabic && (
        <div dir="rtl" className="mb-3">
          <p className="arabic-text-sm">{hadith.arabic}</p>
        </div>
      )}
      <p className="text-text-secondary text-sm italic leading-relaxed mb-2">
        "{hadith.text}"
      </p>
      <div className="flex items-start gap-2 flex-wrap">
        <span className="badge-gold shrink-0">{hadith.source}</span>
        {hadith.context && (
          <p className="text-text-muted text-xs">{hadith.context}</p>
        )}
      </div>
    </div>
  )
}

function PropheticModelCard({ model }) {
  return (
    <div className="seerah-card-gold">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent-gold text-xl">🌙</span>
        <h4 className="font-semibold text-accent-gold text-base">{model.incident}</h4>
      </div>
      <p className="text-text-primary text-sm leading-relaxed mb-3">{model.narrative}</p>
      {model.parallel && (
        <div className="bg-bg-surface rounded-lg p-3 border border-border">
          <p className="text-xs text-accent-gold font-medium uppercase tracking-wide mb-1">
            {t('psychology.session_output.how_applies')}
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">{model.parallel}</p>
        </div>
      )}
    </div>
  )
}

function ExerciseItem({ exercise, index, sessionId, onCheck }) {
  return (
    <div className={clsx('card mb-2 transition-opacity', exercise.checked && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={!!exercise.checked}
          onChange={(e) => onCheck(index, e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
          style={{ accentColor: '#C9A84C' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h5
              className={clsx(
                'font-semibold text-sm',
                exercise.checked ? 'line-through text-text-muted' : 'text-text-primary'
              )}
            >
              {exercise.title}
            </h5>
            <span
              className={clsx(
                'badge text-[10px] shrink-0',
                exercise.type === 'dhikr'        ? 'badge-gold'  :
                exercise.type === 'cognitive'    ? 'badge-teal'  :
                exercise.type === 'physical'     ? 'badge-green' :
                exercise.type === 'journaling'   ? 'badge-amber' :
                                                   'badge-gold'
              )}
            >
              {exercise.type}
            </span>
            {exercise.duration && (
              <span className="text-text-muted text-[10px] shrink-0">
                ⏱ {exercise.duration}
              </span>
            )}
          </div>
          {exercise.description && (
            <p className="text-text-muted text-sm leading-relaxed">{exercise.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function WeeklyPlanDay({ day, isToday }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(isToday)
  return (
    <div
      className={clsx(
        'card mb-2 cursor-pointer select-none transition-all',
        isToday && 'border-accent-gold'
      )}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
            isToday
              ? 'bg-accent-gold text-bg-primary'
              : 'bg-bg-surface text-text-muted border border-border'
          )}
        >
          {day.day}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary text-sm">{day.focus}</p>
          {!open && day.task && (
            <p className="text-text-muted text-xs truncate">{day.task}</p>
          )}
        </div>
        <span className="text-text-faint text-sm shrink-0">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-border space-y-3 animate-in">
          {day.task && (
            <div>
              <p className="text-xs text-text-muted font-medium uppercase mb-1">
                {t('psychology.session_output.today_task')}
              </p>
              <p className="text-text-primary text-sm leading-relaxed">{day.task}</p>
            </div>
          )}
          {day.dua && (
            <div dir="rtl" className="bg-bg-surface rounded-lg p-3 border border-border">
              <p className="text-text-muted text-xs mb-1" dir="ltr">{t('psychology.session_output.dua')}</p>
              <p className="arabic-text-sm">{day.dua}</p>
            </div>
          )}
          {day.reflection && (
            <div>
              <p className="text-xs text-text-muted font-medium uppercase mb-1">
                {t('psychology.session_output.evening_reflection')}
              </p>
              <p className="text-text-muted text-sm italic">{day.reflection}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Malformed session fallback UI ─────────────────────────────────────────
function MalformedSession() {
  return (
    <div className="card border-amber-700 text-center py-8">
      <p className="text-amber-400 text-2xl mb-2">⚠️</p>
      <p className="text-text-primary font-medium mb-1">
        Session data could not be displayed
      </p>
      <p className="text-text-muted text-sm">
        The AI response was malformed. Start a new session to try again.
      </p>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function SessionDisplay({ session, isNew = false }) {
  const { t } = useTranslation()
  const {
    updateSessionNotes,
    updateSessionExerciseCheck,
    toggleSessionBookmark,
  } = useAppStore()

  const [notes, setNotes] = useState(session.notes || '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('ayaat')

  // Validate / sanitise the stored AI response on every render
  const data = React.useMemo(
    () => validatePsychResponse(session.aiResponse),
    [session.aiResponse]
  )

  if (!data) return <MalformedSession />

  const handleSaveNotes = () => {
    updateSessionNotes(session.id, notes)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const handleExerciseCheck = (index, checked) => {
    updateSessionExerciseCheck(session.id, index, checked)
  }

  const tabs = [
    { id: 'ayaat',     label: t('psychology.session_output.ayaat'),      icon: '📖', count: data.ayaat?.length },
    { id: 'ahadith',   label: t('psychology.session_output.ahadith'),    icon: '📜', count: data.ahadith?.length },
    { id: 'seerah',    label: t('psychology.session_output.seerah'),     icon: '🌙', count: data.propheticModel ? 1 : 0 },
    { id: 'exercises', label: t('psychology.session_output.exercises'),  icon: '✅', count: data.exercises?.length },
    { id: 'plan',      label: t('psychology.session_output.weekly_plan'),icon: '📅', count: data.weeklyPlan?.length },
  ]

  return (
    <div className={clsx('space-y-4', isNew && 'animate-in')}>
      {/* ── Pattern banner ── */}
      <div className="card border-accent-gold gold-glow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs text-accent-gold font-semibold uppercase tracking-wider mb-1">
              {t('psychology.session_output.pattern')}
            </p>
            <h3 className="text-lg font-bold text-text-primary">{data.pattern}</h3>
          </div>
          <button
            onClick={() => toggleSessionBookmark(session.id)}
            className={clsx(
              'text-2xl transition-all shrink-0 leading-none',
              session.bookmarked
                ? 'text-accent-gold'
                : 'text-text-faint hover:text-accent-gold'
            )}
            title={t('psychology.session_output.bookmark')}
          >
            {session.bookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* ── Root belief block (amber) ── */}
      {data.rootBelief && (
        <div className="belief-block">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            {t('psychology.session_output.core_belief')}
          </p>
          <p className="text-amber-200 font-semibold text-base">
            "{data.rootBelief}"
          </p>
        </div>
      )}

      {/* ── Islamic reframe (teal) ── */}
      {data.islamicReframe && (
        <div className="reframe-block">
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
            {t('psychology.session_output.islamicReframe')}
          </p>
          <p className="text-teal-100 text-sm leading-relaxed">{data.islamicReframe}</p>
        </div>
      )}

      {/* ── Content tabs ── */}
      <div>
        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
                activeTab === tab.id
                  ? 'bg-accent-gold text-bg-primary'
                  : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={clsx(
                    'text-[10px] rounded-full px-1.5 py-0.5 font-bold',
                    activeTab === tab.id
                      ? 'bg-bg-primary text-accent-gold'
                      : 'bg-bg-elevated text-text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === 'ayaat' && (
          <div className="animate-in">
            {data.ayaat.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">No ayaat in this session.</p>
            ) : (
              data.ayaat.map((ayah, i) => <AyahCard key={i} ayah={ayah} />)
            )}
          </div>
        )}

        {activeTab === 'ahadith' && (
          <div className="animate-in">
            {data.ahadith.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">No hadith in this session.</p>
            ) : (
              data.ahadith.map((h, i) => <HadithCard key={i} hadith={h} />)
            )}
          </div>
        )}

        {activeTab === 'seerah' && (
          <div className="animate-in">
            {!data.propheticModel ? (
              <p className="text-text-muted text-sm text-center py-6">No Seerah story in this session.</p>
            ) : (
              <PropheticModelCard model={data.propheticModel} />
            )}
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="animate-in">
            {data.exercises.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">No exercises in this session.</p>
            ) : (
              data.exercises.map((ex, i) => (
                <ExerciseItem
                  key={i}
                  exercise={ex}
                  index={i}
                  sessionId={session.id}
                  onCheck={handleExerciseCheck}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="animate-in">
            {data.weeklyPlan.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">No weekly plan in this session.</p>
            ) : (
              data.weeklyPlan.map((day, i) => (
                <WeeklyPlanDay key={day.day} day={day} isToday={i === 0} />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Personal notes ── */}
      <div className="card">
        <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">
          {t('psychology.session_output.notes')}
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('psychology.notes_placeholder')}
          rows={4}
          className="textarea-field text-sm"
        />
        <button
          onClick={handleSaveNotes}
          className={clsx(
            'mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
            notesSaved
              ? 'bg-accent-green text-white'
              : 'btn-outline'
          )}
        >
          {notesSaved ? '✓ Saved' : t('psychology.session_output.save_notes')}
        </button>
      </div>
    </div>
  )
}
