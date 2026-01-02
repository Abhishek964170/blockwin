# Chain Abstraction MVP

> A backend API and SDK that lets apps/users execute blockchain transactions without wallets, gas tokens, or crypto UX. Users pay normally, while the backend handles signing, gas, and on-chain settlement.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.3-red)
![Polygon](https://img.shields.io/badge/Polygon-Mumbai-8247E5)
![License](https://img.shields.io/badge/License-MIT-green)

## Problem

Paying Web3 apps or sending crypto to other users is difficult. Users need wallets, gas tokens, and technical knowledge, and one mistake can lose funds forever. This complexity stops most people from using crypto.

Traditional crypto requires:
- Wallet installation + seed phrase backup
- Buying gas tokens (ETH/MATIC)
- Understanding transaction signing
- Managing private keys

**Result:** Most users drop off before completing their first transaction.

## Solution

Using crypto is hard because people must set up wallets, manage secret keys, and pay extra fees just to send money. We remove all of that. Apps use our service to send payments on blockchain in the background, while users pay like they normally do—no wallets, no gas, no confusion.

This platform provides a backend relayer that:
- Signs all transactions on behalf of users
- Pays gas fees automatically
- Exposes simple REST API (no Web3 knowledge needed)
- Provides TypeScript SDK for easy integration

**What users see:**
```typescript
await sdk.executeTransaction({
  userId: 'alice',
  to: '0xBob...',
  amount: '0.01'
})
```

**What you handle:** Wallets, gas, blockchain complexity.

---

## Architecture

```
Frontend/App
    ↓ (uses SDK)
TypeScript SDK
    ↓ (HTTP)
NestJS Backend
    ├─ Rate Limiting
    ├─ Relayer Wallet (signs)
    └─ PostgreSQL
    ↓ (viem)
Polygon Network
```

### Stack

| Layer | Tech | Why |
|-------|------|-----|
| API | NestJS 10.3 | Type-safe, batteries-included |
| Blockchain | Viem 2.9 | Modern, lightweight |
| Database | PostgreSQL + Prisma | Reliable, type-safe ORM |
| Network | Polygon Mumbai | Low-cost testnet |
| SDK | TypeScript | Developer experience |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Alchemy account (free)
- MetaMask (for funding relayer)

### Setup

1. **Install:**
```bash
git clone <repo>
cd blockwin/backend
npm install
```

2. **Configure `.env`:**
```bash
cp .env.example .env
```

Edit with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/blockwin"
RELAYER_PRIVATE_KEY="0x..."  # 64 hex chars
POLYGON_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY"
MAX_TRANSACTION_AMOUNT="0.1"
```

3. **Setup database:**
```bash
npm run prisma:migrate
npm run prisma:generate
```

4. **Fund relayer:**

Get address:
```bash
node -e "const {privateKeyToAccount} = require('viem/accounts'); console.log(privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY).address)"
```

Send test MATIC from [Mumbai Faucet](https://faucet.polygon.technology/).

5. **Start:**
```bash
npm run start:dev
```

### Test It

**Create user:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice"}'
```

**Send transaction:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice", "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "amount": "0.001"}'
```

**Check status:**
```bash
curl http://localhost:3000/tx/0x...
```

---

## API Reference

### `POST /users`
Create user, get reference wallet address.

**Request:**
```json
{"userId": "alice"}
```

**Response:**
```json
{"walletAddress": "0x742d35..."}
```

### `POST /execute`
Execute MATIC transfer. Relayer pays gas.

**Request:**
```json
{
  "userId": "alice",
  "to": "0x742d35...",
  "amount": "0.01"
}
```

**Response:**
```json
{"hash": "0x8f3a2b..."}
```

**Limits:**
- 5 tx/min per user
- Max 0.1 MATIC per tx
- Address must be valid

### `GET /tx/:hash`
Check transaction status.

**Response:**
```json
{"status": "pending" | "confirmed" | "failed"}
```

---

## SDK Usage

### Install
```bash
npm install @blockwin/chain-sdk
```

### Example
```typescript
import { ChainSDK } from '@blockwin/chain-sdk';

const sdk = new ChainSDK({
  baseUrl: 'http://localhost:3000'
});

// Create user
const user = await sdk.createUser('alice');

// Send transaction
const tx = await sdk.executeTransaction({
  userId: 'alice',
  to: '0xBob...',
  amount: '0.01'
});

// Check status
const status = await sdk.getTransactionStatus(tx.hash);
```

See [SDK README](./sdk/README.md) for details.

---

## Project Structure

```
blockwin/
├── backend/           # NestJS API
│   ├── src/
│   │   ├── users/     # User management
│   │   ├── transactions/  # TX execution
│   │   ├── blockchain/    # Viem integration
│   │   └── prisma/    # Database
│   └── prisma/schema.prisma
├── sdk/              # TypeScript SDK
└── README.md
```

---

## Security

### What's Implemented
- **Rate limiting:** 5 tx/min per user
- **Input validation:** All inputs sanitized
- **Address validation:** Prevents invalid addresses
- **Max amount:** Configurable spending limit
- **Logging:** Full audit trail

### For Production
- [ ] Store private key in secret manager (AWS Secrets, Vault)
- [ ] Enable HTTPS
- [ ] Add authentication
- [ ] Monitor relayer balance
- [ ] Set up alerts

---

## Configuration

### Environment Variables

| Var | Required | Description |
|-----|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `RELAYER_PRIVATE_KEY` | Yes | 64 hex char private key |
| `POLYGON_RPC_URL` | Yes | Alchemy/Infura endpoint |
| `MAX_TRANSACTION_AMOUNT` | No | Max MATIC per tx (default: 0.1) |

### Database
**Local:**
```bash
brew install postgresql
createdb blockwin
```

**Hosted:**
- [Supabase](https://supabase.com) - Free 500MB
- [Neon](https://neon.tech) - Free serverless
- [Railway](https://railway.app) - $5/mo

### Blockchain
1. Get free Alchemy account at [alchemy.com](https://alchemy.com)
2. Create app → Polygon Mumbai
3. Copy HTTP URL to `.env`

---

## Use Cases

**Gaming:** Players earn tokens without knowing it's blockchain
```typescript
await sdk.executeTransaction({
  userId: playerId,
  to: playerWallet,
  amount: rewardAmount
})
```

**Social Tipping:** Like Venmo, but crypto
```typescript
await sdk.executeTransaction({
  userId: tipper,
  to: creator,
  amount: '0.01'
})
```

**Micro-Payments:** Pay $0.001 for content
```typescript
await sdk.executeTransaction({
  userId: reader,
  to: publisher,
  amount: '0.001'
})
```

---

## Roadmap

### Current (MVP)
- [x] Single chain (Polygon)
- [x] REST API
- [x] TypeScript SDK
- [x] Security basics

### Next
- [ ] Multi-chain (Arbitrum, Base)
- [ ] Payment processing (Stripe)
- [ ] Gas optimization

---

## License

MIT License - See LICENSE file for details.

---

## Support

- Open an issue on GitHub
- Check [Backend README](./backend/README.md)
- Review [SDK README](./sdk/README.md)

Built for developers who want blockchain without the blockchain.
