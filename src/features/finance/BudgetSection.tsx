import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { AmountInput } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { db, withSyncFields } from '../../db/database'
import type { Budget, Category, Transaction } from '../../db/types'
import { budgetStatus, categoryBudgetSummaries, copyPreviousPeriodBudgetValues, totalBudgetLimitCents, totalByTypeCents, transactionsForPeriod } from '../../lib/budget'
import { financePeriod, financePeriodKey } from '../../lib/period'
import { formatUsdCents, parseAmountCents } from '../../lib/money'

type BudgetTarget = { categoryId?: string; label: string; budget?: Budget } | null

function formatPeriod(periodKey: string, startDay: number): string {
  const { start, endExclusive } = financePeriod(periodKey, startDay)
  const end = new Date(`${endExclusive}T12:00:00`)
  end.setDate(end.getDate() - 1)
  const formatter = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short' })
  return `${formatter.format(new Date(`${start}T12:00:00`))} – ${formatter.format(end)}`
}

function activeBudget(budgets: readonly Budget[], periodKey: string, categoryId?: string): Budget | undefined {
  return budgets.find((budget) => budget.deletedAt === undefined && budget.month === periodKey && budget.categoryId === categoryId)
}

export function BudgetSection({ budgets, categories, transactions, today, startDay, onStartDayChange, onReload, onNotice }: {
  budgets: Budget[]
  categories: Category[]
  transactions: Transaction[]
  today: string
  startDay: number
  onStartDayChange: (day: number) => void
  onReload: () => Promise<void>
  onNotice: (message: string) => void
}): JSX.Element {
  const [target, setTarget] = useState<BudgetTarget>(null)
  const periodKey = financePeriodKey(today, startDay)
  const periodTransactions = useMemo(() => transactionsForPeriod(transactions, periodKey, startDay), [periodKey, startDay, transactions])
  const summaries = useMemo(() => categoryBudgetSummaries(categories, budgets, periodTransactions, periodKey), [budgets, categories, periodKey, periodTransactions])
  const totalBudget = totalBudgetLimitCents(budgets, periodKey)
  const totalStatus = budgetStatus(totalBudget, totalByTypeCents(periodTransactions, 'expense'))

  async function copyPrevious(): Promise<void> {
    const copies = copyPreviousPeriodBudgetValues(budgets, periodKey)
    if (copies.length === 0) { onNotice('No hay presupuesto en el período anterior.'); return }
    const now = new Date().toISOString()
    await db.transaction('rw', db.budgets, async () => {
      const currentBudgets = await db.budgets.toArray()
      for (const copy of copies) {
        const existing = activeBudget(currentBudgets, periodKey, copy.categoryId)
        if (existing) await db.budgets.update(existing.id, { limitCents: copy.limitCents, updatedAt: now, synced: false })
        else await db.budgets.add(withSyncFields(copy, now))
      }
    })
    await onReload()
    onNotice('Presupuesto del período anterior copiado.')
  }

  return <section className="budget-section" aria-labelledby="budget-title">
    <div className="finance-section-header budget-section__header"><div><h2 id="budget-title">Presupuesto</h2><p>Período actual: {formatPeriod(periodKey, startDay)}.</p></div><Button variant="secondary" onClick={() => void copyPrevious()}>Copiar mes anterior</Button></div>
    <label className="field budget-start-day"><span>El período inicia el día</span><select className="input" value={startDay} onChange={(event) => onStartDayChange(Number(event.target.value))}>{Array.from({ length: 31 }, (_, index) => index + 1).map((day) => <option key={day} value={day}>{day}</option>)}</select></label>
    <Card className="budget-total"><div><p>Presupuesto total</p><b className="money-value">{formatUsdCents(totalBudget)}</b></div><Button variant="ghost" onClick={() => setTarget({ label: 'Presupuesto total', budget: activeBudget(budgets, periodKey) })}>Editar</Button></Card>
    <div className="budget-limits"><div className="finance-section-header"><div><h3>Límites por categoría</h3><p>Ámbar desde el 80 %. Rojo al pasarte.</p></div></div>{summaries.map((summary) => { const category = categories.find((item) => item.id === summary.categoryId); if (!category) return null; return <div className="budget-row" key={summary.categoryId}><div className="budget-row__header"><div><strong>{category.name}</strong><small>{summary.limitCents === null ? 'Sin límite' : `${formatUsdCents(summary.spentCents)} de ${formatUsdCents(summary.limitCents)}`}</small></div><Button variant="ghost" onClick={() => setTarget({ categoryId: category.id, label: category.name, budget: activeBudget(budgets, periodKey, category.id) })}>{summary.limitCents === null ? 'Definir' : 'Editar'}</Button></div>{summary.limitCents !== null && <><div className="budget-progress" aria-label={`${category.name}: ${summary.status}`}><span className={`budget-progress__fill budget-progress__fill--${summary.status}`} style={{ transform: `scaleX(${summary.progress})` }} /></div><p className={`budget-row__status budget-row__status--${summary.status}`}>{summary.status === 'exceeded' ? `Superaste el límite por ${formatUsdCents(Math.abs(summary.remainingCents ?? 0))}.` : summary.status === 'warning' ? `Quedan ${formatUsdCents(summary.remainingCents ?? 0)}. Cerca del límite.` : `Quedan ${formatUsdCents(summary.remainingCents ?? 0)}.`}</p></>}</div>})}</div>
    <BudgetEditorSheet target={target} periodKey={periodKey} onClose={() => setTarget(null)} onSaved={async () => { setTarget(null); await onReload() }} />
    {totalStatus.status === 'exceeded' && <p className="budget-total__notice">El gasto del período supera el presupuesto total.</p>}
  </section>
}

function BudgetEditorSheet({ target, periodKey, onClose, onSaved }: { target: BudgetTarget; periodKey: string; onClose: () => void; onSaved: () => Promise<void> }): JSX.Element {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!target) return
    setAmount(String((target.budget?.limitCents ?? 0) / 100))
    setError('')
  }, [target])

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!target) return
    const limitCents = parseAmountCents(amount)
    if (limitCents === null) { setError('Escribe un límite válido.'); return }
    const now = new Date().toISOString()
    if (target.budget) await db.budgets.update(target.budget.id, { limitCents, updatedAt: now, synced: false })
    else await db.budgets.add(withSyncFields({ month: periodKey, categoryId: target.categoryId, limitCents }, now))
    await onSaved()
  }

  return <Sheet open={target !== null} title={target ? target.label : 'Presupuesto'} onClose={onClose}><form className="quick-entry" onSubmit={(event) => void save(event)}><AmountInput autoFocus label="Límite" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />{error && <p className="field__error" role="alert">{error}</p>}<Button type="submit">Guardar límite</Button></form></Sheet>
}
