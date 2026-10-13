import type { PersonRecord } from "../../../types/domain.ts";
import { PersonCard } from "./PersonCard.tsx";

export interface PersonListItem {
  person: PersonRecord;
  evidenceCount: number;
}

export interface PersonListProps {
  items: PersonListItem[];
}

export function PersonList({ items }: PersonListProps) {
  return (
    <div className="people-grid">
      {items.map(({ person, evidenceCount }) => (
        <PersonCard key={person.id} person={person} evidenceCount={evidenceCount} />
      ))}
    </div>
  );
}
