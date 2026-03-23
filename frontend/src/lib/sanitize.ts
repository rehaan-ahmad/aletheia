import DOMPurify from 'dompurify'

// For rendering any external content (evidence snippets, article text)
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return dirty // SSR safety
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'mark'],
    ALLOWED_ATTR: ['class', 'style'], // Added for highlighting styling
  })
}

// For rendering URLs as links — only allow http/https
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(url)
    }
    return url
  } catch {
    return null
  }
}

// For rendering plain text only
export function sanitizeText(dirty: string): string {
  if (typeof window === 'undefined') return dirty
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
