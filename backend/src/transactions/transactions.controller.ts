import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TransactionsService } from './transactions.service';
import { ExecuteTransactionDto } from './dto/execute-transaction.dto';

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('execute')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async executeTransaction(@Body() dto: ExecuteTransactionDto) {
    return this.transactionsService.executeTransaction(dto);
  }

  @Get('tx/:hash')
  async getTransactionStatus(@Param('hash') hash: string) {
    return this.transactionsService.getTransactionStatus(hash);
  }
}
