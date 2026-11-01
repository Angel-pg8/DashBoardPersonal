import type { ButtonHTMLAttributes } from 'react'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }

export function Chip({ selected = false, className = '', children, ...props }: ChipProps) {
  return <button className={`chip ${selected ? 'chip--selected' : ''} ${className}`} aria-pressed={selected} {...props}>{children}</button>
}
