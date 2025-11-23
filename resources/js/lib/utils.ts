import { InertiaLinkProps } from '@inertiajs/react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isSameUrl(
  url1: NonNullable<InertiaLinkProps['href']>,
  url2: NonNullable<InertiaLinkProps['href']>,
) {
  return resolveUrl(url1) === resolveUrl(url2)
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
  return typeof url === 'string' ? url : url.url
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getPageNumbers(currentPage: number, pageCount: number) {
  const pages: (number | string)[] = []
  const showEllipsisStart = currentPage > 2
  const showEllipsisEnd = currentPage < pageCount - 3
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }
  pages.push(0)
  if (showEllipsisStart) {
    pages.push('...')
    pages.push(currentPage - 1, currentPage, currentPage + 1)
  } else {
    pages.push(1, 2, 3)
  }
  if (showEllipsisEnd) {
    pages.push('...')
  } else if (currentPage < pageCount - 3) {
    pages.push(pageCount - 3, pageCount - 2)
  }
  if (currentPage >= pageCount - 3) {
    for (let i = Math.max(4, currentPage - 1); i < pageCount - 1; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }
  }
  pages.push(pageCount - 1)
  return pages
}
