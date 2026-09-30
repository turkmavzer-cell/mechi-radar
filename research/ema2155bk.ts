// EMA 21/55 kırılım stratejileri (iki çıkış) — yalnızca bunları test eder.
process.argv[2] = 'ema2155bo,ema2155bt';
await import('./yeni-stratejiler');
export {};
