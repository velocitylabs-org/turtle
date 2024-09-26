import { convertEthMultilocation } from '@/utils/papi'
import { captureException } from '@sentry/nextjs'
import { FixedSizeBinary } from 'polkadot-api'

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

describe('convertEthMultilocation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a valid object when given a correct Ethereum multilocation string', () => {
    const validMultilocation = JSON.stringify({
      parents: 1,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: { chainId: '1' },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: '0x123456789',
            },
          },
        ],
      },
    })

    const result = convertEthMultilocation(validMultilocation)

    const keyAsUint8Array = new FixedSizeBinary(
      new Uint8Array(Buffer.from('0x123456789'.slice(2), 'hex')),
    )

    // Jest assertions
    expect(result).toBeInstanceOf(Object)
    expect(result).toHaveProperty('parents', 1)

    const interior = result?.interior
    expect(interior?.type).toBe('X2')
    expect(interior?.value).toHaveLength(2)

    const globalConsensus = interior?.value.at(0)
    expect(globalConsensus?.type).toBe('GlobalConsensus')
    expect(globalConsensus?.value?.type).toBe('Ethereum')
    expect(globalConsensus?.value?.value).toHaveProperty('chain_id', BigInt(1))

    const accountKey = interior?.value.at(1)
    expect(accountKey?.type).toBe('AccountKey20')
    expect(accountKey?.value).toHaveProperty('network', undefined)
    expect(accountKey?.value.key.toString() === keyAsUint8Array.toString())
  })

  it('should return undefined and call captureException on invalid JSON', () => {
    const invalidJSON = 'invalid-string'

    const result = convertEthMultilocation(invalidJSON)

    // Jest assertions
    expect(result).toBeUndefined()
    expect(captureException).toHaveBeenCalledTimes(1)
  })

  it('should return undefined and call captureException on missing fields', () => {
    const incompleteMultilocation = JSON.stringify({
      parents: 1,
      interior: { X2: [{ GlobalConsensus: { Ethereum: { chainId: '1' } } }] }, // missing AccountKey20
    })

    const result = convertEthMultilocation(incompleteMultilocation)

    // Jest assertions
    expect(result).toBeUndefined()
    expect(captureException).toHaveBeenCalledTimes(1)
  })

  it('should handle an empty string', () => {
    const result = convertEthMultilocation('')

    // Jest assertions
    expect(result).toBeUndefined()
    expect(captureException).toHaveBeenCalledTimes(1)
  })
})
