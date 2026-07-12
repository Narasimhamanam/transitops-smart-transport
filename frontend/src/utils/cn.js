import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility: merge Tailwind class names safely.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 * @param  {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
