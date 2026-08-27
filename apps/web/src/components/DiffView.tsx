import type { Strk20Diff } from '@preflight/scoring';

function FieldList({ fields, protectedView }: { fields: string[]; protectedView?: boolean }) {
  return <ul className="space-y-2">{fields.map(field => <li key={field} className="flex items-center gap-2 text-sm"><span className={protectedView ? 'text-emerald-600' : 'text-orange-600'}>●</span><span>{field}</span></li>)}</ul>;
}

export function DiffView({ diff }: { diff: Strk20Diff }) {
  return <section className="mt-6"><h3 className="text-lg font-bold">Public exposure comparison</h3><div className="mt-3 grid gap-4 md:grid-cols-2"><div className="rounded-lg border border-orange-200 bg-orange-50 p-4"><h4 className="mb-3 font-bold text-orange-900">Plain public call</h4><FieldList fields={diff.plainCallVisible} /></div><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><h4 className="mb-3 font-bold text-emerald-900">Through STRK20</h4><FieldList fields={diff.strk20Visible} protectedView /></div></div></section>;
}
