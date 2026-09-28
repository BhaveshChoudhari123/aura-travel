import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <strong>Aura Travel</strong><span>Your AI-powered travel companion.</span>
        <span style={{ flex: 1 }} />
        <Link to="/explore">Explore</Link><Link to="/about">About</Link><Link to="/create-trip">Create Trip</Link>
      </div>
    </footer>
  );
}
