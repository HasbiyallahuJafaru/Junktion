import DOMPurify from 'isomorphic-dompurify'

/** Strip all HTML from user-supplied strings before DB storage */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim()
}
