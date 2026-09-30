// EMA 5/8/13 + MACD ve EMA 21/55 (2. anlatım) — yalnızca bunları test eder.
process.argv[2] = 'ema5813macd,ema2155v2';
await import('./yeni-stratejiler');
export {};
