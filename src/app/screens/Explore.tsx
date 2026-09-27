import { useState } from 'react';
import { searchSymbols, type SearchHit } from '../../core/yahoo';
import type { OpenTarget } from '../App';

const QUICK: OpenTarget[] = [
  { symbol: 'NIY=F', name: 'Japan 225 (vadeli)' },
  { symbol: 'USDJPY=X', name: 'USDJPY' },
  { symbol: 'XU100.IS', name: 'BIST 100' },
  { symbol: 'GC=F', name: 'Altın' },
  { symbol: 'USDTRY=X', name: 'USDTRY' },
  { symbol: '^NDX', name: 'Nasdaq 100' },
];

export function ExploreScreen({ onOpen }: { onOpen: (t: OpenTarget) => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      setHits(await searchSymbols(fetch, query));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="top">
        <h1>Keşfet</h1>
      </header>
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hisse, endeks, parite ara (ör. THYAO, Nikkei, EURUSD)"
          enterKeyHint="search"
        />
        <button className="btn" disabled={loading}>
          {loading ? '…' : 'Ara'}
        </button>
      </form>
      {error && <div className="notice err">Arama yapılamadı: {error}</div>}

      {hits === null ? (
        <>
          <h2>Hızlı erişim</h2>
          <div className="list">
            {QUICK.map((t) => (
              <button key={t.symbol} className="row" onClick={() => onOpen(t)}>
                <span className="grow">
                  <span className="title">{t.name}</span>
                  <span className="sub muted">{t.symbol}</span>
                </span>
                <span className="muted">›</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="list">
          {hits.map((h) => (
            <button key={h.symbol} className="row" onClick={() => onOpen({ symbol: h.symbol, name: h.name })}>
              <span className="grow">
                <span className="title">{h.name}</span>
                <span className="sub muted">
                  {h.symbol} · {h.exchange} {h.type && `· ${h.type}`}
                </span>
              </span>
              <span className="muted">›</span>
            </button>
          ))}
          {hits.length === 0 && <div className="empty">Sonuç bulunamadı.</div>}
        </div>
      )}
    </div>
  );
}
