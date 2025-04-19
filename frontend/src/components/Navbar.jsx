import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Title Verification</h2>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/title-checker">Title-Verification</Link></li>
        <li><Link to="/title-suggestions">Title-checker</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
