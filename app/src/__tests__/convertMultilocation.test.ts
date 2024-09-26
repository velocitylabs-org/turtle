import { convertEthMultilocation } from '@/utils/papi' // Adjust the import according to your file structure
import { captureException } from '@sentry/nextjs' // Mock this appropriately

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

describe('convertEthMultilocation', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Clear mocks before each test to ensure isolation
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
              key: '0x123456789abcdef',
            },
          },
        ],
      },
    })

    const result = convertEthMultilocation(validMultilocation)

    // Jest assertions
    expect(result).toBeInstanceOf(Object)
    expect(result).toHaveProperty('parents', 1)
    // Check the array length on the "value" field of the interior object
    expect(result?.interior?.value).toHaveLength(2)
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

  it('should handle an edge case with an empty string', () => {
    const result = convertEthMultilocation('')

    // Jest assertions
    expect(result).toBeUndefined()
    expect(captureException).toHaveBeenCalledTimes(1)
  })
})
