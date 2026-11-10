import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', loading = false, type = 'button', className = '', children, disabled, ...props }: ButtonProps) {
  return (
    <button type={type} className={`button button--${variant} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <span className="button__loading">Cargando</span> : children}
    </button>
  )
}
