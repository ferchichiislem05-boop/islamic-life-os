import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAppStore from '../store/useAppStore.js'
import clsx from 'clsx'

export default function AdhkarCard({ adhkar }) {
  const { t, i18n } = useTranslation()
  const { adhkarProgress, incrementAdhkar, resetAdhkar } = useAppStore()
  const [showDetails, setShowDetails] = useState(false)
  const [bounce, setBounce] = useState(false)

  const lang = i18n.language
  const progress = adhkarProgress[adhkar.id] || { count: 0, completedToday: false }
  const done = progress.count >= adhkar.target
  const pct = Math.min((progress.count / adhkar.target) * 100, 100)

  const handleIncrement = () => {
    if (!done) {
      incrementAdhkar(adhkar.id, adhkar.target)
      setBounce(true)
      setTimeout(() => setBounce(false), 200)
    }
  }

  return (
    <div
      className={clsx(
        'card transition-all duration-300',
        done && 'border-accent-green opacity-80'
      )}
    >
      {/* Arabic text */}
      <div dir="rtl" className="mb-4">
        <p className="arabic-text text-text-primary leading-loose">{adhkar.arabic}</p>
      </div>

      {/* Translation */}
      <p className="text-text-muted text-sm mb-3 leading-relaxed">
        {adhkar.translation[lang] || adhkar.translation.en}
      </p>

      {/* Source badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="badge-gold">{adhkar.source}</span>
        {done && <span className="badge-green">✓ {t('adhkar.completed')}</span>}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>{progress.count} / {adhkar.target} {t('adhkar.times')}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-gold rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Details toggle */}
      {showDetails && (
        <div className="mb-3 p-3 bg-bg-surface rounded-lg border border-border animate-in">
          <p className="text-xs text-text-muted mb-1 font-medium uppercase tracking-wide">
            {t('adhkar.virtue')}
          </p>
          <p className="text-sm text-text-primary leading-relaxed">
            {adhkar.virtue[lang] || adhkar.virtue.en}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleIncrement}
          disabled={done}
          className={clsx(
            'flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95',
            bounce && 'counter-pop',
            done
              ? 'bg-accent-green text-white cursor-default'
              : 'btn-gold'
          )}
        >
          {done ? `✓ ${t('adhkar.complete')}` : `${t('common.allahu_akbar').slice(0, 8)}... +1`}
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-ghost px-3 py-2.5 text-sm"
        >
          {showDetails ? '▲' : '▼'}
        </button>
        <button
          onClick={() => resetAdhkar(adhkar.id)}
          className="btn-ghost px-3 py-2.5 text-sm text-text-faint hover:text-amber-400"
          title={t('adhkar.reset')}
        >
          ↺
        </button>
      </div>
    </div>
  )
}
