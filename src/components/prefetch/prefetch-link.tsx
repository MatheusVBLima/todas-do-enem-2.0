"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link, { type LinkProps } from "next/link"
import { useRef, type ReactNode } from "react"

type PrefetchLinkProps = LinkProps & {
  children: ReactNode
  queryKey: unknown[]
  queryFn: () => Promise<unknown>
  prefetchDelay?: number
  className?: string
}

/**
 * Link component with hover prefetch
 * Based on Rastaflix pattern
 *
 * @example
 * <PrefetchLink
 *   href="/grupos/123"
 *   queryKey={queryKeys.groups.detail("123")}
 *   queryFn={() => getGroup("123")}
 * >
 *   Ver Grupo
 * </PrefetchLink>
 */
export function PrefetchLink({
  children,
  queryKey,
  queryFn,
  prefetchDelay = 300, // 300ms delay to avoid prefetching on quick mouseover
  className,
  ...linkProps
}: PrefetchLinkProps) {
  const queryClient = useQueryClient()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Prefetch after delay
    timeoutRef.current = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
      })
    }, prefetchDelay)
  }

  const handleMouseLeave = () => {
    // Cancel prefetch if mouse leaves before delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleFocus = () => {
    // Prefetch imediato no foco (usuário está navegando intencionalmente)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    queryClient.prefetchQuery({
      queryKey,
      queryFn,
    })
  }

  return (
    <Link
      {...linkProps}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleMouseLeave}
    >
      {children}
    </Link>
  )
}
