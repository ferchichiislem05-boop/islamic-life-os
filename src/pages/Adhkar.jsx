import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import adhkarDatabase, { adhkarCategories, quickSuggestions } from '../data/adhkar.js'
import AdhkarCard from '../components/AdhkarCard.jsx'
import useAppStore from '../store/useAppStore.js'
import { searchDuas } from '../services/claudeApi.js'
import clsx from 'clsx'

export default function Adhkar() {
  const { t, i18n } = useTranslation()
  const { adhkarProgress } = useAppStore()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAiSearch, setShowAiSearch] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResults, setAiResults] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const lang = i18n.language

  const filtered = useMemo(() => {
    let list = adhkarDatabase
    if (activeTab !== 'all') {
      list = list.filter((a) => a.category === activeTab)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.arabic.includes(q) ||
          (a.translation.en || '').toLowerCase().includes(q) ||
          (a.translation.fr || '').toLowerCase().includes(q) ||
          (a.transliteration || '').toLowerCase().includes(q) ||
          (a.source || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [activeTab, searchQuery])

  const sessionComplete = useMemo(() => {
    if (activeTab === 'all') return false
    const sessionAdhkar = adhkarDatabase.filter((a) => a.category === activeTab)
    return (
      sessionAdhkar.length > 0 &&
      sessionAdhkar.every((a) => adhkarProgress[a.id]?.completedToday)
    )
  }, [activeTab, adhkarProgress])

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    setAiError('')
    setAiResults(null)
    try {
      const data = await searchDuas(aiQuery)
      setAiResults(data.duas)
    } catch (err) {
      setAiError('Could not fetch duas. Check your API key in .env')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSuggestion = (suggestion) => {
    if (showAiSearch) {
      setAiQuery(suggestion.query)
    } else {
      setSearchQuery(suggestion.query)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('adhkar.title')}</h1>
        <p className="text-text-muted text-sm">
          {t('common.bismillah')}
        </p>
      </div>

      {/* Session complete banner */}
      {sessionComplete && (
        <div className="card border-accent-green gold-glow text-center py-4 animate-in">
          <p className="text-2xl mb-1">🌟</p>
          <p className="font-bold text-accent-green text-lg">{t('adhkar.session_complete')}</p>
          <p className="text-text-muted text-sm">{t('adhkar.session_complete_sub')}</p>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
            activeTab === 'all'
              ? 'bg-accent-gold text-bg-primary'
              : 'bg-bg-surface text-text-muted hover:text-text-primary'
          )}
        >
          {t('adhkar.all')}
        </button>
        {adhkarCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
              activeTab === cat.id
                ? 'bg-accent-gold text-bg-primary'
                : 'bg-bg-surface text-text-muted hover:text-text-primary'
            )}
          >
            <span>{cat.icon}</span>
            {cat.label[lang] || cat.label.en}
          </button>
        ))}
        <button
          onClick={() => setShowAiSearch(!showAiSearch)}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
            showAiSearch
              ? 'bg-teal-700 text-white'
              : 'bg-bg-surface text-text-muted hover:text-text-primary'
          )}
        >
          ✨ AI
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-text-muted text-xs self-center">{t('adhkar.suggestions')}:</span>
        {quickSuggestions.map((s) => (
          <button
            key={s.query}
            onClick={() => handleSuggestion(s)}
            className="text-xs px-3 py-1 rounded-full bg-bg-surface border border-border text-text-muted hover:border-accent-gold hover:text-accent-gold transition-all"
          >
            {s.label[lang] || s.label.en}
          </button>
        ))}
      </div>

      {/* Search or AI search */}
      {!showAiSearch ? (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('adhkar.search_placeholder')}
          className="input-field"
        />
      ) : (
        <div className="card space-y-3">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            ✨ {t('adhkar.ai_search')}
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={t('adhkar.ai_placeholder')}
              className="input-field"
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
            />
            <button
              onClick={handleAiSearch}
              disabled={aiLoading}
              className="btn-gold shrink-0 px-4 py-2 text-sm"
            >
              {aiLoading ? '...' : t('adhkar.ai_search_btn')}
            </button>
          </div>

          {aiLoading && (
            <div className="text-center py-4">
              <div className="text-accent-gold animate-spin-slow text-2xl mb-2">☽</div>
              <p className="text-text-muted text-sm">{t('psychology.ai_thinking')}</p>
            </div>
          )}

          {aiError && (
            <p className="text-red-400 text-sm">{aiError}</p>
          )}

          {aiResults && (
            <div className="space-y-3 animate-in">
              <p className="text-text-muted text-sm font-medium">{t('adhkar.ai_results')}</p>
              {aiResults.map((dua, i) => (
                <div key={i} className="ayat-card">
                  <div dir="rtl" className="mb-2">
                    <p className="arabic-text text-text-primary">{dua.arabic}</p>
                  </div>
                  {dua.transliteration && (
                    <p className="text-accent-gold text-sm italic mb-2">{dua.transliteration}</p>
                  )}
                  <p className="text-text-muted text-sm mb-2">"{dua.translation}"</p>
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="badge-gold">{dua.source}</span>
                    {dua.howToUse && (
                      <p className="text-text-faint text-xs">{dua.howToUse}</p>
                    )}
                  </div>
                  {dua.context && (
                    <p className="text-text-muted text-xs mt-2 italic">{dua.context}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adhkar list */}
      {!showAiSearch && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">{t('adhkar.no_results')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((adhkar) => (
                <AdhkarCard key={adhkar.id} adhkar={adhkar} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
