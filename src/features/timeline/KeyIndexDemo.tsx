import { Link, useSearchParams } from "react-router-dom";
import { Panel, ViewSection } from "../../components/index.ts";
import { state } from "../../../data.ts";

// THROWAWAY demo for Exercise 4 / Demo 4 (key={index} vs key={id}).
// Type a note into the first row, then click "Reverse order".
// With keys=index the note stays in row 1 (now a different event).
// With keys=id the note travels with its event to the bottom.
// Order and key mode live in the URL, so no useState is needed.
export default function KeyIndexDemo() {
  const [searchParams] = useSearchParams();
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const keyMode = searchParams.get("keys") === "id" ? "id" : "index";

  const events = [...state.allTimeline].slice(0, 5);
  if (order === "desc") events.reverse();

  const otherOrder = order === "asc" ? "desc" : "asc";
  const otherKeys = keyMode === "index" ? "id" : "index";

  return (
    <ViewSection id="key-demo" title="Key demo (throwaway)">
      <Panel title={`Currently using key=${keyMode === "index" ? "{index}" : "{event.id}"}`}>
        <p>
          <Link to={`?order=${otherOrder}&keys=${keyMode}`}>Reverse order</Link>
          {" · "}
          <Link to={`?order=asc&keys=${otherKeys}`}>Switch to key={otherKeys}</Link>
        </p>
        {events.map((event, index) => (
          <div key={keyMode === "index" ? index : event.id} className="key-demo-row">
            <strong>{event.id}</strong>
            <span>{event.title}</span>
            <input type="text" placeholder="note…" defaultValue="" />
          </div>
        ))}
      </Panel>
    </ViewSection>
  );
}
