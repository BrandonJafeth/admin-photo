'use client'

import React from 'react'

type SheetProps = React.ComponentProps<'div'> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'left' | 'right'
}

export function Sheet({ children, ...props }: SheetProps) {
  // Do not forward internal control props to the DOM to avoid React warnings.
  return <div>{children}</div>
}

export function SheetContent({ children, className }: any) {
  return <div className={className}>{children}</div>
}

export function SheetHeader({ children }: any) {
  return <div>{children}</div>
}

export function SheetTitle({ children }: any) {
  return <h2>{children}</h2>
}

export function SheetDescription({ children }: any) {
  return <p>{children}</p>
}

export default Sheet
