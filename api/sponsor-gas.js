// Vercel Serverless Function for sponsoring gas fees using CDP SDK
// Environment variables required:
// - CDP_API_KEY_NAME
// - CDP_PRIVATE_KEY  
// - CDP_WALLET_ID (optional, for sponsor wallet)

export default async function handler(req, res) {
  // CORS headers for Base App
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Dynamic import for CDP SDK (ESM module)
    const { CDP } = await import('@coinbase/cdp-sdk');
    
    // Initialize CDP SDK
    const cdp = new CDP({
      apiKeyName: process.env.CDP_API_KEY_NAME,
      privateKey: process.env.CDP_PRIVATE_KEY,
    });

    const { transactionData, network = 'base' } = req.body;

    if (!transactionData) {
      return res.status(400).json({ error: 'Transaction data required' });
    }

    // Sponsor the transaction
    // CDP SDK will automatically sponsor gas fees if sponsor: true
    const result = await cdp.wallets.sendTransaction({
      walletId: process.env.CDP_WALLET_ID || 'default',
      network: network,
      transaction: {
        ...transactionData,
        sponsor: true, // Enable gas sponsorship
      },
    });

    return res.status(200).json({
      success: true,
      transactionHash: result.hash || result.transactionHash,
      sponsored: true,
    });
  } catch (error) {
    console.error('Sponsor gas error:', error);
    return res.status(500).json({
      error: 'Failed to sponsor transaction',
      message: error.message,
    });
  }
}
