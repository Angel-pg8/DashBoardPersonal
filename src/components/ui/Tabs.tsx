type Tab = { id: string; label: string }
type TabsProps = { tabs: Tab[]; value: string; onChange: (id: string) => void }

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return <div className="tabs" role="tablist">{tabs.map((tab) => <button type="button" key={tab.id} className={`tabs__tab ${value === tab.id ? 'tabs__tab--active' : ''}`} onClick={() => onChange(tab.id)} role="tab" aria-selected={value === tab.id}>{tab.label}</button>)}</div>
}
