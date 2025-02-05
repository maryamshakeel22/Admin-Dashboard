export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-04'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = assertValue(
  'skumWHmzvo7pftI7m5zs6r4sgKflgJ1fQ2kz96ohlTHDDVnlQFOsgV8eJKaKBzkkOZ1jyFd9dtLsPJ3TeevMiiGLdFdeI48O8MmxFBqwuGgYQ7pliJcC5pcIktjPQlgsVohIiS3WDRpZ8fPXKHoSGXpxHh8TMaxGBVZSkZz2dmsLJXPqIHCE',
  'Missing environment variable: Token'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
