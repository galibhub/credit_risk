import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "../common/Logo";

const links = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Insights", href: "/#insights" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        <nav
          className={`navbar-links ${open ? "navbar-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a key={link.label} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}

          <div className="mobile-navbar-actions">
            <Link to="/login" className="btn btn-outline" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/register" className="btn btn-accent" onClick={closeMenu}>
              Sign up <ArrowRight size={15} />
            </Link>
          </div>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
          <Link to="/register" className="btn btn-accent">
            Sign up <ArrowRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}