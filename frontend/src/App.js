import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TitleChecker from "./components/TitleChecker";
import TitleSuggestion from "./components/TitleSuggestion";
import Home from "./components/Home";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Navbar />
        <div style={{ marginLeft: "220px", padding: "2rem", width: "100%" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/title-checker" element={<TitleChecker />} />
            <Route path="/title-suggestions" element={<TitleSuggestion />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
