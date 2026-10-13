import { Link } from "react-router-dom";
import { Card, StatusBadge } from "../../components/index.ts";
import type { PersonRecord } from "../../../types/domain.ts";
import { PersonAvatar } from "./PersonAvatar.tsx";

export interface PersonCardProps {
  person: PersonRecord;
  evidenceCount: number;
}

// Presentational: everything it shows comes in through props.
export function PersonCard({ person, evidenceCount }: PersonCardProps) {
  const evidenceLabel = `${evidenceCount} related evidence item${evidenceCount === 1 ? "" : "s"}`;

  return (
    <Card kind="person">
      <div className="person-card-header">
        <PersonAvatar src={person.avatar} name={person.name} />
        <div>
          <h3>
            <Link className="person-link" to={`/team/people/${person.id}`}>
              {person.name}
            </Link>
          </h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>
      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>
      <ul>
        {person.responsibilities.map((responsibility) => (
          <li key={responsibility}>{responsibility}</li>
        ))}
      </ul>
      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>
      <p>
        <StatusBadge status={evidenceLabel} variant={evidenceCount > 0 ? "relevant" : "unreviewed"} />
      </p>
    </Card>
  );
}
