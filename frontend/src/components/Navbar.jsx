import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Authentica.ai</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/title-checker">Title Verification</Link></li>
        <li><Link to="/title-suggestions">Title Checker</Link></li>
        <li><Link to="/suggest">Title Suggestions</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
