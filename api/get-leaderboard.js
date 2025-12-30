// Vercel Serverless Function for fetching leaderboard from Base blockchain

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ethers } = await import('ethers');
    
    // Connect to Base network
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    const { contractAddress, count = 10 } = req.query;

    if (!contractAddress) {
      return res.status(400).json({ error: 'contractAddress required' });
    }

    // Leaderboard contract ABI
    const contractABI = [
      {
        inputs: [{ internalType: 'uint256', name: 'count', type: 'uint256' }],
        name: 'getTopScores',
        outputs: [
          {
            components: [
              { internalType: 'address', name: 'player', type: 'address' },
              { internalType: 'uint256', name: 'level', type: 'uint256' },
              { internalType: 'uint256', name: 'balls', type: 'uint256' },
              { internalType: 'uint256', name: 'bosses', type: 'uint256' },
              { internalType: 'uint256', name: 'timestamp', type: 'uint256' }
            ],
            internalType: 'struct Leaderboard.Score[]',
            name: '',
            type: 'tuple[]'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
        name: 'getPlayerScore',
        outputs: [
          {
            components: [
              { internalType: 'address', name: 'player', type: 'address' },
              { internalType: 'uint256', name: 'level', type: 'uint256' },
              { internalType: 'uint256', name: 'balls', type: 'uint256' },
              { internalType: 'uint256', name: 'bosses', type: 'uint256' },
              { internalType: 'uint256', name: 'timestamp', type: 'uint256' }
            ],
            internalType: 'struct Leaderboard.Score',
            name: '',
            type: 'tuple'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Get top scores
    const topScores = await contract.getTopScores(parseInt(count));
    
    // Format scores
    const formattedScores = topScores.map((score, index) => ({
      rank: index + 1,
      player: score.player,
      level: score.level.toString(),
      balls: score.balls.toString(),
      bosses: score.bosses.toString(),
      timestamp: score.timestamp.toString(),
    }));

    return res.status(200).json({
      success: true,
      scores: formattedScores,
      count: formattedScores.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({
      error: 'Failed to fetch leaderboard',
      message: error.message,
    });
  }
}

