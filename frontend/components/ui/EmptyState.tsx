import { Icon } from './Icon'

interface EmptyStateProps {
  icon?: string
  title: string
  text?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = 'inbox', title, text, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--muted-bg)', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Icon name={icon} size={26} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      {text && <div className="muted" style={{ fontSize: 13.5, maxWidth: 320 }}>{text}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}
