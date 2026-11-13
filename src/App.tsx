import { useEffect, useState } from 'react'
import { BottomNav, type AppRoute, SideNav } from './components/ui/Navigation'
import { Card } from './components/ui/Card'
import { Chip } from './components/ui/Chip'
import { db } from './db/database'
import type { Account, Budget, Category, Transaction } from './db/types'
import { SummarySection } from './features/finance/SummarySection'
import { resolveTone, type TonePreference } from './lib/tone'
import { FinancePage } from './features/finance/FinancePage'

const preferenceKey = 'dashboard-tone-preference'
const financePeriodStartDayKey = 'dashboard-finance-period-start-day'
const toneOptions: { value: TonePreference; label: string }[] = [
  { value: 'auto', label: 'Automático' }, { value: 'morning', label: 'Mañana' }, { value: 'day', label: 'Tarde' }, { value: 'dusk', label: 'Atardecer' }, { value: 'night', label: 'Noche' },
]

function readPreference(): TonePreference {
  const stored = localStorage.getItem(preferenceKey)
  return toneOptions.some((option) => option.value === stored) ? stored as TonePreference : 'auto'
}

function readFinancePeriodStartDay(): number {
  const value = Number(localStorage.getItem(financePeriodStartDayKey))
  return Number.isInteger(value) && value >= 1 && value <= 31 ? value : 1
}

function localDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function HomePage({ onFinance, onQuickEntry, periodStartDay }: { onFinance: () => void; onQuickEntry: () => void; periodStartDay: number }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => { void Promise.all([db.accounts.toArray(), db.budgets.toArray(), db.categories.toArray(), db.transactions.toArray()]).then(([nextAccounts, nextBudgets, nextCategories, nextTransactions]) => { setAccounts(nextAccounts); setBudgets(nextBudgets); setCategories(nextCategories); setTransactions(nextTransactions) }) }, [])

  return <div className="page page--home"><h1 className="page__title">Tu día, claro.</h1><SummarySection accounts={accounts} budgets={budgets} categories={categories} transactions={transactions} today={localDate()} startDay={periodStartDay} onQuickEntry={onQuickEntry} onFinance={onFinance} /></div>
}

function MorePage({ preference, setPreference }: { preference: TonePreference; setPreference: (preference: TonePreference) => void }) {
  return <div className="page"><h1 className="page__title">Más.</h1><p className="page__intro">Ajustes para que el espacio se sienta tuyo.</p><Card style={{ padding: '1.25rem' }}><h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-.03em' }}>Color por hora</h2><p className="page__intro" style={{ margin: '.5rem 0 0' }}>El acento cambia con la hora local sin alterar el fondo.</p><div className="tone-options">{toneOptions.map((option) => <Chip key={option.value} selected={preference === option.value} onClick={() => setPreference(option.value)}>{option.label}</Chip>)}</div></Card></div>
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>('home')
  const [preference, setPreference] = useState<TonePreference>(readPreference)
  const [quickOpen, setQuickOpen] = useState(false)
  /** A dónde aterriza al cerrar el registro rápido: el origen, salvo que se haya usado "Guardar y añadir otro". */
  const [quickReturn, setQuickReturn] = useState<'home' | 'finance'>('home')
  const [periodStartDay, setPeriodStartDay] = useState(readFinancePeriodStartDay)

  useEffect(() => {
    const applyTone = () => { document.documentElement.dataset.tone = resolveTone(preference) }
    const onVisible = () => { if (document.visibilityState === 'visible') applyTone() }
    applyTone()
    document.addEventListener('visibilitychange', onVisible)
    const interval = window.setInterval(applyTone, 60_000)
    return () => { document.removeEventListener('visibilitychange', onVisible); window.clearInterval(interval) }
  }, [preference])

  const updatePreference = (next: TonePreference) => { localStorage.setItem(preferenceKey, next); setPreference(next) }
  const updatePeriodStartDay = (day: number) => { localStorage.setItem(financePeriodStartDayKey, String(day)); setPeriodStartDay(day) }
  const openQuickEntry = () => { setQuickReturn(route === 'finance' ? 'finance' : 'home'); setRoute('finance'); setQuickOpen(true) }
  const changeQuickOpen = (open: boolean) => { setQuickOpen(open); if (!open) setRoute(quickReturn) }
  const onQuickSaved = (keepOpen: boolean) => { if (keepOpen) setQuickReturn('finance') }
  const page = route === 'home' ? <HomePage onFinance={() => setRoute('finance')} onQuickEntry={openQuickEntry} periodStartDay={periodStartDay} /> : route === 'finance' ? <FinancePage quickOpen={quickOpen} onQuickOpenChange={changeQuickOpen} onQuickSaved={onQuickSaved} periodStartDay={periodStartDay} onPeriodStartDayChange={updatePeriodStartDay} /> : <MorePage preference={preference} setPreference={updatePreference} />

  const logoSrc = `${import.meta.env.BASE_URL}logo-white.svg`

  return <div className="app-shell"><aside className="side-rail"><div className="brand"><img src={logoSrc} alt="" aria-hidden="true" className="brand__logo" width={30} height={30} />Ángel</div><SideNav route={route} onNavigate={setRoute} /></aside><main className="main"><div className="mobile-brand brand"><img src={logoSrc} alt="" aria-hidden="true" className="brand__logo" width={30} height={30} />Ángel</div>{page}</main>{(route === 'home' || route === 'finance') && <button type="button" className="fab" aria-label="Agregar gasto" onClick={openQuickEntry}><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M11 3.5v15M3.5 11h15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg></button>}<BottomNav route={route} onNavigate={setRoute} /></div>
}

