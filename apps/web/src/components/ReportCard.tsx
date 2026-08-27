import type { PrivacyReport } from '@preflight/scoring';
import { DiffView } from './DiffView';
import { RiskBadge } from './RiskBadge';

export function ReportCard({ report }: { report: PrivacyReport }) {
  const combined = Math.round((report.correlation.score + report.linkability.score) / 2);
  return <article className="mt-8 space-y-6 rounded-lg border border-[#cbd8cc] bg-white/85 p-5 shadow-lg md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Privacy report</h2><RiskBadge score={combined} label="Overall" /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-[#eef5ed] p-5"><p className="text-sm uppercase text-[#53665a]">Anonymity set · 24h</p><p className="mt-2 text-4xl font-bold">{report.anonymitySet.within24h}</p></div><div className="rounded-lg bg-[#e3eee8] p-5"><p className="text-sm uppercase text-[#53665a]">Anonymity set · 7d</p><p className="mt-2 text-4xl font-bold">{report.anonymitySet.within7d}</p></div></div>
    <section><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-bold">Correlation</h3><RiskBadge score={report.correlation.score} /></div><ul className="mt-3 space-y-2 text-sm">{report.correlation.reasons.map(reason => <li key={reason.code}><strong>{reason.code}:</strong> {reason.reasoning}</li>)}{report.correlation.reasons.length === 0 && <li className="text-[#53665a]">No significant correlation signals detected.</li>}</ul></section>
    <section><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-bold">Linkability</h3><RiskBadge score={report.linkability.score} /></div><ul className="mt-3 space-y-2 text-sm">{report.linkability.reasons.map(reason => <li key={reason}>{reason}</li>)}{report.linkability.reasons.length === 0 && <li className="text-[#53665a]">No address-linkability flags detected.</li>}</ul></section>
    <DiffView diff={report.diff} />
  </article>;
}
