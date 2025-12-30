# Leaderboard Setup Guide

Bu doküman, Ball Run oyunu için blockchain tabanlı leaderboard kurulumunu açıklar.

## 📋 Gereksinimler

1. **CDP API Key** - Sponsor gas için
2. **Base Network** - Contract deploy için
3. **Solidity Compiler** - Contract compile için
4. **500$ CDP Kredi** - Gas sponsorship için

## 🚀 Adım Adım Kurulum

### 1. Smart Contract Deploy

#### Option A: Remix IDE (Önerilen)

1. [Remix IDE](https://remix.ethereum.org) açın
2. `contracts/Leaderboard.sol` dosyasını Remix'e yükleyin
3. Solidity compiler versiyonunu `0.8.20` olarak ayarlayın
4. "Compile Leaderboard.sol" butonuna tıklayın
5. "Deploy & Run Transactions" sekmesine gidin
6. Environment: "Injected Provider - MetaMask" seçin
7. Base network'e bağlanın (Chain ID: 8453)
8. "Deploy" butonuna tıklayın
9. Deploy edilen contract address'ini kopyalayın

#### Option B: Hardhat/Foundry

```bash
# Hardhat ile
npx hardhat compile
npx hardhat run scripts/deploy.js --network base

# Foundry ile
forge build
forge create Leaderboard --rpc-url https://mainnet.base.org --private-key YOUR_KEY
```

### 2. Contract Address'i Ayarlama

Deploy edilen contract address'ini environment variable olarak ekleyin:

**Vercel Environment Variables:**
```
LEADERBOARD_CONTRACT=0xYourContractAddressHere
CDP_API_KEY_NAME=your-api-key-name
CDP_PRIVATE_KEY=your-private-key
CDP_WALLET_ID=your-sponsor-wallet-id
```

**Frontend'de (game.js):**
```javascript
const LEADERBOARD_CONTRACT = '0xYourContractAddressHere';
```

### 3. API Endpoints

#### Submit Score
```
POST /api/submit-score
Body: {
  playerAddress: string,
  level: number,
  balls: number,
  bosses: number,
  contractAddress: string
}
```

#### Get Leaderboard
```
GET /api/get-leaderboard?contractAddress=0x...&count=20
```

### 4. Frontend Entegrasyonu

Leaderboard otomatik olarak:
- Oyun bittiğinde skor kaydeder
- "LEADERBOARD" butonuna tıklanınca gösterilir
- Top 20 skoru gösterir

## 🔧 Test Etme

### 1. Local Test

```bash
npm install
npm run dev
```

### 2. Base Testnet

Contract'ı önce Base Sepolia testnet'ine deploy edin:

```javascript
// Remix'te network: Base Sepolia (Chain ID: 84532)
// Testnet RPC: https://sepolia.base.org
```

### 3. Mainnet Deploy

Testnet'te test ettikten sonra mainnet'e deploy edin.

## 💰 Gas Sponsorship

Tüm transaction'lar CDP SDK ile sponsor edilir:
- Kullanıcılar gas ödemez
- 500$ CDP kredisi kullanılır
- Base featured gereksinimi karşılanır

## 📊 Leaderboard Özellikleri

- **Top 100 Skor**: Contract'ta saklanır
- **Sıralama**: Level > Balls > Bosses
- **Player Scores**: Her oyuncunun en iyi skoru
- **Real-time**: Blockchain'den direkt okunur

## 🐛 Troubleshooting

### Contract Deploy Hatası
- Base network'e bağlı olduğunuzdan emin olun
- Yeterli ETH'iniz olduğundan emin olun (deploy için)

### API Hatası
- Environment variables'ların doğru olduğundan emin olun
- CDP API key'inin aktif olduğundan emin olun
- Contract address'inin doğru olduğundan emin olun

### Skor Kaydedilmiyor
- Player address'inin doğru olduğundan emin olun
- Contract'ın Base network'ünde olduğundan emin olun
- CDP sponsor gas'ın aktif olduğundan emin olun

## 📝 Notlar

- Contract address'i deploy sonrası değişmez
- Skorlar kalıcı olarak blockchain'de saklanır
- Gas sponsorship sayesinde kullanıcılar ücretsiz skor kaydedebilir
- Leaderboard herkese açıktır (public)

## 🔗 Kaynaklar

- [Base Documentation](https://docs.base.org)
- [CDP SDK Documentation](https://docs.cdp.coinbase.com)
- [Remix IDE](https://remix.ethereum.org)
- [Base Explorer](https://basescan.org)

