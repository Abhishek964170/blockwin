# Chain Abstraction SDK

Minimal TypeScript SDK for interacting with the chain abstraction backend. Users don't manage wallets or private keys - the backend handles everything.

## Installation

```bash
npm install @blockwin/chain-sdk
```

## Quick Start

```typescript
import { ChainSDK } from '@blockwin/chain-sdk';

const sdk = new ChainSDK({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key', // optional
});

// Create user
const user = await sdk.createUser('user123');

// Execute transaction
const tx = await sdk.executeTransaction({
  userId: 'user123',
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  amount: '0.01',
});

// Check status
const status = await sdk.getTransactionStatus(tx.hash);
```

## API Reference

### Constructor

```typescript
new ChainSDK(config: SDKConfig)
```

**Parameters:**
- `config.baseUrl` (string, required): Backend API base URL
- `config.apiKey` (string, optional): API key for authentication

**Example:**
```typescript
const sdk = new ChainSDK({
  baseUrl: 'https://api.example.com',
  apiKey: 'abc123',
});
```

### createUser

Create a new user with a reference wallet address.

```typescript
createUser(userId: string): Promise<{ walletAddress: string }>
```

**Parameters:**
- `userId` (string): Unique user identifier

**Returns:**
- `walletAddress` (string): Generated wallet address (reference only)

**Example:**
```typescript
const result = await sdk.createUser('user123');
console.log(result.walletAddress); // "0x..."
```

### executeTransaction

Execute a native token transfer. The backend relayer signs and pays gas.

```typescript
executeTransaction(input: ExecuteTransactionInput): Promise<{ hash: string }>
```

**Parameters:**
- `input.userId` (string): User identifier
- `input.to` (string): Destination wallet address
- `input.amount` (string): Amount to send (in native tokens)

**Returns:**
- `hash` (string): Transaction hash

**Example:**
```typescript
const result = await sdk.executeTransaction({
  userId: 'user123',
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  amount: '0.01',
});
console.log(result.hash); // "0x..."
```

### getTransactionStatus

Check the status of a transaction.

```typescript
getTransactionStatus(hash: string): Promise<{ status: TransactionStatus }>
```

**Parameters:**
- `hash` (string): Transaction hash

**Returns:**
- `status` (TransactionStatus): One of `"pending"`, `"confirmed"`, or `"failed"`

**Example:**
```typescript
const result = await sdk.getTransactionStatus('0x...');
console.log(result.status); // "confirmed"
```

## TypeScript Types

All types are exported from the SDK:

```typescript
import {
  ChainSDK,
  SDKConfig,
  CreateUserResponse,
  ExecuteTransactionInput,
  ExecuteTransactionResponse,
  TransactionStatus,
  TransactionStatusResponse,
} from '@blockwin/chain-sdk';
```

## Error Handling

The SDK wraps axios errors and re-throws them as standard Error objects:

```typescript
try {
  await sdk.createUser('user123');
} catch (error) {
  console.error('Failed to create user:', error.message);
}
```

## Complete Example

See [examples/usage.ts](./examples/usage.ts) for a complete working example.

```typescript
import { ChainSDK } from '@blockwin/chain-sdk';

async function main() {
  const sdk = new ChainSDK({
    baseUrl: 'http://localhost:3000',
    apiKey: 'your-api-key',
  });

  // Create user
  const user = await sdk.createUser('user123');
  console.log('Wallet:', user.walletAddress);

  // Execute transaction
  const tx = await sdk.executeTransaction({
    userId: 'user123',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: '0.01',
  });
  console.log('Hash:', tx.hash);

  // Poll for confirmation
  let status = await sdk.getTransactionStatus(tx.hash);
  while (status.status === 'pending') {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    status = await sdk.getTransactionStatus(tx.hash);
  }
  console.log('Final status:', status.status);
}

main();
```

## Development

Build the SDK:
```bash
npm run build
```

The compiled code will be in the `dist/` folder.

## License

MIT
