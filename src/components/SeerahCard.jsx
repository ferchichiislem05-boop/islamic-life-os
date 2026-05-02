import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import clsx from 'clsx'

export default function SeerahCard({ story }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { seerahBookmarks, toggleSeerahBookmark } = useAppStore()
  const [expanded, setExpanded] = useState(false)

  const lang = i18n.language
  const isBookmarked = seerahBookmarks.includes(story.id)

  const getTitle = () => story.title?.[lang] || story.title?.en || ''
  const getSituation = () => story.situation?.[lang] || story.situation?.en || ''
  const getResponse = () => story.hisResponse?.[lang] || story.hisResponse?.en || ''
  const getEmotional = () => story.emotionalDetail?.[lang] || story.emotionalDetail?.en || ''
  const getModern = () => story.modernParallel?.[lang] || story.modernParallel?.en || ''
  const getLesson = () => story.keyLesson?.[lang] || story.keyLesson?.en || ''

  const handleSendToPsych = () => {
    navigate('/psychology', {
      state: { seerahContext: { id: story.id, title: getTitle(), lesson: getLesson() } },
    })
  }

  return (
    <div className={clsx('card transition-all duration-300', expanded && 'border-accent-gold gold-glow')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-base leading-snug">{getTitle()}</h3>
          {story.title?.ar && (
            <p dir="rtl" className="text-accent-gold font-arabic text-sm mt-0.5">
              {story.title.ar}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleSeerahBookmark(story.id)}
            className={clsx(
              'text-xl transition-all',
              isBookmarked ? 'text-accent-gold' : 'text-text-faint hover:text-accent-gold'
            )}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Tags */}
      {story.tags && (
        <div className="flex flex-wrap gap-1 mb-3">
          {story.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag-gold text-[10px]">{tag}</span>
          ))}
        </div>
      )}

      {/* Situation preview */}
      <p className="text-text-muted text-sm leading-relaxed mb-3 line-clamp-3">
        {getSituation()}
      </p>

      {/* Expanded content */}
      {expanded && (
        <div className="animate-in space-y-4 border-t border-border pt-4">
          {/* His Response */}
          <div>
            <p className="text-xs text-accent-gold font-medium uppercase tracking-wider mb-2">
              {t('seerah.response')}
            </p>
            <p className="text-text-primary text-sm leading-relaxed">{getResponse()}</p>
          </div>

          {/* Emotional Detail */}
          <div className="card bg-bg-surface border-amber-800 border">
            <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-2">
              {t('seerah.emotional')}
            </p>
            <p className="text-text-primary text-sm leading-relaxed">{getEmotional()}</p>
          </div>

          {/* Modern Parallel */}
          <div className="reframe-block">
            <p className="text-xs text-teal-400 font-medium uppercase tracking-wider mb-2">
              {t('seerah.modern')}
            </p>
            <p className="text-teal-100 text-sm leading-relaxed">{getModern()}</p>
          </div>

          {/* Quran Reference */}
          {story.quranLink && (
            <div className="ayat-card">
              <p className="text-xs text-accent-gold font-medium uppercase mb-2">{t('seerah.quran')}</p>
              <div dir="rtl" className="mb-2">
                <p className="font-arabic text-text-primary text-xl leading-loose">
                  {story.quranLink.arabic}
                </p>
              </div>
              <p className="text-text-muted text-sm italic mb-1">"{story.quranLink.translation}"</p>
              <span className="badge-gold">{story.quranLink.ref}</span>
            </div>
          )}

          {/* Hadith */}
          {story.hadith && (
            <div className="hadith-card">
              <p className="text-xs text-accent-gold font-medium uppercase mb-2">{t('seerah.hadith')}</p>
              {story.hadith.arabic && (
                <div dir="rtl" className="mb-2">
                  <p className="font-arabic text-text-primary text-base leading-loose">
                    {story.hadith.arabic}
                  </p>
                </div>
              )}
              <p className="text-text-muted text-sm italic mb-1">"{story.hadith.translation}"</p>
              <span className="badge-gold">{story.hadith.source}</span>
            </div>
          )}

          {/* Key Lesson */}
          <div className="card border-accent-green">
            <p className="text-xs text-accent-green font-medium uppercase tracking-wider mb-2">
              {t('seerah.lesson')}
            </p>
            <p className="text-text-primary font-medium text-sm leading-relaxed">{getLesson()}</p>
          </div>

          {/* Send to Psych */}
          <button
            onClick={handleSendToPsych}
            className="w-full btn-outline text-sm py-2.5"
          >
            🧠 {t('seerah.send_to_psych')}
          </button>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 w-full text-xs text-accent-gold hover:text-accent-gold-light font-medium py-1 transition-all"
      >
        {expanded ? `▲ ${t('seerah.collapse')}` : `▼ ${t('seerah.expand')}`}
      </button>
    </div>
  )
}
