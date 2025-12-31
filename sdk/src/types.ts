export interface SDKConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface CreateUserResponse {
  walletAddress: string;
}

export interface ExecuteTransactionInput {
  userId: string;
  to: string;
  amount: string;
}

export interface ExecuteTransactionResponse {
  hash: string;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface TransactionStatusResponse {
  status: TransactionStatus;
}
