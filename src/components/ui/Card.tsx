import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & { children: ReactNode }

export function Card({ className = '', children, ...props }: CardProps) {
  return <section className={`card ${className}`} {...props}>{children}</section>
}
