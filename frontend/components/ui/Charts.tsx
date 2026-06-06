'use client'

import { useState, useEffect, useRef, useId } from 'react'

interface DataPoint { label: string; v: number }

interface AreaChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  maxOverride?: number
}

export function AreaChart({ data, height = 220, color = 'var(--primary)', maxOverride }: AreaChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(640)
  const uid = useId()

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(es => { for (const e of es) setW(e.contentRect.width) })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const padL = 38, padR = 14, padT = 14, padB = 28
  const max = maxOverride || Math.ceil(Math.max(...data.map(d => d.v)) / 20) * 20 || 100
  const innerW = Math.max(w - padL - padR, 10)
  const innerH = height - padT - padB
  const x = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v: number) => padT + innerH - (v / max) * innerH
  const pts = data.map((d, i) => [x(i), y(d.v)] as [number, number])
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]).join(' ')
  const area = line + ` L${pts[pts.length - 1][0]} ${padT + innerH} L${pts[0][0]} ${padT + innerH} Z`
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max]
  const gid = 'ag' + uid.replace(/:/g, '')

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--divider)" strokeDasharray={i === 0 ? '0' : '3 4'} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--text-disabled)">
              {Math.round(t) >= 1000 ? (Math.round(t) / 1000) + 'K' : Math.round(t)}
            </text>
          </g>
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill="#fff" stroke={color} strokeWidth={2} />)}
        {data.map((d, i) => <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{d.label}</text>)}
      </svg>
    </div>
  )
}

interface DonutProps {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  label?: string
  sub?: string
}

export function Donut({ value, size = 150, stroke = 14, color = 'var(--primary)', track = '#E2E8F0', label, sub }: DonutProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (value / 100) * c
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{label || value + '%'}</div>
        {sub && <div className="muted" style={{ fontSize: 12, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  )
}
