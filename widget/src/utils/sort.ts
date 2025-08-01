/**
 * Reorders the options to place the selected item at the top. Can be used for chains or tokens.
 *
 * @param options - Array of items to sort.
 * @param key - Key or path to the unique identifier in the objects (e.g., 'uid' or 'token.id').
 * @param selectedId - 'uid' or 'id' of the selected item.
 * @returns A new array with the selected item at the top, others in their original order.
 */
export const reorderOptionsBySelectedItem = <T>(options: T[], key: string, selectedId?: string): T[] => {
  if (!selectedId) return options

  const getValue = <T>(obj: T, keyPath: string): string | undefined => {
    return keyPath.split('.').reduce((value: unknown, key: string) => {
      if (value && typeof value === 'object') return (value as Record<string, unknown>)[key]

      return undefined
    }, obj) as string | undefined
  }

  const reorderedOptions: T[] = []
  options.forEach(option => {
    const uniqueId = getValue<T>(option, key)
    if (uniqueId === selectedId) reorderedOptions.unshift(option)
    else reorderedOptions.push(option)
  })

  return reorderedOptions
}
