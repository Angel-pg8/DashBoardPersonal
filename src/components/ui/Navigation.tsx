export type AppRoute = 'home' | 'finance' | 'more'

const items: { id: AppRoute; label: string }[] = [
  { id: 'home', label: 'Inicio' }, { id: 'finance', label: 'Finanzas' }, { id: 'more', label: 'Más' },
]

function Navigation({ route, onNavigate, className }: { route: AppRoute; onNavigate: (route: AppRoute) => void; className: string }) {
  return <nav className={className} aria-label="Principal">{items.map((item) => <button key={item.id} className={route === item.id ? 'nav-item nav-item--active' : 'nav-item'} onClick={() => onNavigate(item.id)} aria-current={route === item.id ? 'page' : undefined}><span className="nav-item__mark" aria-hidden="true" />{item.label}</button>)}</nav>
}

export function BottomNav(props: Omit<Parameters<typeof Navigation>[0], 'className'>) { return <Navigation {...props} className="bottom-nav" /> }
export function SideNav(props: Omit<Parameters<typeof Navigation>[0], 'className'>) { return <Navigation {...props} className="side-nav" /> }
