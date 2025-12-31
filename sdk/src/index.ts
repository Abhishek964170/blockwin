import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  SDKConfig,
  CreateUserResponse,
  ExecuteTransactionInput,
  ExecuteTransactionResponse,
  TransactionStatusResponse,
} from './types';

export class ChainSDK {
  private client: AxiosInstance;

  constructor(config: SDKConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: config.apiKey
        ? { Authorization: `Bearer ${config.apiKey}` }
        : {},
    });
  }

  async createUser(userId: string): Promise<CreateUserResponse> {
    try {
      const response = await this.client.post<CreateUserResponse>('/users', {
        userId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async executeTransaction(
    input: ExecuteTransactionInput,
  ): Promise<ExecuteTransactionResponse> {
    try {
      const response = await this.client.post<ExecuteTransactionResponse>(
        '/execute',
        input,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransactionStatus(
    hash: string,
  ): Promise<TransactionStatusResponse> {
    try {
      const response = await this.client.get<TransactionStatusResponse>(
        `/tx/${hash}`,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const message =
        axiosError.response?.data ||
        axiosError.message ||
        'Unknown error occurred';
      return new Error(
        typeof message === 'string' ? message : JSON.stringify(message),
      );
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}

export * from './types';
