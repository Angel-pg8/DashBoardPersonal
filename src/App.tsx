import { useEffect, useState } from 'react'
import { BottomNav, type AppRoute, SideNav } from './components/ui/Navigation'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Chip } from './components/ui/Chip'
import { EmptyState } from './components/ui/EmptyState'
import { resolveTone, type TonePreference } from './lib/tone'

const preferenceKey = 'dashboard-tone-preference'
const toneOptions: { value: TonePreference; label: string }[] = [
  { value: 'auto', label: 'Automático' }, { value: 'morning', label: 'Mañana' }, { value: 'day', label: 'Tarde' }, { value: 'dusk', label: 'Atardecer' }, { value: 'night', label: 'Noche' },
]

function readPreference(): TonePreference {
  const stored = localStorage.getItem(preferenceKey)
  return toneOptions.some((option) => option.value === stored) ? stored as TonePreference : 'auto'
}

function HomePage({ onFinance }: { onFinance: () => void }) {
  return <div className="page"><h1 className="page__title">Tu día, claro.</h1><Card className="home-hero"><p className="eyeless-label">Aún no hay movimientos</p><p className="home-hero__title">Empieza cuando quieras.</p><div className="home-actions"><Button onClick={onFinance}>Ver finanzas</Button><Button variant="secondary" disabled title="Disponible en la fase 2">Agregar gasto</Button></div></Card></div>
}

function FinancePage() {
  return <div className="page"><h1 className="page__title">Finanzas.</h1><p className="page__intro">Tus movimientos y presupuestos aparecerán aquí en la siguiente fase.</p><EmptyState title="Aún no hay gastos este mes." description="Agrega el primero cuando el registro de movimientos esté disponible." /></div>
}

function MorePage({ preference, setPreference }: { preference: TonePreference; setPreference: (preference: TonePreference) => void }) {
  return <div className="page"><h1 className="page__title">Más.</h1><p className="page__intro">Ajustes para que el espacio se sienta tuyo.</p><Card style={{ padding: '1.25rem' }}><h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-.03em' }}>Color por hora</h2><p className="page__intro" style={{ margin: '.5rem 0 0' }}>El acento cambia con la hora local sin alterar el fondo.</p><div className="tone-options">{toneOptions.map((option) => <Chip key={option.value} selected={preference === option.value} onClick={() => setPreference(option.value)}>{option.label}</Chip>)}</div></Card></div>
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>('home')
  const [preference, setPreference] = useState<TonePreference>(readPreference)

  useEffect(() => {
    const applyTone = () => { document.documentElement.dataset.tone = resolveTone(preference) }
    const onVisible = () => { if (document.visibilityState === 'visible') applyTone() }
    applyTone()
    document.addEventListener('visibilitychange', onVisible)
    const interval = window.setInterval(applyTone, 60_000)
    return () => { document.removeEventListener('visibilitychange', onVisible); window.clearInterval(interval) }
  }, [preference])

  const updatePreference = (next: TonePreference) => { localStorage.setItem(preferenceKey, next); setPreference(next) }
  const page = route === 'home' ? <HomePage onFinance={() => setRoute('finance')} /> : route === 'finance' ? <FinancePage /> : <MorePage preference={preference} setPreference={updatePreference} />

  return <div className="app-shell"><aside className="side-rail"><div className="brand"><span className="brand__hex" aria-hidden="true" />Ángel</div><SideNav route={route} onNavigate={setRoute} /></aside><main className="main"><div className="mobile-brand brand"><span className="brand__hex" aria-hidden="true" />Ángel</div>{page}</main><BottomNav route={route} onNavigate={setRoute} /></div>
}

