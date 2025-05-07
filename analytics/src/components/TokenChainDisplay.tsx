'use client'
import RenderTokenChainImg from '@/components/RenderTokenChainImg'
import getOriginBadge from "@/utils/get-origin-badge";
import { tokensById } from "@/registry/tokens";
import { chainsByUid } from "@/registry/chains";

interface TokenChainDisplayProps {
  tokenId: string
  chainUid?: string
  size?: number
}

export default function TokenChainDisplay({ tokenId, chainUid, size = 28 }: TokenChainDisplayProps) {
  const token = tokensById[tokenId]
  const sourceChain = chainUid && chainsByUid[chainUid]
  const originBadge = getOriginBadge(token, sourceChain || null)

  return (
    <div className="flex items-center">
      <div className="relative">
        <RenderTokenChainImg logoURI={token.logoURI} size={size} className="border border-black" />
        {originBadge && (
          <div className="absolute -bottom-1 -right-1">
          <RenderTokenChainImg logoURI={originBadge.logoURI} size={size * 0.65} className="border border-white" />
          </div>
        )}
      </div>
    </div>
  )
}
