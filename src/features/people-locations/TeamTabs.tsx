import { NavLink } from "react-router-dom";

function tabClass({ isActive }: { isActive: boolean }): string {
  return isActive ? "tab-btn active" : "tab-btn";
}

// The tabs are real links now: the active tab is derived from the URL,
// not from a currentPeopleTab variable.
export function TeamTabs() {
  return (
    <div className="tab-bar">
      <NavLink to="/team/people" className={tabClass}>
        People
      </NavLink>
      <NavLink to="/team/locations" className={tabClass}>
        Locations
      </NavLink>
    </div>
  );
}
