import { Card } from "../../components/index.ts";
import type { LocationRecord } from "../../../types/domain.ts";

export interface LocationCardProps {
  location: LocationRecord;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card kind="location">
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <ul>
        {location.contains.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
