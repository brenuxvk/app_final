"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface ClickOutsideProps {
  children: React.ReactNode
  onClickOutside: () => void
  className?: string
}

export function ClickOutside({ children, onClickOutside, className }: ClickOutsideProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClickOutside])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
