// Vercel Serverless Function for submitting scores to Base blockchain
// Uses CDP SDK with sponsor gas

export default async function handler(req, res) {
  // CORS headers
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
    const { CDP } = await import('@coinbase/cdp-sdk');
    
    const cdp = new CDP({
      apiKeyName: process.env.CDP_API_KEY_NAME,
      privateKey: process.env.CDP_PRIVATE_KEY,
    });

    const { playerAddress, level, balls, bosses, contractAddress } = req.body;

    if (!playerAddress || level === undefined || balls === undefined || bosses === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['playerAddress', 'level', 'balls', 'bosses']
      });
    }

    // Leaderboard contract ABI (just the submitScore function)
    const contractABI = [
      {
        inputs: [
          { internalType: 'uint256', name: 'level', type: 'uint256' },
          { internalType: 'uint256', name: 'balls', type: 'uint256' },
          { internalType: 'uint256', name: 'bosses', type: 'uint256' }
        ],
        name: 'submitScore',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ];

    // Encode function call
    const ethers = await import('ethers');
    const contract = new ethers.Contract(contractAddress, contractABI);
    const data = contract.interface.encodeFunctionData('submitScore', [level, balls, bosses]);

    // Create transaction with sponsor gas
    const transaction = {
      to: contractAddress,
      data: data,
      value: '0x0',
    };

    // Send transaction with CDP SDK (sponsor gas enabled)
    const result = await cdp.wallets.sendTransaction({
      walletId: process.env.CDP_WALLET_ID || playerAddress, // Use player's wallet or sponsor wallet
      network: 'base',
      transaction: {
        ...transaction,
        sponsor: true, // Enable gas sponsorship
      },
    });

    return res.status(200).json({
      success: true,
      transactionHash: result.hash || result.transactionHash,
      sponsored: true,
      playerAddress,
      score: { level, balls, bosses },
    });
  } catch (error) {
    console.error('Submit score error:', error);
    return res.status(500).json({
      error: 'Failed to submit score',
      message: error.message,
    });
  }
}

