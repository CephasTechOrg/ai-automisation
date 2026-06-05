import { Icon } from './Icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'lg' | ''
  icon?: string
  iconRight?: string
}

export function Button({ variant = 'secondary', size = '', icon, iconRight, children, className = '', ...rest }: ButtonProps) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className].filter(Boolean).join(' ')
  const iconSize = size === 'xs' ? 15 : 17
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  )
}
