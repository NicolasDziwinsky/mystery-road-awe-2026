import type { PersonRecord, TimelineEvent } from "../../../types/domain.ts";
import { TimelineEventCard } from "./TimelineEventCard.tsx";

export interface TimelineListItem {
  event: TimelineEvent;
  people: PersonRecord[];
  locationNames: string[];
}

export interface TimelineListProps {
  items: TimelineListItem[];
}

export function TimelineList({ items }: TimelineListProps) {
  return (
    <div className="timeline-container">
      {items.length === 0 ? (
        <p>No timeline events match the current filters.</p>
      ) : (
        items.map((item) => (
          <TimelineEventCard
            key={item.event.id}
            event={item.event}
            people={item.people}
            locationNames={item.locationNames}
          />
        ))
      )}
    </div>
  );
}
