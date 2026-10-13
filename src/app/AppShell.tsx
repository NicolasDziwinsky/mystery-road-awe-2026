import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";
import { LoadingGate } from "./LoadingGate.tsx";

export default function AppShell() {
  return (
    <>
      <Header />

      <main id="app" className="app-main">
        <LoadingGate>
          <Outlet />
        </LoadingGate>
      </main>
    </>
  );
}
