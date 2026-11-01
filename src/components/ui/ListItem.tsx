import type { ReactNode } from 'react'

type ListItemProps = { title: string; detail?: string; end?: ReactNode }

export function ListItem({ title, detail, end }: ListItemProps) {
  return <div className="list-item"><div><p className="list-item__title">{title}</p>{detail && <p className="list-item__detail">{detail}</p>}</div>{end && <div>{end}</div>}</div>
}
