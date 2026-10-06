import { Outlet } from "react-router-dom";
import Header from "./header.jsx";

export default function AppShell() {
  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>
    </>
  );
}