// TRF + Supertrend (kullanıcı kuralı) — 15dk / 1s / 4s / günlük.
process.argv[2] = 'trfst';
process.argv[3] = '15m,1h,4h,1d';
await import('./yeni-stratejiler');
export {};
