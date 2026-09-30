// Twin Range Filter + Supertrend — yalnızca bunu, 1s / 4s / günlük mumlarda test eder.
process.argv[2] = 'twinst';
process.argv[3] = '1h,4h,1d';
await import('./yeni-stratejiler');
export {};
