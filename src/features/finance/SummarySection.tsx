import { useMemo } from 'react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ListItem } from '../../components/ui/ListItem'
import type { Account, Budget, Category, Transaction } from '../../db/types'
import { financeOverview } from '../../lib/budget'
import { formatUsdCents } from '../../lib/money'

function transactionLabel(transaction: Transaction, categories: readonly Category[], accounts: readonly Account[]): string {
  if (transaction.type === 'transfer') {
    const origin = accounts.find((account) => account.id === transaction.accountId)?.name ?? 'Cuenta'
    const destination = accounts.find((account) => account.id === transaction.transferAccountId)?.name ?? 'Cuenta'
    return `${origin} → ${destination}`
  }
  return categories.find((category) => category.id === transaction.categoryId)?.name ?? (transaction.type === 'income' ? 'Ingreso' : 'Gasto')
}

function transactionAmount(transaction: Transaction): string {
  if (transaction.type === 'income') return `+${formatUsdCents(transaction.amountCents)}`
  if (transaction.type === 'expense') return formatUsdCents(-transaction.amountCents)
  return formatUsdCents(transaction.amountCents)
}

function transactionDate(date: string): string {
  return new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
}

export function SummarySection({ accounts, budgets, categories, transactions, today, startDay, onQuickEntry, onFinance }: {
  accounts: Account[]
  budgets: Budget[]
  categories: Category[]
  transactions: Transaction[]
  today: string
  startDay: number
  onQuickEntry?: () => void
  onFinance?: () => void
}): JSX.Element {
  const overview = useMemo(() => financeOverview({ accounts, budgets, categories, transactions, today, startDay }), [accounts, budgets, categories, startDay, today, transactions])

  return <section className="finance-summary" aria-labelledby="summary-title">
    <div className="summary-available"><h2 id="summary-title">Disponible.</h2><b className="money-value">{formatUsdCents(overview.availableCents)}</b><p>{formatUsdCents(overview.availablePerDayCents)} por día hasta el cierre del período.</p></div>
    <div className="summary-stats"><div><span>Saldo total</span><b className="money-value">{formatUsdCents(overview.totalBalanceCents)}</b></div><div><span>Ingresos</span><b className="money-value summary-income">+{formatUsdCents(overview.incomeCents)}</b></div><div><span>Gastos</span><b className="money-value summary-expense">{formatUsdCents(-overview.expenseCents)}</b></div></div>
    {overview.alerts.length > 0 && <section className="summary-alerts" aria-labelledby="alert-title"><h3 id="alert-title">Límites cerca</h3>{overview.alerts.map((alert) => { const category = categories.find((item) => item.id === alert.categoryId); return <p className={alert.status === 'exceeded' ? 'summary-alert summary-alert--exceeded' : 'summary-alert'} key={alert.categoryId}><strong>{category?.name ?? 'Categoría'}</strong><span>{alert.status === 'exceeded' ? `Superaste el límite por ${formatUsdCents(Math.abs(alert.remainingCents ?? 0))}.` : `Quedan ${formatUsdCents(alert.remainingCents ?? 0)}.`}</span></p> })}</section>}
    <section className="summary-latest" aria-labelledby="latest-title"><h3 id="latest-title">Últimos movimientos</h3>{overview.recentTransactions.length === 0 ? <EmptyState title="Aún no hay movimientos." description="Agrega el primero cuando lo necesites." /> : overview.recentTransactions.map((transaction) => <ListItem key={transaction.id} title={transactionLabel(transaction, categories, accounts)} detail={`${transactionDate(transaction.date)}${transaction.note ? ` · ${transaction.note}` : ''}`} end={<b className={`money-value summary-transaction summary-transaction--${transaction.type}`}>{transactionAmount(transaction)}</b>} />)}</section>
    {(onQuickEntry || onFinance) && <div className="summary-actions">{onQuickEntry && <Button onClick={onQuickEntry}>Agregar gasto</Button>}{onFinance && <Button variant="secondary" onClick={onFinance}>Ver finanzas</Button>}</div>}
  </section>
}
