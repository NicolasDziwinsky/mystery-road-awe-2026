import { Outlet } from "react-router-dom";
import Header from "./header.jsx";

export default function AppShell() {
  return (
    <>
      <Header />

      <main id="app" className="app-main">
        <section id="view-dashboard" className="view active"> 
          <Outlet />
        </section>
      </main>
    </>
  );
}