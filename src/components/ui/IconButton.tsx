import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }

export function IconButton({ label, className = '', children, ...props }: IconButtonProps) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>
}
