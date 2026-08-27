export function RiskBadge({ score, label = 'Risk' }: { score: number; label?: string }) {
  const level = score >= 70 ? 'high' : score >= 35 ? 'medium' : 'low';
  const colors = { low: 'bg-emerald-100 text-emerald-800 border-emerald-300', medium: 'bg-amber-100 text-amber-800 border-amber-300', high: 'bg-red-100 text-red-800 border-red-300' };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase ${colors[level]}`}>{label}: {level} ({Math.round(score)})</span>;
}
