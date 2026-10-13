import { useLocation } from "react-router-dom";
import { Panel, RouteButton, ViewSection } from "../components/index.ts";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <ViewSection id="not-found" title="Page not found">
      <Panel>
        <p>
          There is no view at <code>{location.pathname}</code>.
        </p>
        <RouteButton label="Back to the dashboard" targetLocation="/dashboard" variant="primary" />
      </Panel>
    </ViewSection>
  );
}
