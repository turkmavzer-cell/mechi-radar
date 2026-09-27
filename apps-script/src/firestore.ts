// Firestore REST API için değer dönüştürme (JS nesnesi <-> Firestore "Value" biçimi).

export type FsValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

export function toValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  switch (typeof v) {
    case 'boolean':
      return { booleanValue: v };
    case 'number':
      if (!Number.isFinite(v)) return { nullValue: null };
      return Number.isInteger(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER ? { integerValue: String(v) } : { doubleValue: v };
    case 'string':
      return { stringValue: v };
    case 'object':
      return { mapValue: { fields: toFields(v as Record<string, unknown>) } };
    default:
      return { nullValue: null };
  }
}

export function toFields(o: Record<string, unknown>): Record<string, FsValue> {
  const out: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = toValue(v);
  return out;
}

export function fromValue(v: FsValue): unknown {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(fromValue);
  if ('mapValue' in v) return fromFields(v.mapValue.fields ?? {});
  return null;
}

export function fromFields(f: Record<string, FsValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) out[k] = fromValue(v);
  return out;
}
