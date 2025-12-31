import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, createWalletClient, http, parseEther, type Hash } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private publicClient;
  private walletClient;
  private relayerAccount;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('POLYGON_RPC_URL');
    const relayerPrivateKey = this.configService.get<string>('RELAYER_PRIVATE_KEY') as `0x${string}`;

    if (!relayerPrivateKey) {
      throw new Error('RELAYER_PRIVATE_KEY is not set');
    }

    this.relayerAccount = privateKeyToAccount(relayerPrivateKey);

    this.publicClient = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl),
    });

    this.walletClient = createWalletClient({
      account: this.relayerAccount,
      chain: polygon,
      transport: http(rpcUrl),
    });

    this.logger.log(`Blockchain service initialized with relayer: ${this.relayerAccount.address}`);
  }

  async sendTransaction(to: string, amount: string): Promise<Hash> {
    this.logger.log(`Sending ${amount} MATIC to ${to} via relayer`);

    const hash = await this.walletClient.sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });

    this.logger.log(`Transaction sent: ${hash}`);
    return hash;
  }

  async getTransactionStatus(hash: Hash): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        return 'confirmed';
      } else {
        return 'failed';
      }
    } catch (error) {
      return 'pending';
    }
  }

  getRelayerAddress(): string {
    return this.relayerAccount.address;
  }
}
