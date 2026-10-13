import { state } from "../../../data.ts";
import { evidenceMentionsPerson } from "../../../lookupHelpers.ts";
import type { PersonRecord } from "../../../types/domain.ts";
import { PersonList, type PersonListItem } from "./PersonList.tsx";

function countEvidenceForPerson(person: PersonRecord): number {
  return state.allEvidence.filter((item) => evidenceMentionsPerson(item, person)).length;
}

// Feature component: knows where the data lives and derives the counts,
// then hands plain props to the presentational list.
export default function PeoplePage() {
  const items: PersonListItem[] = state.allPeople.map((person) => ({
    person,
    evidenceCount: countEvidenceForPerson(person),
  }));

  return <PersonList items={items} />;
}
