'use client'

import React from 'react'

type HighlightProps = {
  children: React.ReactNode
  containerClassName?: string
  className?: string
  [key: string]: any
}

export function Highlight({ children, containerClassName, className, ...props }: HighlightProps) {
  return (
    <div className={containerClassName} {...props}>{children}</div>
  )
}

type HighlightItemProps = {
  children: React.ReactNode
  activeClassName?: string
  className?: string
}

export function HighlightItem({ children, activeClassName, className }: HighlightItemProps) {
  // We avoid forwarding unknown props to the DOM to prevent React warnings.
  // Consumers can apply `activeClassName` by wrapping or cloning elements if needed.
  return (
    <div className={className} data-active-class={activeClassName || undefined}>
      {children}
    </div>
  )
}

export default Highlight
