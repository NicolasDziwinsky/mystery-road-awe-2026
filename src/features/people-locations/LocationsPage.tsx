import { state } from "../../../data.ts";
import { LocationCard } from "./LocationCard.tsx";

export default function LocationsPage() {
  return (
    <div className="locations-grid">
      {state.allLocations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  );
}
