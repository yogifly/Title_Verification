import React, { useState } from "react";
import axios from "axios";
import "./TitleSuggestion.css";

function TitleSuggestion() {
  const [inputTitle, setInputTitle] = useState("");
  const [topMatches, setTopMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
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
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="title-suggestion-container">
      <div className="title-suggestion-card">
        <div className="title-header">
          
          <p className="subtitle">Discover similar titles in our collection</p>
        </div>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-container">
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="Enter your title ..."
              required
              className="title-input"
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                <span>Explore</span>
              )}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="results-container">
          {topMatches.length > 0 ? (
            <>
              <h3 className="results-title">Similar Titles</h3>
              <div className="results-list">
                {topMatches.map((match, index) => (
                  <div 
                    key={index} 
                    className="result-item"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="result-content">
                      <span className="result-number">{index + 1}</span>
                      <span className="result-title">{match.title}</span>
                    </div>
                    <div className="similarity-indicator">
                      <div 
                        className="similarity-bar" 
                        style={{ width: `${match.score}%` }}
                      ></div>
                     
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : !isLoading && inputTitle.length > 0 ? (
            <div className="no-results">
              <p>No similar titles found</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TitleSuggestion;