import { z } from 'zod';

// Define a focused schema for validating required fields when creating a new transaction
export default z.object({
  txHashId: z.string().min(1, 'Transaction hash ID is required'),
  
  sourceTokenId: z.string().min(1, 'Source token ID is required'),
  sourceTokenName: z.string().min(1, 'Source token name is required'),
  sourceTokenSymbol: z.string().min(1, 'Source token symbol is required'),
  sourceTokenAmount: z.number().positive('Source token amount must be positive'),
  sourceTokenAmountUsd: z.number().nonnegative('Source token USD amount must be non-negative'),
  
  destinationTokenId: z.string().min(1, 'Destination token ID is required'),
  destinationTokenName: z.string().min(1, 'Destination token name is required'),
  destinationTokenSymbol: z.string().min(1, 'Destination token symbol is required'),
  
  feesTokenId: z.string().min(1, 'Fees token ID is required'),
  feesTokenName: z.string().min(1, 'Fees token name is required'),
  feesTokenSymbol: z.string().min(1, 'Fees token symbol is required'),
  feesTokenAmount: z.number().nonnegative('Fees token amount must be non-negative'),
  feesTokenAmountUsd: z.number().nonnegative('Fees token USD amount must be non-negative'),
  
  senderAddress: z.string().min(1, 'Sender address is required'),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  
  sourceChainUid: z.string().min(1, 'Source chain UID is required'),
  sourceChainId: z.string().min(1, 'Source chain ID is required'),
  sourceChainName: z.string().min(1, 'Source chain name is required'),
  sourceChainNetwork: z.string().min(1, 'Source chain network is required'),
  
  destinationChainUid: z.string().min(1, 'Destination chain UID is required'),
  destinationChainId: z.string().min(1, 'Destination chain ID is required'),
  destinationChainName: z.string().min(1, 'Destination chain name is required'),
  destinationChainNetwork: z.string().min(1, 'Destination chain network is required'),
  
  txDate: z.string().or(z.date()).transform((val: string | Date) => new Date(val)),
  hostedOn: z.string().min(1, 'Hosted on information is required'),
});
