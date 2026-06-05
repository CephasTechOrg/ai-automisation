'use client'

import { Icon } from './Icon'

interface ToggleProps {
  on: boolean
  onChange: (v: boolean) => void
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button type="button" className={'toggle' + (on ? ' on' : '')} onClick={() => onChange(!on)} aria-pressed={on} />
  )
}

interface FieldProps {
  label?: string
  required?: boolean
  helper?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, required, helper, error, children, className = '' }: FieldProps) {
  return (
    <div className={'field ' + className}>
      {label && <label className="label">{label}{required && <span className="req">*</span>}</label>}
      {children}
      {error
        ? <div className="error-msg"><Icon name="info" size={13} />{error}</div>
        : helper ? <div className="helper">{helper}</div> : null}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  iconRight?: React.ReactNode
  error?: boolean
}

export function Input({ icon, iconRight, error, ...rest }: InputProps) {
  const inp = <input className={'input' + (icon ? ' has-icon' : '') + (error ? ' error' : '')} {...rest} />
  if (!icon && !iconRight) return inp
  return (
    <div className="input-wrap">
      {icon && <span className="input-icon"><Icon name={icon} size={17} /></span>}
      {inp}
      {iconRight && <span className="input-icon input-icon-right">{iconRight}</span>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, ...rest }: TextareaProps) {
  return <textarea className={'textarea' + (error ? ' error' : '')} {...rest} />
}

interface SelectOption { value: string; label: string }
interface SelectProps {
  options: (string | SelectOption)[]
  value: string
  onChange?: (v: string) => void
  placeholder?: string
}

export function Select({ options, value, onChange, placeholder }: SelectProps) {
  return (
    <div className="select" style={{ width: '100%' }}>
      <select className="select-el" value={value} onChange={e => onChange?.(e.target.value)}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.value
          const lab = typeof o === 'string' ? o : o.label
          return <option key={val} value={val}>{lab}</option>
        })}
      </select>
      <span className="chev"><Icon name="chevDown" size={16} /></span>
    </div>
  )
}
