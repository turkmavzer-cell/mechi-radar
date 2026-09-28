import { useEffect, useRef, useState } from 'react';
import { searchSymbols, type SearchHit } from '../../core/yahoo';
import type { OpenTarget } from '../App';
import { yahooFetch } from '../lib/http';

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

  const seq = useRef(0);

  const search = async (query: string) => {
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await searchSymbols(yahooFetch, query);
      if (id === seq.current) setHits(res);
    } catch (err) {
      if (id === seq.current) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (id === seq.current) setLoading(false);
    }
  };

  // Yazarken otomatik ara (yazma bittikten 400 ms sonra); kutu boşalınca hızlı erişime dön.
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      seq.current++;
      setHits(null);
      setLoading(false);
      return;
    }
    const id = setTimeout(() => search(query), 400);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div>
      <header className="top">
        <h1>Keşfet</h1>
      </header>
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) search(q.trim());
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hisse, endeks, parite ara (ör. THYAO, Nikkei, EURUSD)"
          enterKeyHint="search"
        />
        {q ? (
          <button type="button" className="btn ghost-plain" onClick={() => setQ('')} aria-label="Temizle">
            {loading ? '…' : '✕'}
          </button>
        ) : null}
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
