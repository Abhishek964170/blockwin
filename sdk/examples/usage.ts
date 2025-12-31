import { ChainSDK } from '../src/index';

async function main() {
  const sdk = new ChainSDK({
    baseUrl: 'http://localhost:3000',
    apiKey: 'your-api-key-here',
  });

  try {
    // 1. Create a new user
    console.log('Creating user...');
    const user = await sdk.createUser('user123');
    console.log('User created:', user.walletAddress);

    // 2. Execute a transaction
    console.log('\nExecuting transaction...');
    const transaction = await sdk.executeTransaction({
      userId: 'user123',
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      amount: '0.01',
    });
    console.log('Transaction hash:', transaction.hash);

    // 3. Check transaction status
    console.log('\nChecking transaction status...');
    const status = await sdk.getTransactionStatus(transaction.hash);
    console.log('Transaction status:', status.status);

    // Poll for confirmation (optional)
    console.log('\nPolling for confirmation...');
    let finalStatus = status.status;
    while (finalStatus === 'pending') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await sdk.getTransactionStatus(transaction.hash);
      finalStatus = result.status;
      console.log('Status:', finalStatus);
    }

    console.log('\nFinal status:', finalStatus);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
