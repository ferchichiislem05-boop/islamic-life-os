import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

const MAX_SESSIONS = 50

const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Adhkar Progress ────────────────────────────────────────────
      adhkarProgress: {},

      incrementAdhkar: (id, target) => {
        const now = new Date().toISOString()
        set((state) => {
          const current = state.adhkarProgress[id] || {
            count: 0,
            completedToday: false,
            lastCompleted: null,
            totalAllTime: 0,
          }
          const newCount = current.count + 1
          const completed = newCount >= target
          return {
            adhkarProgress: {
              ...state.adhkarProgress,
              [id]: {
                count: newCount,
                completedToday: completed,
                lastCompleted: now,
                totalAllTime: (current.totalAllTime || 0) + 1,
              },
            },
          }
        })
        get().checkAndUpdateStreak()
      },

      resetAdhkar: (id) => {
        set((state) => ({
          adhkarProgress: {
            ...state.adhkarProgress,
            [id]: {
              ...(state.adhkarProgress[id] || {}),
              count: 0,
              completedToday: false,
            },
          },
        }))
      },

      resetDailyAdhkar: () => {
        set((state) => {
          const updated = {}
          Object.entries(state.adhkarProgress).forEach(([id, val]) => {
            updated[id] = { ...val, count: 0, completedToday: false }
          })
          return { adhkarProgress: updated }
        })
      },

      // ─── Streak System ───────────────────────────────────────────────
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: null,
        history: {},
      },

      checkAndUpdateStreak: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        set((state) => {
          const { streak, adhkarProgress } = state
          const hasActivityToday = Object.values(adhkarProgress).some(
            (p) => p.completedToday
          )
          if (!hasActivityToday) return state

          const history = { ...streak.history, [today]: true }
          let current = streak.current
          let longest = streak.longest

          if (streak.lastActiveDate) {
            const last = streak.lastActiveDate
            if (last === today) {
              return { streak: { ...streak, history } }
            }
            const lastDate = parseISO(last)
            if (isYesterday(lastDate)) {
              current = current + 1
            } else {
              current = 1
            }
          } else {
            current = 1
          }

          longest = Math.max(longest, current)
          return {
            streak: {
              current,
              longest,
              lastActiveDate: today,
              history,
            },
          }
        })
      },

      // ─── Psychology Sessions ─────────────────────────────────────────
      psychSessions: [],

      savePsychSession: (session) => {
        set((state) => {
          const newSession = {
            id: uuidv4(),
            date: new Date().toISOString(),
            bookmarked: false,
            notes: '',
            ...session,
          }
          const sessions = [newSession, ...state.psychSessions].slice(
            0,
            MAX_SESSIONS
          )
          return { psychSessions: sessions }
        })
      },

      updateSessionNotes: (id, notes) => {
        set((state) => ({
          psychSessions: state.psychSessions.map((s) =>
            s.id === id ? { ...s, notes } : s
          ),
        }))
      },

      toggleSessionBookmark: (id) => {
        set((state) => ({
          psychSessions: state.psychSessions.map((s) =>
            s.id === id ? { ...s, bookmarked: !s.bookmarked } : s
          ),
        }))
      },

      deleteSession: (id) => {
        set((state) => ({
          psychSessions: state.psychSessions.filter((s) => s.id !== id),
        }))
      },

      updateSessionExerciseCheck: (sessionId, exerciseIndex, checked) => {
        set((state) => ({
          psychSessions: state.psychSessions.map((s) => {
            if (s.id !== sessionId) return s
            const exercises = [...(s.aiResponse?.exercises || [])]
            if (exercises[exerciseIndex]) {
              exercises[exerciseIndex] = {
                ...exercises[exerciseIndex],
                checked,
              }
            }
            return {
              ...s,
              aiResponse: { ...s.aiResponse, exercises },
            }
          }),
        }))
      },

      // ─── Seerah Bookmarks ─────────────────────────────────────────────
      seerahBookmarks: [],

      toggleSeerahBookmark: (seerahId) => {
        set((state) => {
          const exists = state.seerahBookmarks.includes(seerahId)
          return {
            seerahBookmarks: exists
              ? state.seerahBookmarks.filter((id) => id !== seerahId)
              : [...state.seerahBookmarks, seerahId],
          }
        })
      },

      // ─── User Preferences ─────────────────────────────────────────────
      prefs: {
        lang: 'en',
        theme: 'dark',
        dailySessions: ['sabah', 'masa2', 'nawm'],
        notificationsEnabled: false,
      },

      setLang: (lang) => {
        set((state) => ({
          prefs: { ...state.prefs, lang },
        }))
      },

      setTheme: (theme) => {
        set((state) => ({
          prefs: { ...state.prefs, theme },
        }))
      },

      toggleDailySession: (session) => {
        set((state) => {
          const sessions = state.prefs.dailySessions
          const updated = sessions.includes(session)
            ? sessions.filter((s) => s !== session)
            : [...sessions, session]
          return { prefs: { ...state.prefs, dailySessions: updated } }
        })
      },

      // ─── Computed Selectors ───────────────────────────────────────────
      getTotalDhikrToday: () => {
        const { adhkarProgress } = get()
        return Object.values(adhkarProgress).reduce(
          (sum, p) => sum + (p.count || 0),
          0
        )
      },

      getTotalDhikrAllTime: () => {
        const { adhkarProgress } = get()
        return Object.values(adhkarProgress).reduce(
          (sum, p) => sum + (p.totalAllTime || 0),
          0
        )
      },

      getSessionsByCategory: () => {
        const { psychSessions } = get()
        const counts = {}
        psychSessions.forEach((s) => {
          const cat = s.category || 'other'
          counts[cat] = (counts[cat] || 0) + 1
        })
        return counts
      },

      getTopStruggle: () => {
        const counts = get().getSessionsByCategory()
        if (Object.keys(counts).length === 0) return null
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      },

      getConsistencyScore: () => {
        const { streak, psychSessions } = get()
        const streakScore = Math.min(streak.current * 3, 60)
        const sessionScore = Math.min(psychSessions.length * 4, 40)
        return Math.min(streakScore + sessionScore, 100)
      },
    }),
    {
      name: 'islamic-life-os',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useAppStore
