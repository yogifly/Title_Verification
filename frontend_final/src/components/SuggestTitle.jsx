import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SuggestTitle.css";

function SuggestTitle() {
  const [abstract, setAbstract] = useState("");
  const [suggestedTitles, setSuggestedTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Trigger animation when titles are loaded
  useEffect(() => {
    if (suggestedTitles.length > 0) {
      setAnimateIn(true);
    }
  }, [suggestedTitles]);

  // Reset copy status after 2 seconds
  useEffect(() => {
    if (copied !== null) {
      const timeout = setTimeout(() => {
        setCopied(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleSuggest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestedTitles([]);
    setAnimateIn(false);

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

  const copyToClipboard = (title, index) => {
    navigator.clipboard.writeText(title);
    setCopied(index);
  };

  return (
    <div className="main-container">
      <div className="title-generator-card">
        <div className="title-header">
          <div className="sparkle-icon"></div>
          <h1>Generate Title from Abstract</h1>
        </div>

        <form onSubmit={handleSuggest}>
          <div className="textarea-container">
            <textarea
              placeholder="Enter your abstract or paper description..."
              rows="6"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              required
            ></textarea>
            <div className="character-count">{abstract.length} characters</div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            <span className="button-content">
              {loading ? (
                <>
                  <span className="loader-icon"></span>
                  <span>Generating magic...</span>
                </>
              ) : (
                <>
                  <span className="sparkle-button-icon"></span>
                  <span>Generate Titles</span>
                  <span className="arrow-icon"></span>
                </>
              )}
            </span>
          </button>
        </form>

        {loading && (
          <div className="loading-container">
            <div className="fancy-spinner">
              <div className="spinner-inner spinner-circle-1"></div>
              <div className="spinner-inner spinner-circle-2"></div>
            </div>
            <p className="loading-text">Creating brilliant titles...</p>
          </div>
        )}

        {suggestedTitles.length > 0 && (
          <div className={`suggestions-box ${animateIn ? 'animate-in' : ''}`}>
            <h3 className="suggestions-title">
              <span className="sparkle-icon small"></span>
              Suggested Titles:
            </h3>
            <ul className="suggestions-list">
              {suggestedTitles.map((title, index) => (
                <li key={index} className="suggestion-item" style={{ animationDelay: `${index * 150}ms` }}>
                  <span className="title-text">{title}</span>
                  <button 
                    onClick={() => copyToClipboard(title, index)}
                    className="copy-button"
                    title="Copy to clipboard"
                  >
                    {copied === index ? (
                      <span className="check-icon"></span>
                    ) : (
                      <span className="copy-icon"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="footer">
        Powered by AI Title Generator • Create compelling titles in seconds
      </div>
    </div>
  );
}

export default SuggestTitle;