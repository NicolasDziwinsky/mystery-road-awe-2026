import {
  IntroCard,
  MiniListItem,
  Panel,
  StatCard,
  StatusBadge,
  ViewSection,
} from "../../components/index.ts";
import { state } from "../../../data.ts";
import { formatDate } from "../../../lookupHelpers.ts";
import { HowToItem } from "./HowToItem.tsx";

// Feature component: reads the shared state and derives the numbers.
// LoadingGate (app/) guarantees the data is loaded before this renders.
export default function DashboardPage() {
  const caseData = state.caseData ?? {
    title: "Case",
    status: "unknown",
    summary: "",
  };

  const reviewedCount = state.allEvidence.filter(
    (item) => String(item.status ?? "").toLowerCase() === "reviewed",
  ).length;

  const progressPct =
    state.allEvidence.length === 0
      ? 0
      : Math.round((reviewedCount / state.allEvidence.length) * 100);

  const recentEvidence = [...state.allEvidence].slice(-5).reverse();
  const recentTimeline = [...state.allTimeline].slice(-5).reverse();

  return (
    <ViewSection id="dashboard" title="Case Dashboard">
      <IntroCard
        title="How to use this portal"
        description="Everything gathered on the case so far is organised into four working views. Use the navigation bar at the top to move between them at any time."
      >
        <div className="howto-grid">
          <HowToItem
            number={1}
            title="Evidence Catalogue"
            description="Search, filter, and sort every evidence item. Open one for full details, related people and locations, and to add a private note."
            buttonLabel="Go to Evidence"
            targetLocation="/evidence"
          />
          <HowToItem
            number={2}
            title="People & Locations"
            description="Read profiles and statements from the six team members involved, and look up the six key locations in the investigation."
            buttonLabel="Go to People & Locations"
            targetLocation="/team/people"
          />
          <HowToItem
            number={3}
            title="Timeline"
            description="Walk through events in chronological order, filter by person, location, or type, and jump straight to the evidence behind any event."
            buttonLabel="Go to Timeline"
            targetLocation="/timeline"
          />
          <HowToItem
            number={4}
            title="Investigator Workspace"
            description="Your bookmarked evidence and notes collect here. Draft a hypothesis — who you suspect, why, and how confident you are — it's saved automatically in your browser."
            buttonLabel="Go to Workspace"
            targetLocation="/workspace"
          />
        </div>
      </IntroCard>

      <div id="dashboardContent">
        <div className="case-summary-card">
          <h3>{caseData.title}</h3>
          <p>
            <StatusBadge status={caseData.status ?? "unknown"} />
          </p>
          <p>{caseData.summary}</p>
        </div>

        <div className="stat-grid">
          <StatCard value={state.allEvidence.length} label="Evidence items" />
          <StatCard value={state.allPeople.length} label="People" />
          <StatCard value={state.allLocations.length} label="Locations" />
          <StatCard value={state.bookmarks.length} label="Bookmarked" />
          <StatCard value={reviewedCount} label="Reviewed" />
        </div>

        <Panel title="Review progress">
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${progressPct}%` }} />
          </div>
          <p>{progressPct}% of evidence reviewed</p>
        </Panel>

        <div className="dashboard-columns">
          <Panel title="Recent evidence">
            {recentEvidence.length === 0 ? (
              <p>No evidence loaded yet.</p>
            ) : (
              recentEvidence.map((item) => (
                <MiniListItem
                  key={item.id}
                  primary={item.id}
                  secondary={item.title}
                  badge={<StatusBadge status={item.status ?? "unreviewed"} />}
                />
              ))
            )}
          </Panel>

          <Panel title="Recent timeline events">
            {recentTimeline.length === 0 ? (
              <p>No timeline events loaded yet.</p>
            ) : (
              recentTimeline.map((event) => (
                <MiniListItem
                  key={event.id}
                  primary={formatDate(event.time)}
                  secondary={event.title}
                />
              ))
            )}
          </Panel>
        </div>
      </div>
    </ViewSection>
  );
}
