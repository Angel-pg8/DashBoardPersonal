import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { EmptyState } from '../../components/ui/EmptyState'
import { AmountInput, Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { db } from '../../db/database'
import type { Account, Category, Transaction } from '../../db/types'
import { filterTransactions, groupTransactionsByDay, monthOptions, type TransactionFilters } from '../../lib/transactions'
import { financePeriodKey } from '../../lib/period'
import { formatUsdCents, parseAmountCents } from '../../lib/money'

type EntryType = Transaction['type']
type TransactionForm = {
  type: EntryType
  amount: string
  accountId: string
  transferAccountId: string
  categoryId: string
  date: string
  note: string
}

type ToastAction = 'delete' | 'restore'

function localDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatMonth(month: string): string {
  return new Intl.DateTimeFormat('es-SV', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`))
}

function formatDay(date: string): string {
  return new Intl.DateTimeFormat('es-SV', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`))
}

function typeLabel(type: EntryType): string {
  return { expense: 'Gasto', income: 'Ingreso', transfer: 'Transferencia' }[type]
}

function movementAmountLabel(transaction: Transaction): string {
  if (transaction.type === 'income') return `+${formatUsdCents(transaction.amountCents)}`
  if (transaction.type === 'expense') return formatUsdCents(-transaction.amountCents)
  return formatUsdCents(transaction.amountCents)
}

function transactionDescription(transaction: Transaction, categories: readonly Category[], accounts: readonly Account[]): string {
  if (transaction.type === 'transfer') {
    const origin = accounts.find((account) => account.id === transaction.accountId)?.name ?? 'Cuenta'
    const destination = accounts.find((account) => account.id === transaction.transferAccountId)?.name ?? 'Cuenta'
    return `${origin} → ${destination}`
  }
  return categories.find((category) => category.id === transaction.categoryId)?.name ?? typeLabel(transaction.type)
}

export function MovementsSection({ accounts, categories, transactions, startDay, onReload, onToast }: {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  startDay: number
  onReload: () => Promise<void>
  onToast: (transactionId: string, message: string, action: ToastAction) => void
}): JSX.Element {
  const [filters, setFilters] = useState<TransactionFilters>({ month: financePeriodKey(localDate(), startDay), startDay, query: '', categoryId: '', accountId: '', type: 'all' })
  const [editing, setEditing] = useState<Transaction | null>(null)
  const activeCategories = useMemo(() => categories.filter((category) => category.deletedAt === undefined), [categories])
  const activeAccounts = useMemo(() => accounts.filter((account) => account.deletedAt === undefined), [accounts])
  const months = useMemo(() => monthOptions(transactions, financePeriodKey(localDate(), startDay), startDay), [startDay, transactions])

  useEffect(() => { setFilters((current) => ({ ...current, month: financePeriodKey(localDate(), startDay), startDay })) }, [startDay])
  const groups = useMemo(() => groupTransactionsByDay(filterTransactions(transactions, filters, (transaction) => `${transaction.note ?? ''} ${transactionDescription(transaction, activeCategories, activeAccounts)}`)), [activeAccounts, activeCategories, filters, transactions])

  return <section className="finance-movements" aria-labelledby="movement-title">
    <div className="finance-section-header finance-movements__header"><div><h2 id="movement-title">Movimientos</h2><p>Busca, filtra o corrige un registro.</p></div><label className="field finance-month"><span>Mes</span><select className="input" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}>{months.map((month) => <option key={month} value={month}>{formatMonth(month)}</option>)}</select></label></div>
    <div className="movement-filters"><Input label="Buscar" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Nota, categoría o cuenta" /><label className="field"><span>Tipo</span><select className="input" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value as TransactionFilters['type'] })}><option value="all">Todos</option><option value="expense">Gastos</option><option value="income">Ingresos</option><option value="transfer">Transferencias</option></select></label><label className="field"><span>Categoría</span><select className="input" value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}><option value="">Todas</option>{activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="field"><span>Cuenta</span><select className="input" value={filters.accountId} onChange={(event) => setFilters({ ...filters, accountId: event.target.value })}><option value="">Todas</option>{activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label></div>
    {groups.length === 0 ? <EmptyState title="No hay movimientos con estos filtros." description="Cambia los filtros o agrega un movimiento." /> : <div className="movement-groups">{groups.map((group) => <section className="movement-day" key={group.date}><header><h3>{formatDay(group.date)}</h3><b className="money-value">{formatUsdCents(group.subtotalCents)}</b></header>{group.transactions.map((transaction) => <button className="movement-row" key={transaction.id} onClick={() => setEditing(transaction)}><span className={`movement-row__type movement-row__type--${transaction.type}`}>{typeLabel(transaction.type)}</span><span className="movement-row__copy"><strong>{transactionDescription(transaction, activeCategories, activeAccounts)}</strong>{transaction.note && <small>{transaction.note}</small>}</span><b className={`money-value movement-row__amount movement-row__amount--${transaction.type}`}>{movementAmountLabel(transaction)}</b></button>)}</section>)}</div>}
    <TransactionEditorSheet transaction={editing} accounts={activeAccounts} categories={activeCategories} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await onReload() }} onDeleted={async (transaction) => { setEditing(null); await db.transactions.update(transaction.id, { deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), synced: false }); onToast(transaction.id, 'Movimiento eliminado.', 'restore'); await onReload() }} />
  </section>
}

function TransactionEditorSheet({ transaction, accounts, categories, onClose, onSaved, onDeleted }: {
  transaction: Transaction | null
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onSaved: () => Promise<void>
  onDeleted: (transaction: Transaction) => Promise<void>
}): JSX.Element {
  const [form, setForm] = useState<TransactionForm | null>(null)
  const [error, setError] = useState('')
  const expenseCategories = useMemo(() => categories.filter((category) => category.kind === 'expense'), [categories])
  const incomeCategories = useMemo(() => categories.filter((category) => category.kind === 'income'), [categories])
  const categoryOptions = form?.type === 'income' ? incomeCategories : expenseCategories

  useEffect(() => {
    if (!transaction) return
    setForm({ type: transaction.type, amount: String(transaction.amountCents / 100), accountId: transaction.accountId ?? '', transferAccountId: transaction.transferAccountId ?? '', categoryId: transaction.categoryId ?? '', date: transaction.date, note: transaction.note ?? '' })
    setError('')
  }, [transaction])

  function selectType(type: EntryType): void {
    setForm((current) => current ? { ...current, type, categoryId: type === 'transfer' ? '' : (type === 'income' ? incomeCategories : expenseCategories)[0]?.id ?? '', transferAccountId: type === 'transfer' ? current.transferAccountId : '' } : current)
    setError('')
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!transaction || !form) return
    const amountCents = parseAmountCents(form.amount)
    if (!amountCents || amountCents <= 0) { setError('Escribe un monto mayor que cero.'); return }
    if (!form.accountId) { setError('Elige una cuenta.'); return }
    if (form.type !== 'transfer' && !form.categoryId) { setError('Elige una categoría.'); return }
    if (form.type === 'transfer' && (!form.transferAccountId || form.transferAccountId === form.accountId)) { setError('Elige una cuenta distinta para recibir la transferencia.'); return }
    await db.transactions.update(transaction.id, { type: form.type, amountCents, accountId: form.accountId, transferAccountId: form.type === 'transfer' ? form.transferAccountId : undefined, categoryId: form.type === 'transfer' ? undefined : form.categoryId, date: form.date, note: form.note.trim() || undefined, updatedAt: new Date().toISOString(), synced: false })
    await onSaved()
  }

  if (!form) return <Sheet open={transaction !== null} title="Editar movimiento" onClose={onClose}><p className="finance-empty">Preparando movimiento…</p></Sheet>
  return <Sheet open={transaction !== null} title="Editar movimiento" onClose={onClose}><form className="quick-entry" onSubmit={(event) => void save(event)}><AmountInput autoFocus label="Monto" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} inputMode="decimal" /><div className="quick-entry__group"><span className="field-label">Tipo</span><div className="chip-row">{(['expense', 'income', 'transfer'] as const).map((type) => <Chip key={type} selected={form.type === type} onClick={() => selectType(type)}>{typeLabel(type)}</Chip>)}</div></div>{form.type !== 'transfer' && <div className="quick-entry__group"><span className="field-label">Categoría</span><div className="chip-row">{categoryOptions.map((category) => <Chip key={category.id} selected={form.categoryId === category.id} onClick={() => setForm({ ...form, categoryId: category.id })}>{category.name}</Chip>)}</div></div>}<label className="field"><span>Cuenta</span><select className="input" value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>{form.type === 'transfer' && <label className="field"><span>Va a</span><select className="input" value={form.transferAccountId} onChange={(event) => setForm({ ...form, transferAccountId: event.target.value })}><option value="">Elige una cuenta</option>{accounts.filter((account) => account.id !== form.accountId).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>}<Input label="Fecha del movimiento" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /><Input label="Nota (opcional)" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />{error && <p className="field__error" role="alert">{error}</p>}<div className="quick-entry__actions"><Button type="submit">Guardar cambios</Button><Button type="button" variant="ghost" className="archive-button" onClick={() => transaction && void onDeleted(transaction)}>Borrar movimiento</Button></div></form></Sheet>
}
