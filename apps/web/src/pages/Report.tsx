export interface ReportProps {
  modeled?: boolean;
  disclaimer?: string;
}

export function Report({ modeled = false, disclaimer }: ReportProps) {
  return (
    <section aria-label="Privacy report">
      {modeled && (
        <div role="alert" className="modeled-disclaimer">
          {disclaimer ?? 'This is a representative preview, not your real transaction -- connect a wallet for an exact analysis.'}
        </div>
      )}
      {/* TODO: Render ReportCard, DiffView, and RiskBadge here. */}
    </section>
  );
}
