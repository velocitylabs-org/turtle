import { SubstrateAccount } from '@/stores/substrateWalletStore'
import { JsonRpcSigner } from 'ethers'

export type Sender = JsonRpcSigner | SubstrateAccount
