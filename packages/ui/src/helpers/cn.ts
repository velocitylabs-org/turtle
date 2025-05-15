import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS classnames generator.
 * @param inputs - Classnames to merge.
 * @returns Merged classnames.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
