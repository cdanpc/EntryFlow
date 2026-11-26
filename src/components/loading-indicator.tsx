import { BrandLogo } from "@/components/brand-logo";

type LoadingProps = { label: string; description?: string };

export function LoadingIndicator({ label, description, size = "md" }: LoadingProps & { size?: "sm" | "md" | "lg" }) {
  return <div className={`ef-loader ef-loader--${size}`} role="status" aria-live="polite">
    <span className="ef-loader__glyph" aria-hidden="true"><BrandLogo /></span>
    <span className="ef-loader__text"><span className="ef-loader__title">{label}</span>{description && <span className="ef-loader__description">{description}</span>}</span>
  </div>;
}

export function PageLoading({ label = "Loading page…", description }: Partial<LoadingProps>) {
  return <div className="ef-page-loading"><LoadingIndicator label={label} description={description} size="lg" /></div>;
}

export function LoadingOverlay({ label, description }: LoadingProps) {
  return <div className="ef-overlay"><div className="ef-overlay__panel"><LoadingIndicator label={label} description={description} /></div></div>;
}

export function ButtonSpinner() { return <span className="ef-button-spinner" aria-hidden="true" />; }

export function EventCardSkeletons() {
  return <div role="status" aria-live="polite"><span className="sr-only">Loading events…</span><div className="event-grid" aria-hidden="true">{[0, 1, 2].map((index) => <div key={index} className="ef-skeleton-card"><div className="ef-skeleton-card__media ef-shimmer" /><div className="ef-skeleton-card__body"><div className="ef-skeleton-line ef-shimmer" style={{ width: "54%" }} /><div className="ef-skeleton-line ef-skeleton-line--large ef-shimmer" style={{ width: "90%" }} /><div className="ef-skeleton-line ef-shimmer" style={{ width: "67%" }} /><div className="ef-skeleton-pill ef-shimmer" style={{ width: "43%" }} /></div></div>)}</div></div>;
}

export function AttendeeRowsSkeleton({ label = "Loading attendees…" }: Partial<LoadingProps>) {
  return <div role="status" aria-live="polite"><span className="sr-only">{label}</span><div className="ef-skeleton-rows" aria-hidden="true">{[55, 43, 68, 48, 60].map((width, index) => <div className="ef-skeleton-row" key={index}><div className="ef-skeleton-row__name"><div className="ef-skeleton-line ef-shimmer" style={{ width: `${width}%` }} /></div><div className="ef-skeleton-pill ef-skeleton-row__status ef-shimmer" /></div>)}</div></div>;
}
