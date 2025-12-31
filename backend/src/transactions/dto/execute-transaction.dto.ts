import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ExecuteTransactionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address' })
  to: string;

  @IsString()
  @IsNotEmpty()
  amount: string;
}
