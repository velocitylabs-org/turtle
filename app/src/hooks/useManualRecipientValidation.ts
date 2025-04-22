import { Chain } from '@/models/chain'
import { ManualRecipientInput } from '@/models/select'
import { isValidAddressType } from '@/utils/address'
import { useCallback, useEffect, useState } from 'react'

const useManualRecipientValidation = (
  manualRecipient: ManualRecipientInput,
  destinationChain?: Chain,
) => {
  const [error, setError] = useState<string>('')

  const validate = useCallback(() => {
    const isNotEnabled = !manualRecipient.enabled
    const destChainNotSelected = !destinationChain
    const isEmptyAddress = manualRecipient.address === ''

    const isValidAddress =
      isNotEnabled ||
      destChainNotSelected ||
      isEmptyAddress ||
      isValidAddressType(manualRecipient.address, destinationChain.supportedAddressTypes)

    if (isValidAddress) setError('')
    else setError('Invalid Address')
  }, [destinationChain, manualRecipient.address, manualRecipient.enabled])

  useEffect(() => {
    validate()
  }, [manualRecipient.address, destinationChain, manualRecipient.enabled, validate])

  return { error }
}

export default useManualRecipientValidation
