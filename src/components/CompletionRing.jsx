import React from 'react'

export default function CompletionRing({ done, total, size = 120 }) {
  const pct = total === 0 ? 0 : Math.min(done / total, 1)
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="completion-ring">
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#C9A84C"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-accent-gold">
          {done}/{total}
        </span>
        <span className="text-[10px] text-text-muted">
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  )
}
