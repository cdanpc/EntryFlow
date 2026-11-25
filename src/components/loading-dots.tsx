export function LoadingDots({ label = "Loading" }: { label?: string }) {
  return <div className="loading-dots-overlay" role="status" aria-live="polite"><span className="sr-only">{label}</span><span className="loading-dots" aria-hidden="true"><span /><span /><span /></span></div>;
}
