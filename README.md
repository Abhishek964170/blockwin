# Chain Abstraction MVP

> Gasless blockchain transactions for the next billion users

![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.3-red)
![Viem](https://img.shields.io/badge/Viem-2.9-purple)
![Polygon](https://img.shields.io/badge/Polygon-Mumbai-8247E5)
![License](https://img.shields.io/badge/License-MIT-green)

A production-ready chain abstraction platform that eliminates blockchain complexity for end users. Users send transactions without wallets, gas tokens, or private keys—all while maintaining security and decentralization.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [SDK Usage](#sdk-usage)
- [Configuration](#configuration)
- [Development](#development)
- [Security](#security)
- [Deployment](#deployment)
- [Use Cases](#use-cases)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

**Crypto UX is broken.**

- Users must install wallets, backup seed phrases, and manage private keys
- Every transaction requires gas tokens (MATIC, ETH, etc.)
- Complex signing flows confuse non-technical users
- **Result:** 99% of users bounce before their first transaction

**Chain abstraction solves this** by hiding blockchain complexity behind a simple API.

---

## Solution

This platform provides a **backend-controlled relayer** that:

- Pays gas fees for all user transactions
- Signs transactions on behalf of users
- Provides a simple REST API (no Web3 knowledge needed)
- Includes a TypeScript SDK for easy integration
- Implements production-grade security (rate limiting, validation, logging)

**Users just see:**
```typescript
await sdk.executeTransaction({
  userId: 'alice',
  to: '0xBob...',
  amount: '0.01'
})
```

**We handle:** Wallets, gas, signing, blockchain complexity.

---

## Architecture

```
┌─────────────┐
│   Frontend  │
│  (Your App) │
└──────┬──────┘
       │ Uses SDK
       ↓
┌─────────────────────────────┐
│   TypeScript SDK            │
│   (@blockwin/chain-sdk)     │
└──────────┬──────────────────┘
           │ HTTP Requests
           ↓
┌───────────────────────────────────┐
│   NestJS Backend API              │
│                                   │
│  ┌─────────────────────────────┐ │
│  │  Rate Limiting & Validation │ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │  Relayer Wallet (Signs)     │ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │  PostgreSQL (User Data)     │ │
│  └─────────────────────────────┘ │
└───────────────┬───────────────────┘
                │ Viem
                ↓
┌───────────────────────────────────┐
│   Polygon Network                 │
│   (via Alchemy RPC)               │
└───────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend | NestJS 10.3 | REST API framework |
| Blockchain | Viem 2.9 | Type-safe Ethereum library |
| Database | PostgreSQL + Prisma | User & transaction storage |
| Network | Polygon Mumbai | Low-cost test transactions |
| SDK | TypeScript | Client library |
| Security | @nestjs/throttler | Rate limiting |
| Validation | class-validator | Input validation |

---

## Features

### Core Features
- **Gasless Transactions** - Backend pays all gas fees
- **No Wallet Needed** - Users identified by simple `userId`
- **Instant Onboarding** - Create user in one API call
- **TypeScript SDK** - Easy integration for developers

### Security Features
- **Rate Limiting** - 5 transactions/minute per user
- **Input Validation** - All inputs sanitized and validated
- **Max Transaction Amount** - Configurable spending limits
- **Request Logging** - Full audit trail
- **Address Validation** - Prevents invalid transactions

### Developer Experience
- **REST API** - Simple HTTP endpoints
- **Full TypeScript** - End-to-end type safety
- **Comprehensive Docs** - API references and examples
- **Example App** - Working implementation included

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Alchemy account (free tier works)
- MetaMask or similar wallet (for funding relayer)

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd blockwin
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/blockwin"
RELAYER_PRIVATE_KEY="0x..."  # Your relayer wallet private key
POLYGON_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY"
PORT=3000
MAX_TRANSACTION_AMOUNT="0.1"
```

4. **Set up database:**
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. **Fund your relayer wallet:**

Get the relayer address:
```bash
node -e "const {privateKeyToAccount} = require('viem/accounts'); console.log(privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY).address)"
```

Send test MATIC from [Mumbai Faucet](https://faucet.polygon.technology/) to this address.

6. **Start the backend:**
```bash
npm run start:dev
```

Should see:
```
Blockchain service initialized with relayer: 0x...
Application is running on: http://localhost:3000
```

### Testing the API

**Create a user:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-1"}'

# Response:
# {"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}
```

**Execute a transaction:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "0.001"
  }'

# Response:
# {"hash":"0x8f3a2b1c..."}
```

**Check transaction status:**
```bash
curl http://localhost:3000/tx/0x8f3a2b1c...

# Response:
# {"status":"confirmed"}
```

---

## Project Structure

```
blockwin/
├── backend/                 # NestJS REST API
│   ├── src/
│   │   ├── main.ts          # Application entry point
│   │   ├── app.module.ts    # Root module
│   │   ├── users/           # User management
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── transactions/    # Transaction execution
│   │   │   ├── transactions.controller.ts
│   │   │   ├── transactions.service.ts
│   │   │   └── dto/
│   │   ├── blockchain/      # Viem integration
│   │   │   ├── blockchain.service.ts
│   │   │   └── blockchain.module.ts
│   │   └── prisma/          # Database client
│   │       ├── prisma.service.ts
│   │       └── prisma.module.ts
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── .env                 # Environment config
│   └── package.json
│
├── sdk/                     # TypeScript SDK
│   ├── src/
│   │   ├── index.ts         # ChainSDK class
│   │   └── types.ts         # TypeScript definitions
│   ├── examples/
│   │   └── usage.ts         # Example usage
│   └── package.json
│
└── README.md                # This file
```

For detailed documentation:
- [Backend README](./backend/README.md)
- [SDK README](./sdk/README.md)

---

## API Documentation

### POST /users

Create a new user and generate a reference wallet address.

**Request:**
```json
{
  "userId": "alice"
}
```

**Response:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Note:** The wallet address is for reference only. The relayer signs all transactions.

### POST /execute

Execute a native token transfer on Polygon. The relayer pays gas.

**Request:**
```json
{
  "userId": "alice",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.01"
}
```

**Response:**
```json
{
  "hash": "0x8f3a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1"
}
```

**Rate Limit:** 5 requests per minute per userId

**Validation:**
- `userId` must exist in database
- `to` must be valid Ethereum address
- `amount` must be positive number
- `amount` must be ≤ MAX_TRANSACTION_AMOUNT

### GET /tx/:hash

Check the status of a transaction.

**Request:**
```
GET /tx/0x8f3a2b1c...
```

**Response:**
```json
{
  "status": "pending" | "confirmed" | "failed"
}
```

**Status Flow:**
1. `pending` - Transaction submitted to network
2. `confirmed` - Transaction mined successfully
3. `failed` - Transaction reverted

---

## SDK Usage

### Installation

```bash
npm install @blockwin/chain-sdk
```

### Basic Example

```typescript
import { ChainSDK } from '@blockwin/chain-sdk';

// Initialize SDK
const sdk = new ChainSDK({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key' // Optional
});

// Create user
const user = await sdk.createUser('alice');
console.log(user.walletAddress);
// => "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

// Execute transaction
const tx = await sdk.executeTransaction({
  userId: 'alice',
  to: '0xBob...',
  amount: '0.01'
});
console.log(tx.hash);
// => "0x8f3a2b..."

// Poll for confirmation
let status = await sdk.getTransactionStatus(tx.hash);
while (status.status === 'pending') {
  await new Promise(resolve => setTimeout(resolve, 2000));
  status = await sdk.getTransactionStatus(tx.hash);
}
console.log(status.status);
// => "confirmed"
```

For complete SDK documentation, see [SDK README](./sdk/README.md).

---

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/blockwin` |
| `RELAYER_PRIVATE_KEY` | Yes | Private key for relayer wallet (64 hex chars) | `0xabc123...` |
| `POLYGON_RPC_URL` | Yes | Alchemy/Infura RPC endpoint | `https://polygon-mumbai.g.alchemy.com/v2/KEY` |
| `PORT` | No | API server port | `3000` |
| `MAX_TRANSACTION_AMOUNT` | No | Maximum MATIC per transaction | `0.1` |

### Database Setup

**Using local PostgreSQL:**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb blockwin

# Update .env
DATABASE_URL="postgresql://localhost:5432/blockwin"
```

**Using hosted PostgreSQL:**
- [Supabase](https://supabase.com) - Free tier with 500MB
- [Neon](https://neon.tech) - Free serverless Postgres
- [Railway](https://railway.app) - $5/month

### Blockchain Setup

**Get Alchemy RPC URL:**
1. Sign up at [alchemy.com](https://alchemy.com)
2. Create new app → Polygon Mumbai
3. Copy HTTP URL
4. Add to `.env` as `POLYGON_RPC_URL`

**Fund relayer wallet:**
1. Get relayer address (see Quick Start)
2. Visit [Mumbai Faucet](https://faucet.polygon.technology/)
3. Send 1-2 test MATIC to relayer address

**For production:**
- Use Polygon Mainnet RPC
- Fund relayer with real MATIC
- Use secure key management (AWS Secrets Manager, HashiCorp Vault)

---

## Development

### Running Locally

```bash
# Backend
cd backend
npm run start:dev

# Database UI
npm run prisma:studio
```

### Database Migrations

```bash
# Create new migration
npm run prisma:migrate

# Apply migrations
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Building for Production

```bash
cd backend
npm run build

# Start production server
npm run start:prod
```

---

## Security

### Implemented Security Features

**Rate Limiting:**
- 5 transactions per minute per `userId`
- Prevents spam and abuse
- Returns `429 Too Many Requests` when exceeded

**Input Validation:**
- All inputs validated with `class-validator`
- Rejects malformed requests immediately
- Sanitizes SQL queries (Prisma ORM)

**Address Validation:**
- Uses viem's `isAddress()` function
- Prevents sending to invalid addresses
- Catches typos before blockchain submission

**Amount Limits:**
- Configurable `MAX_TRANSACTION_AMOUNT`
- Prevents large unauthorized transfers
- Default: 0.1 MATIC per transaction

**Request Logging:**
- All transactions logged with timestamp
- Includes userId, destination, amount
- Audit trail for compliance

### Production Security Checklist

- [ ] Use environment-specific RPC URLs
- [ ] Store private keys in secret manager (AWS, Vault)
- [ ] Enable HTTPS/TLS for API
- [ ] Add authentication/authorization
- [ ] Implement IP allowlisting
- [ ] Monitor relayer wallet balance
- [ ] Set up alerts for unusual activity
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use non-custodial solution for user funds (future)

---

## Deployment

### Environment Setup

**Recommended Stack:**
- **Backend**: Railway, Render, or AWS ECS
- **Database**: Supabase, Neon, or AWS RDS
- **RPC**: Alchemy production tier
- **Monitoring**: DataDog, New Relic, or Sentry

### Deployment Steps

1. **Deploy Database:**
   - Create production PostgreSQL instance
   - Run migrations: `npx prisma migrate deploy`
   - Update `DATABASE_URL` in production env

2. **Deploy Backend:**
   - Build Docker image or use Node.js buildpack
   - Set all environment variables
   - Deploy to cloud provider
   - Verify health check endpoint

3. **Fund Relayer:**
   - Generate secure production private key
   - Fund with sufficient MATIC (monitor balance)
   - Never commit private key to git

4. **Monitor:**
   - Set up logging (CloudWatch, Papertrail)
   - Alert on relayer balance < threshold
   - Monitor transaction failure rate
   - Track API response times

### Scaling Considerations

**Relayer Management:**
- Single relayer handles ~100 tx/sec
- For higher volume, implement relayer pool
- Monitor nonce collisions
- Implement queue system for peak loads

**Database:**
- Index frequently queried fields
- Archive old transactions
- Use read replicas for status checks

**Cost Optimization:**
- Batch transactions where possible
- Use EIP-1559 for better gas pricing
- Monitor and optimize gas usage

---

## Use Cases

### Gaming Rewards
Players earn tokens without knowing they're using blockchain:
```typescript
// Player completes quest
await sdk.executeTransaction({
  userId: playerId,
  to: playerWallet,
  amount: rewardAmount
})
// Player sees: "You earned 10 coins!"
```

### Social Tipping
Twitter-style tips without crypto complexity:
```typescript
// User tips creator
await sdk.executeTransaction({
  userId: tipper,
  to: creator,
  amount: '0.01'
})
// User sees: "Tip sent to @creator!"
```

### Micro-Payments
Enable tiny payments for digital content:
```typescript
// Pay $0.001 to read article
await sdk.executeTransaction({
  userId: reader,
  to: publisher,
  amount: '0.001'
})
// Reader sees: "Article unlocked"
```

### Why This Matters

Traditional crypto UX requires:
- Installing MetaMask
- Backing up seed phrase
- Buying ETH/MATIC
- Understanding gas
- Signing complex transactions

**With chain abstraction:**
- Sign up with email
- Click "Send"
- Done

This unlocks blockchain for the next billion users.

---

## Roadmap

### Phase 1: MVP (Current)
- [x] Single chain (Polygon)
- [x] REST API
- [x] TypeScript SDK
- [x] Basic security

### Phase 2: Multi-Chain
- [ ] Support Arbitrum, Optimism, Base
- [ ] Unified API across chains
- [ ] Cross-chain transfers
- [ ] Chain selection in SDK

### Phase 3: Gas Optimization
- [ ] EIP-1559 dynamic fees
- [ ] Gas price oracles
- [ ] Batch transactions
- [ ] Layer 2 integration

### Phase 4: Payments
- [ ] Stripe integration
- [ ] Credit system
- [ ] User balances
- [ ] Fiat on/off ramps

### Phase 5: Enterprise
- [ ] Multi-tenant support
- [ ] White-label solution
- [ ] Advanced analytics
- [ ] SLA guarantees

---

## Contributing

We welcome contributions! Here's how:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Follow existing TypeScript conventions
- Use Prettier for formatting
- Add JSDoc comments for public APIs
- Write meaningful commit messages

### Testing
```bash
# Run backend tests
cd backend
npm test

# Run SDK tests
cd sdk
npm test
```

### Areas for Contribution
- Multi-chain support
- Additional security features
- Performance optimizations
- Documentation improvements
- Example applications

---

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review example implementations

Built with ❤️ for the next billion blockchain users.
