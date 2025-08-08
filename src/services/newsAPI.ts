// Mocked news API service. Replace with NewsAPI / custom backend later.
export interface NewsArticle { id: string; title: string; tag?: string; timestamp: string; source?: string; sentiment?: "positive" | "neutral" | "negative" }

export async function getNewsMock(query: string): Promise<NewsArticle[]> {
  const base: NewsArticle[] = [
    { id: "1", title: `${query}: Large block deal spotted intraday`, tag: "Update", timestamp: "1m ago", source: "ET", sentiment: "neutral" },
    { id: "2", title: `${query}: Analyst upgrades outlook to Buy`, tag: "Macro", timestamp: "8m ago", source: "Reuters", sentiment: "positive" },
    { id: "3", title: `${query}: Options IV spikes across near strikes`, tag: "Derivatives", timestamp: "15m ago", source: "Bloomberg", sentiment: "negative" },
  ];
  return new Promise((res) => setTimeout(() => res(base), 400));
}
