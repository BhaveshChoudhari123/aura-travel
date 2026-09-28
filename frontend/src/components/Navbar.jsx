import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="logo" to="/"><span className="logo-mark"><Compass size={20} /></span>Aura&nbsp;Travel</Link>
        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/planner">Planner</NavLink>
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/recent">My Recent Trips</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <span className="nav-sp" />
        <Link className="btn btn-sm nav-cta" to="/planner">Plan My Trip</Link>
        <button className="icon-btn burger" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {open && (
        <nav className="mobile-menu">
          {[["/", "Home"], ["/planner", "Planner"], ["/explore", "Explore"], ["/recent", "My Recent Trips"], ["/about", "About"]].map(([to, t]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}>{t}</Link>
          ))}
          <Link to="/planner" className="btn" onClick={() => setOpen(false)}>Plan My Trip</Link>
        </nav>
      )}
    </header>
  );
}
