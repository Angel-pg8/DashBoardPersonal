import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

export function Input({ id, label, error, className = '', ...props }: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replaceAll(' ', '-')}`
  return <label className="field" htmlFor={inputId}><span>{label}</span><input id={inputId} className={`input ${className}`} aria-invalid={Boolean(error)} {...props} />{error && <span className="field__error">{error}</span>}</label>
}

export function AmountInput(props: InputProps) {
  return <Input inputMode="decimal" min="0" step="0.01" {...props} />
}
