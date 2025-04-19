import React, { useState } from "react";
import axios from "axios";
import "../App.css"; // for styling

function SuggestTitle() {
  const [abstract, setAbstract] = useState("");
  const [suggestedTitles, setSuggestedTitles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestedTitles([]);

    try {
      const response = await axios.post("http://127.0.0.1:5000/suggest-title", {
        abstract: abstract,
      });

      if (response.data && response.data.titles) {
        setSuggestedTitles(response.data.titles);
      } else {
        setSuggestedTitles(["No title could be generated."]);
      }
    } catch (error) {
      console.error("Error suggesting title:", error);
      setSuggestedTitles(["Error generating title."]);
    }

    setLoading(false);
  };

  return (
    <div className="main-container">
      <h1>Generate Title from Abstract</h1>

      <form onSubmit={handleSuggest}>
        <textarea
          placeholder="Enter short abstract or description..."
          rows="6"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          required
        ></textarea>

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Suggest Title"}
        </button>
      </form>

      {suggestedTitles.length > 0 && (
        <div className="suggestions-box">
          <h3>Suggested Titles:</h3>
          <ul>
            {suggestedTitles.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SuggestTitle;
