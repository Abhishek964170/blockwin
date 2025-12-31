# Chain Abstraction MVP - NestJS Backend

Minimal backend for chain abstraction on Polygon using viem and PostgreSQL.

## Architecture

- **Centralized relayer model**: Backend wallet signs all transactions
- **User wallets**: Reference-only (for future migration)
- **Gas**: Relayer pays all gas fees
- **Chain**: Polygon only

## Prerequisites

- Node.js 18+
- PostgreSQL
- Polygon RPC URL (Alchemy, Infura, etc.)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blockwin"
RELAYER_PRIVATE_KEY="0x..." # Your relayer wallet private key
POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"
PORT=3000
MAX_TRANSACTION_AMOUNT="0.1"
```

### 3. Set up database

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. Start the server

Development:
```bash
npm run start:dev
```

Production:
```bash
npm run build
npm run start:prod
```

## API Endpoints

### POST /users

Create a new user with a reference wallet.

**Request:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "walletAddress": "0x..."
}
```

### POST /execute

Execute a native token transfer (relayer signs).

**Request:**
```json
{
  "userId": "user123",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.01"
}
```

**Response:**
```json
{
  "hash": "0x..."
}
```

**Rate limit:** 5 requests per minute per user

### GET /tx/:hash

Check transaction status.

**Response:**
```json
{
  "status": "pending" | "confirmed" | "failed"
}
```

## Security Features

- Address validation (viem)
- Amount validation (positive, below max)
- Rate limiting (5 tx/min per user)
- Request logging
- Max transaction amount limit

## Database Schema

### User
- `id`: UUID
- `userId`: Unique user identifier
- `walletAddress`: Reference wallet (not used for signing)
- `createdAt`: Timestamp

### Transaction
- `id`: UUID
- `hash`: Transaction hash (unique)
- `userId`: User reference
- `to`: Destination address
- `amount`: Token amount
- `status`: pending | confirmed | failed
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Development

View database:
```bash
npm run prisma:studio
```

Create new migration:
```bash
npm run prisma:migrate
```

## Important Notes

- **Custodial**: Relayer controls all funds
- **Single relayer**: One wallet signs everything
- **Reference wallets**: User wallets are for future use only
- **No private keys**: User private keys are NOT stored
- **Production**: Add authentication, monitoring, and proper key management
