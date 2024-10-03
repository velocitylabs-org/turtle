export function getErrorMessage(err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) {
        message = err.message
    }
    console.error(message, err)
    return message
}