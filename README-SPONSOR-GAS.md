# Sponsor Gas Setup for Ball Run

Bu doküman, Coinbase Developer Platform (CDP) kullanarak sponsor gas kurulumunu açıklar.

## Gereksinimler

1. **CDP API Key**: [Coinbase Developer Platform](https://portal.cdp.coinbase.com) üzerinden API key oluşturun
2. **Project ID**: `e35739c8-fc48-40f2-9f3c-0205d7d7892a`
3. **500$ Kredi**: Dashboard'da görünen kredi

## Kurulum

### 1. Environment Variables (Vercel)

Vercel dashboard'da şu environment variables'ları ekleyin:

```
CDP_API_KEY_NAME=your-api-key-name
CDP_PRIVATE_KEY=your-private-key
CDP_WALLET_ID=your-sponsor-wallet-id
```

### 2. CDP SDK Kurulumu

Backend için CDP SDK'sını kurun:

```bash
npm install @coinbase/cdp-sdk
```

### 3. API Endpoint

`api/sponsor-gas.js` dosyası Vercel serverless function olarak çalışacak.

## Kullanım

Frontend'den sponsor gas API'sini çağırın:

```javascript
async function sponsorTransaction(transactionData) {
  try {
    const response = await fetch('/api/sponsor-gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionData: transactionData,
      }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Sponsor gas error:', error);
    throw error;
  }
}
```

## Base Featured Gereksinimi

Base featured checklist'inde "Transactions are sponsored" gereksinimi vardır. Bu setup ile tüm blockchain işlemleri sponsor edilecektir.

## Notlar

- CDP SDK backend için tasarlanmıştır
- API key'lerinizi asla frontend'de expose etmeyin
- Sponsor wallet'ınızda yeterli bakiye olduğundan emin olun
- Rate limiting ve güvenlik önlemleri ekleyin

## Daha Fazla Bilgi

- [CDP Documentation](https://docs.cdp.coinbase.com)
- [Base Mini Apps](https://docs.base.org/mini-apps)

