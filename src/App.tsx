import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./app/AppShell.tsx";
import NotFoundPage from "./app/NotFoundPage.tsx";
import DashboardPage from "./features/dashboard/DashboardPage.tsx";
import EvidencePage from "./features/evidence/EvidencePage.tsx";
import TeamLayout from "./features/people-locations/TeamLayout.tsx";
import PeoplePage from "./features/people-locations/PeoplePage.tsx";
import PersonDetailPage from "./features/people-locations/PersonDetailPage.tsx";
import LocationsPage from "./features/people-locations/LocationsPage.tsx";
import TimelinePage from "./features/timeline/TimelinePage.tsx";
import KeyIndexDemo from "./features/timeline/KeyIndexDemo.tsx";
import WorkspacePage from "./features/workspace/WorkspacePage.tsx";

export default function App() {
  return (
    <BrowserRouter basename="/react">
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="team" element={<TeamLayout />}>
            <Route index element={<Navigate to="people" replace />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:personId" element={<PersonDetailPage />} />
            <Route path="locations" element={<LocationsPage />} />
          </Route>
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="timeline/key-demo" element={<KeyIndexDemo />} />
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
