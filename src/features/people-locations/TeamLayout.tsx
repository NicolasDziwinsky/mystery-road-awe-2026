import { Outlet } from "react-router-dom";
import { ViewSection } from "../../components/index.ts";
import { TeamTabs } from "./TeamTabs.tsx";

// Parent route for /team/*: heading + tabs stay, the tab content is the
// matched child route.
export default function TeamLayout() {
  return (
    <ViewSection id="people" title="People & Locations">
      <TeamTabs />
      <Outlet />
    </ViewSection>
  );
}
