import { useState } from 'react';
import { INDICATOR_GROUPS, INDICATORS, STRATEGY_KIT } from './indicators';

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
  /** Verilen indikatörlerin hepsini ekler. */
  onAddAll: (ids: string[]) => void;
  onClose: () => void;
}

/** Alttan açılan hazır indikatör listesi. EMA/SMA grupları açılır liste, dilediğin kadar periyot seçilir. */
export function IndicatorPicker({ selected, onToggle, onAddAll, onClose }: Props) {
  const [open, setOpen] = useState<string | null>('EMA');
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="İndikatör ekle" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <b>İndikatör ekle</b>
          <button className="btn small" onClick={onClose}>
            Tamam
          </button>
        </div>
        <div className="sheet-body">
          {INDICATOR_GROUPS.map((g) => {
            const items = INDICATORS.filter((d) => d.group === g);
            if (items[0]?.option) {
              const count = items.filter((d) => selected.includes(d.id)).length;
              const isOpen = open === g;
              return (
                <div key={g} className="pick-group">
                  <button className="pick-row" onClick={() => setOpen(isOpen ? null : g)} aria-expanded={isOpen}>
                    <span className="grow">{g}</span>
                    {count > 0 && <span className="muted small">{count} seçili</span>}
                    <span className="muted">{isOpen ? '▴' : '▾'}</span>
                  </button>
                  {isOpen && (
                    <div className="pick-opts">
                      {items.map((d) => (
                        <button key={d.id} className={selected.includes(d.id) ? 'on' : ''} onClick={() => onToggle(d.id)}>
                          <i style={{ background: d.color }} />
                          {d.option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={g} className="pick-group">
                <div className="pick-title">
                  {g}
                  {g === 'Stokastik-RSI-ATR' && STRATEGY_KIT.some((id) => !selected.includes(id)) && (
                    <button className="pick-all" onClick={() => onAddAll(STRATEGY_KIT)}>
                      Hepsini ekle
                    </button>
                  )}
                </div>
                {items.map((d) => {
                  const on = selected.includes(d.id);
                  return (
                    <button key={d.id} className={`pick-row ${on ? 'on' : ''}`} onClick={() => onToggle(d.id)}>
                      <i style={{ background: d.color }} />
                      <span className="grow">{d.label}</span>
                      <span className="check">{on ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
