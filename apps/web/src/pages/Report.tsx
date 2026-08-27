import type { PrivacyReport } from '@preflight/scoring';
import { ReportCard } from '../components/ReportCard';

export interface ReportResponse extends PrivacyReport { modeled?: boolean; disclaimer?: string }
export function Report({ report }: { report?: ReportResponse }) { if (!report) return null; return <section aria-label="Privacy report">{report.modeled && <div role="alert" className="modeled-disclaimer">{report.disclaimer ?? 'This is a representative preview, not your real transaction shape. Connect a wallet for an exact analysis.'}</div>}<ReportCard report={report} /></section>; }
