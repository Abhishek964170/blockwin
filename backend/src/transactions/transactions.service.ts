import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ExecuteTransactionDto } from './dto/execute-transaction.dto';
import { isAddress } from 'viem';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly maxTransactionAmount: number;

  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
    private configService: ConfigService,
  ) {
    this.maxTransactionAmount = parseFloat(
      this.configService.get<string>('MAX_TRANSACTION_AMOUNT', '0.1'),
    );
  }

  async executeTransaction(dto: ExecuteTransactionDto) {
    const { userId, to, amount } = dto;

    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!isAddress(to)) {
      throw new BadRequestException('Invalid destination address');
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }

    if (amountNum > this.maxTransactionAmount) {
      throw new BadRequestException(
        `Amount exceeds maximum limit of ${this.maxTransactionAmount} MATIC`,
      );
    }

    this.logger.log(`Executing transaction: ${userId} -> ${to}, amount: ${amount}`);

    const hash = await this.blockchain.sendTransaction(to, amount);

    const transaction = await this.prisma.transaction.create({
      data: {
        hash,
        userId,
        to,
        amount,
        status: 'pending',
      },
    });

    this.logger.log(`Transaction created: ${hash}`);

    return { hash: transaction.hash };
  }

  async getTransactionStatus(hash: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { hash },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === 'pending') {
      const status = await this.blockchain.getTransactionStatus(hash as `0x${string}`);

      if (status !== 'pending') {
        await this.prisma.transaction.update({
          where: { hash },
          data: { status },
        });
        return { status };
      }
    }

    return { status: transaction.status };
  }
}
