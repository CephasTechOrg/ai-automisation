import { Icon } from './Icon'

const PALETTE = ['#2563EB', '#0891B2', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0F172A']

function nameToColor(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

interface AvatarProps {
  name?: string
  initials?: string
  size?: number
  color?: string
  square?: boolean
  src?: string
}

export function Avatar({ name, initials, size = 38, color, square = false, src }: AvatarProps) {
  const bg = color || nameToColor(name || initials || 'x')
  const letters = initials || (name ? name.split(' ').map(w => w[0]).slice(0, 2).join('') : '')
  return (
    <div className={'avatar' + (square ? ' avatar-sq' : '')} style={{ width: size, height: size, fontSize: size * 0.36, background: bg + '1A', color: bg }}>
      {src ? <img src={src} alt={name} /> : letters}
    </div>
  )
}

interface BrandTileProps {
  icon?: string
  color: string
  name?: string
  size?: number
}

export function BrandTile({ icon, color, name, size = 38 }: BrandTileProps) {
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: color + '14', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}22` }}>
      {icon ? <Icon name={icon} size={size * 0.5} /> : (name ? name.slice(0, 2).toUpperCase() : '')}
    </div>
  )
}
