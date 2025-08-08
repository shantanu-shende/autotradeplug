// Mocked market data API service. Replace with real providers later (Alpha Vantage, Twelve Data).
export interface PricePoint { time: number; open: number; high: number; low: number; close: number; volume?: number }

export async function getIntradayMock(symbol: string): Promise<PricePoint[]> {
  // Simple synthetic walk for demo purposes
  const now = Date.now();
  let price = 100;
  const out: PricePoint[] = [];
  for (let i = 60; i >= 0; i--) {
    const t = now - i * 60_000;
    const drift = (Math.random() - 0.5) * 0.6;
    const o = price;
    const c = Math.max(1, o + drift);
    const h = Math.max(o, c) + Math.random();
    const l = Math.min(o, c) - Math.random();
    const v = 1000 + Math.random() * 500;
    price = c;
    out.push({ time: t, open: o, high: h, low: l, close: c, volume: v });
  }
  return new Promise((res) => setTimeout(() => res(out), 300));
}
