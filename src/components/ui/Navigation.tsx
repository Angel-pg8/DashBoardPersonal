import { LayoutDashboard, Wallet, Ellipsis, type LucideIcon } from 'lucide-react'

export type AppRoute = 'home' | 'finance' | 'more'

export interface NavItem {
  id: AppRoute
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Inicio', icon: LayoutDashboard },
  { id: 'finance', label: 'Finanzas', icon: Wallet },
  { id: 'more', label: 'Más', icon: Ellipsis },
] as const

interface NavigationProps {
  route: AppRoute
  onNavigate: (route: AppRoute) => void
  className: string
}

function Navigation({ route, onNavigate, className }: NavigationProps) {
  return (
    <nav className={className} aria-label="Principal">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = route === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? 'nav-item nav-item--active' : 'nav-item'}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon size={24} strokeWidth={2} aria-hidden="true" className="nav-item__icon" />
            <span className="nav-item__label">{item.label}</span>
            <span className="nav-item__indicator" aria-hidden="true" />
          </button>
        )
      })}
    </nav>
  )
}

export function BottomNav(props: Omit<NavigationProps, 'className'>) {
  return <Navigation {...props} className="bottom-nav" />
}

export function SideNav(props: Omit<NavigationProps, 'className'>) {
  return <Navigation {...props} className="side-nav" />
}
