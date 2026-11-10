import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { AmountInput, Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { db, withSyncFields } from '../../db/database'
import type { Account, AccountKind, Category, Transaction } from '../../db/types'
import { accountBalanceCents, categoriesByUsage } from '../../lib/budget'
import { formatUsdCents, parseAmountCents, parseSignedAmountCents } from '../../lib/money'

type EntryType = Transaction['type']
type DateChoice = 'today' | 'yesterday' | 'other'
type AccountForm = { name: string; kind: AccountKind; openingBalance: string }
type Toast = { transactionId: string; message: string } | null

function localDate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function priorDay(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return localDate(yesterday)
}

function accountKindLabel(kind: AccountKind): string {
  return { cash: 'Efectivo', bank: 'Banco', savings: 'Ahorro', card: 'Tarjeta' }[kind]
}

export function FinancePage(): JSX.Element {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [quickOpen, setQuickOpen] = useState(false)
  const [accountEditor, setAccountEditor] = useState<Account | null | 'new'>(null)
  const [toast, setToast] = useState<Toast>(null)

  const reload = useCallback(async () => {
    const [nextAccounts, nextCategories, nextTransactions] = await Promise.all([
      db.accounts.toArray(), db.categories.toArray(), db.transactions.toArray(),
    ])
    setAccounts(nextAccounts)
    setCategories(nextCategories)
    setTransactions(nextTransactions)
  }, [])

  useEffect(() => { void reload() }, [reload])

  const activeAccounts = useMemo(() => accounts.filter((account) => account.deletedAt === undefined && !account.archived).sort((left, right) => left.name.localeCompare(right.name)), [accounts])
  const accountRows = useMemo(() => activeAccounts.map((account) => ({ account, balanceCents: accountBalanceCents(account, transactions) })), [activeAccounts, transactions])

  async function undoTransaction(): Promise<void> {
    if (!toast) return
    await db.transactions.update(toast.transactionId, { deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), synced: false })
    setToast(null)
    await reload()
  }

  return (
    <div className="page finance-page">
      <div className="finance-page__heading"><div><h1 className="page__title">Finanzas.</h1><p className="page__intro">Registra lo de hoy sin perder el ritmo.</p></div><Button className="finance-page__add" onClick={() => setQuickOpen(true)}>Agregar gasto</Button></div>
      <Card className="finance-accounts">
        <div className="finance-section-header"><div><h2>Cuentas</h2><p>El saldo sale de tus movimientos.</p></div><Button variant="ghost" onClick={() => setAccountEditor('new')}>Nueva cuenta</Button></div>
        {accountRows.length === 0 ? <p className="finance-empty">Crea una cuenta para registrar tu primer movimiento.</p> : <div className="account-list">{accountRows.map(({ account, balanceCents }) => <button className="account-row" key={account.id} onClick={() => setAccountEditor(account)}><span><strong>{account.name}</strong><small>{accountKindLabel(account.kind)}</small></span><b className="money-value">{formatUsdCents(balanceCents)}</b></button>)}</div>}
      </Card>
      <p className="finance-page__hint">Toca una cuenta para editarla o archivarla.</p>
      <QuickEntrySheet open={quickOpen} accounts={activeAccounts} categories={categories} transactions={transactions} onClose={() => setQuickOpen(false)} onSaved={async (transactionId, message, keepOpen) => { setToast({ transactionId, message }); await reload(); if (!keepOpen) setQuickOpen(false) }} />
      <AccountSheet account={accountEditor} onClose={() => setAccountEditor(null)} onSaved={async () => { setAccountEditor(null); await reload() }} />
      {toast && <div className="toast" role="status"><span>{toast.message}</span><button onClick={() => void undoTransaction()}>Deshacer</button><button aria-label="Cerrar aviso" onClick={() => setToast(null)}>×</button></div>}
    </div>
  )
}

function QuickEntrySheet({ open, accounts, categories, transactions, onClose, onSaved }: { open: boolean; accounts: Account[]; categories: Category[]; transactions: Transaction[]; onClose: () => void; onSaved: (transactionId: string, message: string, keepOpen: boolean) => Promise<void> }): JSX.Element {
  const [type, setType] = useState<EntryType>('expense')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [transferAccountId, setTransferAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dateChoice, setDateChoice] = useState<DateChoice>('today')
  const [otherDate, setOtherDate] = useState(localDate())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const activeCategories = useMemo(() => type === 'transfer' ? [] : categoriesByUsage(categories, transactions, type), [categories, transactions, type])

  useEffect(() => {
    if (!open) return
    setAccountId((current) => current || accounts[0]?.id || '')
  }, [accounts, open])

  useEffect(() => { setCategoryId(activeCategories[0]?.id ?? '') }, [activeCategories])

  function pickType(nextType: EntryType): void {
    setType(nextType)
    setError('')
  }

  function resolveDate(): string {
    return dateChoice === 'today' ? localDate() : dateChoice === 'yesterday' ? priorDay() : otherDate
  }

  async function save(keepOpen: boolean): Promise<void> {
    const amountCents = parseAmountCents(amount)
    if (!amountCents || amountCents <= 0) { setError('Escribe un monto mayor que cero.'); return }
    if (!accountId) { setError('Elige una cuenta para guardar el movimiento.'); return }
    if (type !== 'transfer' && !categoryId) { setError('Elige una categoría.'); return }
    if (type === 'transfer' && (!transferAccountId || transferAccountId === accountId)) { setError('Elige una cuenta distinta para recibir la transferencia.'); return }
    const record = withSyncFields({ type, amountCents, accountId, transferAccountId: type === 'transfer' ? transferAccountId : undefined, categoryId: type === 'transfer' ? undefined : categoryId, note: note.trim() || undefined, date: resolveDate() })
    await db.transactions.add(record)
    const label = type === 'expense' ? 'Gasto guardado.' : type === 'income' ? 'Ingreso guardado.' : 'Transferencia guardada.'
    setAmount('')
    setNote('')
    setError('')
    await onSaved(record.id, label, keepOpen)
  }

  const saveLabel = type === 'expense' ? 'Guardar gasto' : type === 'income' ? 'Guardar ingreso' : 'Guardar transferencia'
  return <Sheet open={open} title="Registrar movimiento" onClose={onClose}><form className="quick-entry" onSubmit={(event) => { event.preventDefault(); void save(false) }}><AmountInput autoFocus label="Monto" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" inputMode="decimal" aria-describedby={error ? 'entry-error' : undefined} /><div className="quick-entry__group"><span className="field-label">Tipo</span><div className="chip-row">{([{ value: 'expense', label: 'Gasto' }, { value: 'income', label: 'Ingreso' }, { value: 'transfer', label: 'Transferencia' }] as const).map((option) => <Chip key={option.value} selected={type === option.value} onClick={() => pickType(option.value)}>{option.label}</Chip>)}</div></div>{type !== 'transfer' && <div className="quick-entry__group"><span className="field-label">Categoría</span><div className="chip-row">{activeCategories.map((category) => <Chip key={category.id} selected={categoryId === category.id} onClick={() => setCategoryId(category.id)}>{category.name}</Chip>)}</div></div>}<label className="field"><span>Cuenta</span><select className="input" value={accountId} onChange={(event) => setAccountId(event.target.value)}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>{type === 'transfer' && <label className="field"><span>Va a</span><select className="input" value={transferAccountId} onChange={(event) => setTransferAccountId(event.target.value)}><option value="">Elige una cuenta</option>{accounts.filter((account) => account.id !== accountId).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>}<div className="quick-entry__group"><span className="field-label">Fecha</span><div className="chip-row"><Chip selected={dateChoice === 'today'} onClick={() => setDateChoice('today')}>Hoy</Chip><Chip selected={dateChoice === 'yesterday'} onClick={() => setDateChoice('yesterday')}>Ayer</Chip><Chip selected={dateChoice === 'other'} onClick={() => setDateChoice('other')}>Otra</Chip></div></div>{dateChoice === 'other' && <Input label="Fecha del movimiento" type="date" value={otherDate} onChange={(event) => setOtherDate(event.target.value)} />}<Input label="Nota (opcional)" value={note} onChange={(event) => setNote(event.target.value)} />{error && <p id="entry-error" className="field__error" role="alert">{error}</p>}<div className="quick-entry__actions"><Button type="submit" disabled={accounts.length === 0}>{saveLabel}</Button><Button type="button" variant="secondary" disabled={accounts.length === 0} onClick={() => void save(true)}>Guardar y añadir otro</Button></div></form></Sheet>
}

function AccountSheet({ account, onClose, onSaved }: { account: Account | null | 'new'; onClose: () => void; onSaved: () => Promise<void> }): JSX.Element {
  const isNew = account === 'new'
  const [form, setForm] = useState<AccountForm>({ name: '', kind: 'cash', openingBalance: '0' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!account) return
    setForm(account === 'new' ? { name: '', kind: 'cash', openingBalance: '0' } : { name: account.name, kind: account.kind, openingBalance: String(account.openingBalanceCents / 100) })
    setError('')
  }, [account])

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const openingBalanceCents = parseSignedAmountCents(form.openingBalance)
    if (!form.name.trim()) { setError('Escribe un nombre para la cuenta.'); return }
    if (openingBalanceCents === null) { setError('Escribe un saldo inicial válido.'); return }
    const now = new Date().toISOString()
    if (isNew) await db.accounts.add(withSyncFields({ name: form.name.trim(), kind: form.kind, openingBalanceCents, archived: false }))
    else if (account) await db.accounts.update(account.id, { name: form.name.trim(), kind: form.kind, openingBalanceCents, updatedAt: now, synced: false })
    await onSaved()
  }

  async function archive(): Promise<void> {
    if (!account || account === 'new') return
    await db.accounts.update(account.id, { archived: true, updatedAt: new Date().toISOString(), synced: false })
    await onSaved()
  }

  return <Sheet open={account !== null} title={isNew ? 'Nueva cuenta' : 'Editar cuenta'} onClose={onClose}><form className="quick-entry" onSubmit={(event) => void save(event)}><Input autoFocus label="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><label className="field"><span>Tipo</span><select className="input" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as AccountKind })}>{(['cash', 'bank', 'savings', 'card'] as const).map((kind) => <option key={kind} value={kind}>{accountKindLabel(kind)}</option>)}</select></label><AmountInput label="Saldo inicial" value={form.openingBalance} onChange={(event) => setForm({ ...form, openingBalance: event.target.value })} inputMode="decimal" />{error && <p className="field__error" role="alert">{error}</p>}<div className="quick-entry__actions"><Button type="submit">{isNew ? 'Crear cuenta' : 'Guardar cambios'}</Button>{!isNew && <Button type="button" variant="ghost" className="archive-button" onClick={() => void archive()}>Archivar cuenta</Button>}</div></form></Sheet>
}
