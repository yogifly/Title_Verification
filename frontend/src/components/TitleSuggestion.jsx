import React, { useState } from "react";
import axios from "axios";


function TitleSuggestion() {
  const [inputTitle, setInputTitle] = useState("");
  const [topMatches, setTopMatches] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/verify", {
        title: inputTitle,
      });

      const matches = response.data.top_matches || [];


      setTopMatches(
        matches.map((match) => ({
          title: match[0],
          score: Math.round(match[1] * 10000) / 100,
        }))
      );
    } catch (error) {
      console.error("Error verifying title:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Check Similar Titles</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          placeholder="Enter title..."
          required
          style={{ padding: "0.5rem", marginRight: "1rem", width: "300px" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Search
        </button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        {topMatches.length > 0 && (
          <>

            <ul>
              {topMatches.map((match, index) => (
                <li key={index}>
                  <strong>{match.title}</strong> - Probability:{" "}
                  {match.score}%
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default TitleSuggestion;
