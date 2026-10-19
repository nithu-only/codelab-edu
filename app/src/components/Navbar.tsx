import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTheme, setTheme, type Theme } from "../lib/storage";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/ide", label: "IDE" },
  { to: "/learn", label: "Learn" },
  { to: "/saved", label: "Saved" },
];

export default function Navbar() {
  const [theme, setThemeState] = useState<Theme>(getTheme());
  const location = useLocation();

  useEffect(() => {
    setThemeState(getTheme());
  }, [location.pathname]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">{"</>"}</span>
          <span className="brand-text">CodeLab Edu</span>
        </NavLink>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-spacer" />
        <button
          type="button"
          className="theme-toggle"
          onClick={toggle}
          aria-label="Toggle color theme"
          title="Switch between dark and light theme"
        >
          {theme === "dark" ? "☾ Dark" : "☀ Light"}
        </button>
      </div>
    </header>
  );
}
