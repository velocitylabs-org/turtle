'use client'
import { useQuery } from '@tanstack/react-query'
import { chainsByUid, tokensById } from '@velocitylabs-org/turtle-registry'
import { ArrowRight, Check, ChevronLeft, Copy, Link2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { getTxDetail } from '@/app/actions/tx-detail'
import ErrorPanel from '@/components/ErrorPanel'
import { LogoImg } from '@/components/TokenAndOriginLogos'
import { TokenChainDisplay } from '@/components/TokenChainDisplay'
import { TransactionStatusIndicator } from '@/components/TransactionStatusIndicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusColors } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import getExplorerLinks from '@/utils/explorer-links'
import { formatDate, formatDateAgo } from '@/utils/format-date'
import formatUSD from '@/utils/format-USD'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTxDetail(id),
    enabled: !!id,
  })

  useShowLoadingBar(isLoading)

  if (error && !isLoading) {
    return <ErrorPanel error={error} />
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Transaction not found</div>
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const sourceChain = chainsByUid[transaction.sourceChainUid]
  const destinationChain = chainsByUid[transaction.destinationChainUid]
  const sourceToken = transaction.sourceTokenId && tokensById[transaction.sourceTokenId]
  const destinationToken =
    transaction.destinationTokenId && tokensById[transaction.destinationTokenId]
  const feesToken = tokensById[transaction.feesTokenId]
  const bridgingFeeToken = tokensById[transaction.bridgingFeeTokenId || '']
  const explorerLinks = getExplorerLinks(transaction)

  function handleBackNavigation() {
    // Check if there's a stored scroll position from the referrer
    const storedScrollY = sessionStorage.getItem('previousPageScrollY')
    router.back()

    // Restore scroll position after navigation
    if (storedScrollY) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(storedScrollY))
        sessionStorage.removeItem('previousPageScrollY')
      }, 100)
    }
  }

  return (
    <div>
      <Card>
        <CardContent className="relative mt-[25px]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-[-7px] h-8 w-8"
            onClick={handleBackNavigation}
          >
            <ChevronLeft className="!h-[24px] !w-[24px]" />
          </Button>
          <div className="m-auto flex w-fit items-center justify-center space-x-2 rounded-2xl border px-2 py-1">
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <LogoImg
                logoURI={getSrcFromLogo(sourceChain)}
                size={25}
                className="border border-black"
              />
              <div className="text-xs sm:text-sm">{sourceChain.name}</div>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="turtle-success-dark flex items-center justify-center space-x-1">
              <LogoImg
                logoURI={getSrcFromLogo(destinationChain)}
                size={25}
                className="border border-black"
              />
              <div className="text-xs sm:text-sm">{destinationChain.name}</div>
            </div>
          </div>
          <div className="mb-2 mt-3">
            <h3 className="xxl-letter-spacing flex items-center justify-center space-x-3 text-lg leading-none sm:text-4xl">
              <div className="relative top-[7px] inline-flex flex-col">
                <span>{transaction.sourceTokenAmount}</span>
                <span className="text-center text-sm text-muted-foreground">
                  ${formatUSD(transaction.sourceTokenAmountUsd)}
                </span>
              </div>
              <div className="relative top-[7px] inline-flex flex-col">
                <TokenChainDisplay
                  tokenId={transaction.sourceTokenId}
                  chainUid={transaction.sourceChainUid}
                  size={35}
                />
                {sourceToken && (
                  <span className="text-center text-sm text-muted-foreground">
                    {sourceToken.symbol}
                  </span>
                )}
              </div>
              {transaction.isSwap && transaction.destinationTokenAmount && (
                <>
                  <ArrowRight className="h-5 w-5" />
                  <div className="relative top-[7px] inline-flex flex-col">
                    <span>{transaction.destinationTokenAmount}</span>
                    <span className="text-center text-sm text-muted-foreground">
                      ${formatUSD(transaction.destinationTokenAmountUsd)}
                    </span>
                  </div>
                  <div className="relative top-[7px] inline-flex flex-col">
                    <TokenChainDisplay
                      tokenId={transaction.destinationTokenId}
                      chainUid={transaction.destinationChainUid}
                      size={35}
                    />
                    {destinationToken && (
                      <span className="text-center text-sm text-muted-foreground">
                        {destinationToken.symbol}
                      </span>
                    )}
                  </div>
                </>
              )}
            </h3>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-8">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Transaction info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Swap</span>
                <span className="text-sm">{transaction.isSwap ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex flex-row items-center">
                  <Badge
                    className="mr-2 text-white"
                    style={{ background: statusColors[transaction.status].hex }}
                  >
                    {transaction.status}
                  </Badge>
                  <TransactionStatusIndicator status={transaction.status} logoOnly />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Origin</span>
                <div className="flex items-center gap-1">
                  <ExternalLinkButton
                    name={transaction.hostedOn.replace('https://', '')}
                    url={transaction.hostedOn}
                  />
                </div>
              </div>
              <div className="items-top flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <div className="flex flex-col items-end">
                  <div className="text-sm">{formatDate(transaction.txDate)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateAgo(transaction.txDate)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sender</span>
                </div>
                <AddressDisplay address={transaction.senderAddress} onCopy={copyToClipboard} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recipient</span>
                </div>
                <AddressDisplay address={transaction.recipientAddress} onCopy={copyToClipboard} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-8">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-sm text-muted-foreground">Execution</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogoImg
                    logoURI={getSrcFromLogo(feesToken)}
                    size={24}
                    className="border border-black"
                  />
                  <span className="text-sm">{feesToken.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {transaction.feesTokenAmount} {feesToken.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${formatUSD(transaction.feesTokenAmountUsd)} USD
                  </div>
                </div>
              </div>
              {bridgingFeeToken && (
                <>
                  <div className="text-sm text-muted-foreground">Bridging</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LogoImg
                        logoURI={getSrcFromLogo(bridgingFeeToken)}
                        size={24}
                        className="border border-black"
                      />
                      <span className="text-sm">{bridgingFeeToken.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {transaction.bridgingFeeTokenAmount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${transaction.bridgingFeeTokenAmountUsd?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Transaction hash</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressDisplay address={transaction.txHashId} onCopy={copyToClipboard} />
            {explorerLinks && (
              <div className="ml-[3px] mt-[15px] flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {explorerLinks.length > 1 ? 'Explorers' : 'Explorer'}
                </span>
                <div className="flex flex-col">
                  {explorerLinks.map(explorer => (
                    <div key={explorer.name} className="flex justify-end align-bottom">
                      <ExternalLinkButton name={explorer.name} url={explorer.url} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ExternalLinkButton({ name, url }: { name: string; url: string }) {
  return (
    <Button variant="link" onClick={() => window.open(url, '_blank')} className="p-0" size="sm">
      <span className="ml-1 text-sm">{name}</span>
      <Link2 className="h-2 w-2" />
    </Button>
  )
}

function AddressDisplay({
  address,
  onCopy,
}: {
  address: string
  onCopy: (address: string) => void
}) {
  const [isCopied, setIsCopied] = useState(false)

  const truncateAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`
  }

  const handleCopy = () => {
    onCopy(address)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <div className="flex items-center justify-between rounded-md bg-slate-50 p-2">
      <span className="truncate font-mono text-sm text-muted-foreground">
        {truncateAddress(address)}
      </span>
      <div className="flex gap-2">
        <Button
          variant={isCopied ? null : 'ghost'}
          size="icon"
          className="relative h-7 w-7 overflow-hidden"
          onClick={handleCopy}
        >
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isCopied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
          >
            <Check className="h-3 w-3 text-green-500" />
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
          >
            <Copy className="h-3 w-3" />
          </div>
        </Button>
      </div>
    </div>
  )
}
