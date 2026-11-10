import type { ButtonHTMLAttributes } from 'react'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }

export function Chip({ selected = false, type = 'button', className = '', children, ...props }: ChipProps) {
  return <button type={type} className={`chip ${selected ? 'chip--selected' : ''} ${className}`} aria-pressed={selected} {...props}>{children}</button>
}
