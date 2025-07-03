import { tokensById } from '@velocitylabs-org/turtle-registry'
import { chainsByUid } from '@velocitylabs-org/turtle-registry'
import { getOriginBadge } from '@velocitylabs-org/turtle-ui'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

interface TokenChainDisplayProps {
  tokenId: string
  chainUid: string
  size?: number
}

// This component displays a token and its origin based on the token ID and source chain ID
export function TokenChainDisplay({ tokenId, chainUid, size = 28 }: TokenChainDisplayProps) {
  const token = tokensById[tokenId]
  const sourceChain = chainsByUid[chainUid]
  const originBadge = getOriginBadge(token, sourceChain)
  const originBadgeURI = originBadge && getSrcFromLogo(originBadge)
  const tokenURI = getSrcFromLogo(token)

  return <TokenAndOriginLogos tokenURI={tokenURI} originURI={originBadgeURI} size={size} />
}