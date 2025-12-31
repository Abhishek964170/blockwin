import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { userId } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    const walletAddress = account.address;

    const user = await this.prisma.user.create({
      data: {
        userId,
        walletAddress,
      },
    });

    this.logger.log(`User created: ${userId} with wallet: ${walletAddress}`);

    return { walletAddress: user.walletAddress };
  }
}
