import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import seerahDatabase, { seerahCategories } from '../data/seerah.js'
import SeerahCard from '../components/SeerahCard.jsx'
import useAppStore from '../store/useAppStore.js'
import { generateSeerahStory } from '../services/claudeApi.js'
import clsx from 'clsx'

export default function Seerah() {
  const { t, i18n } = useTranslation()
  const { seerahBookmarks } = useAppStore()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiStory, setAiStory] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const lang = i18n.language

  const filtered = useMemo(() => {
    let list = seerahDatabase
    if (showBookmarks) {
      list = list.filter((s) => seerahBookmarks.includes(s.id))
    } else if (activeCategory !== 'all') {
      list = list.filter((s) => s.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          (s.title?.en || '').toLowerCase().includes(q) ||
          (s.title?.ar || '').includes(q) ||
          (s.tags || []).some((tag) => tag.includes(q)) ||
          (s.situation?.en || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, searchQuery, showBookmarks, seerahBookmarks])

  const handleAiStory = async () => {
    if (!aiTopic.trim()) return
    setAiLoading(true)
    setAiError('')
    setAiStory(null)
    try {
      const story = await generateSeerahStory(aiTopic)
      setAiStory(story)
    } catch (err) {
      setAiError('Could not generate story. Check your API key.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('seerah.title')}</h1>
        <p className="text-text-muted text-sm">{t('seerah.subtitle')}</p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search stories, tags, themes..."
        className="input-field"
      />

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => { setActiveCategory('all'); setShowBookmarks(false) }}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
            activeCategory === 'all' && !showBookmarks
              ? 'bg-accent-gold text-bg-primary'
              : 'bg-bg-surface text-text-muted hover:text-text-primary'
          )}
        >
          {t('seerah.all')}
        </button>
        {seerahCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setShowBookmarks(false) }}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
              activeCategory === cat.id && !showBookmarks
                ? 'bg-accent-gold text-bg-primary'
                : 'bg-bg-surface text-text-muted hover:text-text-primary'
            )}
          >
            <span>{cat.icon}</span>
            <span className="hidden sm:block">{cat.label[lang] || cat.label.en}</span>
          </button>
        ))}
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
            showBookmarks
              ? 'bg-accent-gold text-bg-primary'
              : 'bg-bg-surface text-text-muted hover:text-text-primary'
          )}
        >
          ★ Saved ({seerahBookmarks.length})
        </button>
      </div>

      {/* AI Story Generator */}
      <div className="card border-teal-700">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          ✨ Ask Claude for a Seerah Story
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="e.g. 'how the Prophet handled business failure' or 'his mercy toward enemies'"
            className="input-field"
            onKeyDown={(e) => e.key === 'Enter' && handleAiStory()}
          />
          <button
            onClick={handleAiStory}
            disabled={aiLoading}
            className="btn-gold shrink-0 px-4 text-sm"
          >
            {aiLoading ? '...' : 'Ask'}
          </button>
        </div>

        {aiLoading && (
          <div className="text-center py-4 mt-3">
            <div className="text-accent-gold animate-spin-slow text-2xl mb-2">☽</div>
            <p className="text-text-muted text-sm">{t('psychology.ai_thinking')}</p>
          </div>
        )}

        {aiError && <p className="text-red-400 text-sm mt-2">{aiError}</p>}

        {aiStory && (
          <div className="mt-4 animate-in space-y-3 border-t border-border pt-4">
            <h4 className="font-bold text-accent-gold text-lg">{aiStory.title}</h4>
            <p className="text-text-primary text-sm leading-relaxed">{aiStory.narrative}</p>
            {aiStory.modernParallel && (
              <div className="reframe-block">
                <p className="text-xs text-teal-400 font-medium uppercase mb-1">Modern Parallel</p>
                <p className="text-teal-100 text-sm">{aiStory.modernParallel}</p>
              </div>
            )}
            {aiStory.keyLesson && (
              <div className="card border-accent-green">
                <p className="text-xs text-accent-green font-medium uppercase mb-1">Key Lesson</p>
                <p className="text-text-primary text-sm font-medium">{aiStory.keyLesson}</p>
              </div>
            )}
            {aiStory.dua && (
              <div className="ayat-card">
                <div dir="rtl" className="mb-1">
                  <p className="font-arabic text-text-primary text-lg leading-loose">{aiStory.dua.arabic}</p>
                </div>
                <p className="text-text-muted text-sm italic">"{aiStory.dua.translation}"</p>
                <span className="badge-gold text-xs mt-1 inline-block">{aiStory.dua.source}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stories grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">
            {showBookmarks && seerahBookmarks.length === 0
              ? 'No bookmarks yet. Star stories you want to revisit.'
              : 'No stories found.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((story) => (
            <SeerahCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}
