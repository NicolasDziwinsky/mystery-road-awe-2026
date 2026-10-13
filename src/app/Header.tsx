import { NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Evidence", to: "/evidence" },
  { label: "People & Locations", to: "/team" },
  { label: "Timeline", to: "/timeline" },
  { label: "Workspace", to: "/workspace" },
];

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img className="brand-logo" src={logo} alt="Logo" />
          <div>
            <h1>Project ReMotion</h1>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
