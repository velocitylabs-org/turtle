import { captureException, SeverityLevel } from '@sentry/nextjs'

type Tags = Record<string, string | number | boolean>

/**
 * Custom wrapper for Sentry's `captureException` to submit errors with additional context.
 *
 * @param error - The error to be captured.
 * @param level - Optional severity level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'
 * @param relevantTags - Optional array of key-value tag objects for understanding the error.
 * @param extraData - Optional additional context data to include with the error. Ex: an ongoing transfer.
 */
export function customCaptureException<T = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  level?: SeverityLevel,
  relevantTags?: Tags[],
  extraData?: Record<string, T>,
) {
  const formattedTags = relevantTags?.reduce((acc, tags) => ({ ...acc, ...tags }), {})
  captureException(error, {
    ...(level && { level }),
    ...(relevantTags && { tags: { ...formattedTags } }),
    ...(extraData && { extra: { ...extraData } }),
  })
}
