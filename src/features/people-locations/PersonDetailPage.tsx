import { useParams } from "react-router-dom";
import { Panel, RouteButton } from "../../components/index.ts";
import { state } from "../../../data.ts";
import { evidenceMentionsPerson, findPersonById } from "../../../lookupHelpers.ts";
import { PersonCard } from "./PersonCard.tsx";

export default function PersonDetailPage() {
  // useParams types every param as string | undefined.
  const { personId } = useParams<{ personId: string }>();
  const person = personId ? findPersonById(personId) : null;

  // Early return: an id that matches nobody gets its own message instead of
  // crashing on person.name below.
  if (!person) {
    return (
      <Panel title="Person not found">
        <p>
          Nobody with the id <code>{personId}</code> is part of this investigation.
        </p>
        <RouteButton label="Back to all people" targetLocation="/team/people" size="small" />
      </Panel>
    );
  }

  const evidenceCount = state.allEvidence.filter((item) =>
    evidenceMentionsPerson(item, person),
  ).length;

  return (
    <>
      <p>
        <RouteButton label="← All people" targetLocation="/team/people" size="small" />{" "}
        <RouteButton
          label={`See ${person.name} on the timeline`}
          targetLocation={`/timeline?person=${encodeURIComponent(person.id)}`}
          variant="primary"
          size="small"
        />
      </p>
      <PersonCard person={person} evidenceCount={evidenceCount} />
    </>
  );
}
