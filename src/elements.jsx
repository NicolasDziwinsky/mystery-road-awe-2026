import { useNavigate } from "react-router-dom";

export function Button({
  label,
  variant = "secondary",
  size = "medium",
  type = "button",
  className = "",
  onClick,
  ...props
}) {
  const classes = [
    "btn",
    variant ? `btn-${variant}` : "",
    size === "small" ? "btn-small" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} onClick={onClick} {...props}>
      {label}
    </button>
  );
}

export function RouteButton({
  label,
  targetLocation,
  variant = "secondary",
  size = "medium",
  className = "",
  ...props
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={[
        "btn",
        `btn-${variant}`,
        size === "small" ? "btn-small" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => navigate(targetLocation)}
      {...props}
    >
      {label}
    </button>
  );
}

export function IntroCard({ title, description, children }) {
  return (
    <div className="intro-card">
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}

export function NormalText({ children, className = "" }) {
  return <p className={className}>{children}</p>;
}

export function H2Text({ children }) {
  return <h2>{children}</h2>;
}

export function HowToItem({
  number,
  title,
  description,
  buttonLabel,
  targetLocation,
}) {
  return (
    <div className="howto-item">
      <h4>
        {number}. {title}
      </h4>
      <p>{description}</p>
      {buttonLabel && targetLocation ? (
        <RouteButton
          label={buttonLabel}
          targetLocation={targetLocation}
          variant="secondary"
          size="small"
        />
      ) : null}
    </div>
  );
}

export function StatCard({ value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status ?? "unreviewed").toLowerCase();
  const statusClass = {
    critical: "badge-critical",
    reviewed: "badge-reviewed",
    flagged: "badge-flagged",
    relevant: "badge-relevant",
    irrelevant: "badge-unreviewed",
    unknown: "badge-unreviewed",
    unreviewed: "badge-unreviewed",
  }[normalized] || "badge-unreviewed";

  return <span className={`badge ${statusClass}`}>{status}</span>;
}

export function Panel({ title, children, className = "" }) {
  return (
    <div className={`dashboard-panel ${className}`.trim()}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </div>
  );
}

export function MiniListItem({ primary, secondary, badge }) {
  return (
    <div className="mini-list-item">
      <strong>{primary}</strong>
      {secondary ? (
        <>
          <br />
          {secondary}
        </>
      ) : null}
      {badge ? <div>{badge}</div> : null}
    </div>
  );
}

