import React from 'react'
import { format, subDays, parseISO } from 'date-fns'
import useAppStore from '../store/useAppStore.js'

const DAYS_TO_SHOW = 30

export default function StreakWidget() {
  const { streak } = useAppStore()
  const today = new Date()
  const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
    subDays(today, DAYS_TO_SHOW - 1 - i)
  )

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-text-muted text-sm">Current Streak</p>
          <p className="text-3xl font-bold text-accent-gold">
            {streak.current}
            <span className="text-base font-normal text-text-muted ml-1">days</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-text-muted text-sm">Longest</p>
          <p className="text-xl font-semibold text-accent-green">
            {streak.longest}
            <span className="text-sm text-text-muted ml-1">days</span>
          </p>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${DAYS_TO_SHOW}, 1fr)` }}>
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const active = !!streak.history[key]
          const isToday = key === format(today, 'yyyy-MM-dd')
          return (
            <div
              key={key}
              title={key}
              className={`h-3 rounded-sm transition-all ${
                active
                  ? 'bg-accent-gold'
                  : isToday
                  ? 'bg-accent-gold bg-opacity-30 border border-accent-gold'
                  : 'bg-bg-surface border border-border'
              }`}
            />
          )
        })}
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-text-faint">
          {format(days[0], 'MMM d')}
        </span>
        <span className="text-[10px] text-text-faint">Today</span>
      </div>
    </div>
  )
}
