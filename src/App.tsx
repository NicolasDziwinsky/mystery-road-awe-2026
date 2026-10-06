import Header from "./header.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./views/dashboard.jsx";
import Evidence from "./views/evidence.jsx";
import PeopleLocations from "./views/peopleLocations.jsx";
import Timeline from "./views/timeline.jsx";
import Workspace from "./views/workspace.jsx";
import AppShell from "./appShell.jsx";



export default function App() {
    return (
        <BrowserRouter basename="/react">
        <Header />
            <Routes>
                <Route path="/react" element={<AppShell />} />
                    <Route index element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/evidence" element={<Evidence />} />
                    <Route path="/people-locations" element={<PeopleLocations />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/workspace" element={<Workspace />} />
            </Routes>
        </BrowserRouter>
    );
}
 