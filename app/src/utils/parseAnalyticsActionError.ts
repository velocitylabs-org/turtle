export async function parseAnalyticsServerActionError(response: Response): Promise<string> {
  let errorMessage = `Analytics API error: ${response.status}`
  const responseText = await response.text()
  if (responseText) {
    try {
      const errorData = JSON.parse(responseText)
      return errorData.error || `${errorMessage} - ${responseText}`
    } catch {
      errorMessage += ` - ${responseText}`
    }
  }
  return errorMessage
}