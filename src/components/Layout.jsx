import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/library", label: "Library" },
  { to: "/groups", label: "Groups" },
  { to: "/chat", label: "Chat" },
];

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/library" className="brand">
            <span className="brand-mark">K</span>
            <span className="brand-name">Knowledge Hub</span>
          </NavLink>
          <nav className="nav" aria-label="Primary">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " nav-link-active" : "")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
