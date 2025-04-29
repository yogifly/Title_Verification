import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TitleChecker from "./components/TitleChecker";
import TitleSuggestion from "./components/TitleSuggestion";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import SuggestTitle from "./components/SuggestTitle";
import TitleRegistration from "./components/TitleRegistration";

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ overflowX: "hidden" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/title-checker" element={<TitleChecker />} />
          <Route path="/title-suggestions" element={<TitleSuggestion />} />
          <Route path="/suggest" element={<SuggestTitle />} />
          <Route path="/register" element={<TitleRegistration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
