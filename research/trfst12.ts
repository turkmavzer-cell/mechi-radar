// TRF + Supertrend: ATR kâr al ve ek yöntem seçenekleri — 15dk / 1s / 4s / günlük.
process.argv[2] = 'trfst1,trfst2';
process.argv[3] = '15m,1h,4h,1d';
await import('./yeni-stratejiler');
export {};
