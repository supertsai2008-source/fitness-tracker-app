export const toISODate = (d: Date) => d.toISOString().split("T")[0];
export const addDays = (d: Date, days: number) => {
  const nd = new Date(d); nd.setDate(nd.getDate() + days); return nd;
};

export const buildDateList = (days: number, end: Date = new Date()) => {
  const list: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    list.push(addDays(end, -i));
  }
  return list;
};

export interface SeriesPoint { x: string | number; y: number; label?: string }

export const aggregateToWeeks = (daily: SeriesPoint[]): SeriesPoint[] => {
  if (daily.length === 0) return [];
  const chunks: SeriesPoint[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const slice = daily.slice(i, i + 7);
    const y = Math.round(slice.reduce((s, p) => s + p.y, 0) / slice.length);
    const label = `W${Math.floor(i / 7) + 1}`;
    chunks.push({ x: label, y, label });
  }
  return chunks;
};

export const shortTW = (d: Date) => d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
