import { forwardRef, type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ id, label, error, className = '', ...props }, ref) {
  const inputId = id ?? `input-${label.toLowerCase().replaceAll(' ', '-')}`
  return <label className="field" htmlFor={inputId}><span>{label}</span><input ref={ref} id={inputId} className={`input ${className}`} aria-invalid={Boolean(error)} {...props} />{error && <span className="field__error">{error}</span>}</label>
})

export const AmountInput = forwardRef<HTMLInputElement, InputProps>(function AmountInput(props, ref) {
  return <Input ref={ref} inputMode="decimal" min="0" step="0.01" {...props} />
})
