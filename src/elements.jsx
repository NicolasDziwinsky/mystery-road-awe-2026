import { useNavigate } from "react-router-dom";

export function Button({ label }) {
  return (
    <button class="nav-btn">
      {label}
    </button>
  );
}

export function RouteButton({ label, targetLocation }) {
  const navigate = useNavigate();

  return (
    <button
      className="nav-btn"
      onClick={() => navigate(targetLocation)}
    >
      {label}
    </button>
  );
}