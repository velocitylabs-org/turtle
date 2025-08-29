import type { AddressType, Network } from '@velocitylabs-org/turtle-registry'
interface AccountProps {
  network: Network
  addressType?: AddressType
  address: string
  className?: string
  allowCopy?: boolean
  size?: number
}
export default function Account({
  network,
  addressType,
  address,
  className,
  allowCopy,
  size,
}: AccountProps): import('react/jsx-runtime').JSX.Element
