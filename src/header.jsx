import { RouteButton } from "./elements.jsx";

export default function Header() {
  return (
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
            <img class="brand-logo" src="/src/assets/logo.svg" alt="Logo" /> 
            <div>
                <h1>Project ReMotion</h1>
                <p class="subtitle">Investigate the failure of an AI-assisted rehabilitation robot.</p>
            </div>
        </div>
        <nav class="main-nav" aria-label="Main navigation">
            <RouteButton label="Dashboard" targetLocation="/dashboard" />
            <RouteButton label="Evidence" targetLocation="/evidence" />
            <RouteButton label="People & Locations" targetLocation="/people-locations" />
            <RouteButton label="Timeline" targetLocation="/timeline" />
            <RouteButton label="Workspace" targetLocation="/workspace" />
        </nav>
      </div>
    </header>
  );
}