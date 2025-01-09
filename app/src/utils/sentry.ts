import { captureException, SeverityLevel } from '@sentry/nextjs'

type Tags = Record<string, string | number | boolean>

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
