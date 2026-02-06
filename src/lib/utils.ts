/**
 * Utility Functions
 *
 * Common helper functions used throughout the application for:
 * - CSS class name management (cn utility)
 * - Date formatting and calculations
 * - String manipulation (pluralization)
 *
 * These are pure functions with no side effects, making them
 * easy to test and reason about.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges CSS class names intelligently
 *
 * @param inputs - Any number of class name values (strings, objects, arrays)
 * @returns Merged class name string with Tailwind conflicts resolved
 *
 * Purpose:
 * - Combines multiple class name sources
 * - Resolves Tailwind CSS conflicts (e.g., "p-4 p-2" → "p-2")
 * - Handles conditional classes cleanly
 *
 * Usage Examples:
 * ```typescript
 * cn("text-red-500", "font-bold") // "text-red-500 font-bold"
 * cn("p-4", condition && "p-2") // "p-2" if condition is true
 * cn({ "bg-blue-500": isActive }) // "bg-blue-500" if isActive
 * ```
 *
 * Why twMerge?
 * Prevents Tailwind conflicts. Without it, "p-4 p-2" would apply both,
 * causing unexpected padding. With it, only "p-2" is kept (rightmost wins).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a human-readable string
 *
 * @param date - Date object or ISO date string
 * @returns Formatted string like "Jan 15, 2024"
 *
 * Format: Short month name, day number, full year
 * Locale: en-US (can be made configurable in the future)
 *
 * Usage Examples:
 * ```typescript
 * formatDate(new Date()) // "Feb 6, 2026"
 * formatDate("2024-12-25") // "Dec 25, 2024"
 * formatDate(item.expirationDate) // Works with database dates
 * ```
 *
 * Use Cases:
 * - Displaying expiration dates in storage module
 * - Showing task due dates
 * - Formatting planting/harvest dates
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short', // "Jan", "Feb", etc.
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Calculates days until a target date
 *
 * @param date - Target date (Date object or ISO string)
 * @returns Number of days until date (negative if past, positive if future)
 *
 * Calculation:
 * - Uses Math.ceil() to round up partial days
 * - Returns whole days, not hours/minutes
 * - Negative result means date has passed
 *
 * Usage Examples:
 * ```typescript
 * daysUntil("2026-03-01") // 23 (days from now)
 * daysUntil(task.nextDue) // Days until task is due
 * daysUntil(item.expirationDate) // Days until expiration
 * ```
 *
 * Use Cases:
 * - "Expiring in X days" badges
 * - Task urgency indicators
 * - Equipment service reminders
 * - Sorting by urgency
 */
export function daysUntil(date: Date | string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  // Math.ceil ensures we round up (0.1 days = 1 day)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Creates plural form of a word based on count
 *
 * @param count - Number of items
 * @param singular - Singular form of the word
 * @param plural - Optional custom plural form (defaults to singular + "s")
 * @returns Appropriate word form based on count
 *
 * Simple Pluralization:
 * - If count is 1: returns singular
 * - Otherwise: returns plural or singular + "s"
 *
 * Usage Examples:
 * ```typescript
 * pluralize(1, "item") // "item"
 * pluralize(5, "item") // "items"
 * pluralize(1, "box", "boxes") // "box"
 * pluralize(3, "box", "boxes") // "boxes"
 * pluralize(0, "task") // "tasks" (0 is plural)
 * ```
 *
 * Use Cases:
 * - Dynamic UI text: "5 items expiring" vs "1 item expiring"
 * - Notification messages
 * - Count displays
 *
 * Note: This is simple English pluralization. For complex cases
 * or other languages, consider i18n libraries.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`)
}
