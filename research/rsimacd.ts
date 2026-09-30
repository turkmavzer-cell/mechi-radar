// Yalnızca RSI + MACD stratejisinin stop/hedef testi (research/yeni-stratejiler.ts ile aynı yöntem).
process.argv[2] = 'rsimacd';
await import('./yeni-stratejiler');
export {};
