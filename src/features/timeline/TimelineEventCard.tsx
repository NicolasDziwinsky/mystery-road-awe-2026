import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/index.ts";
import { formatDate } from "../../../lookupHelpers.ts";
import type { PersonRecord, TimelineEvent } from "../../../types/domain.ts";
import { certaintyBadgeVariant } from "./certainty.ts";

export interface TimelineEventCardProps {
  event: TimelineEvent;
  people: PersonRecord[];
  locationNames: string[];
}

// Presentational: ids are already resolved to people / location names by the
// feature component, this only decides how they look.
export function TimelineEventCard({ event, people, locationNames }: TimelineEventCardProps) {
  const hasLocations = locationNames.length > 0;

  return (
    <div className={`timeline-event certainty-${event.certainty}`}>
      <div className="timeline-time">
        {formatDate(event.time)}&nbsp;&middot;&nbsp;
        <StatusBadge status={event.certainty} variant={certaintyBadgeVariant(event.certainty)} />
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>

      {hasLocations && <p className="evidence-meta">Location: {locationNames.join(", ")}</p>}

      {people.map((person) => (
        <Link key={person.id} className="evidence-link-btn" to={`/team/people/${person.id}`}>
          {person.name}
        </Link>
      ))}
      {event.evidenceIds.map((evidenceId) => (
        <span key={evidenceId} className="evidence-link-btn">
          {evidenceId}
        </span>
      ))}
    </div>
  );
}
