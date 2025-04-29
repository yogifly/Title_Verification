import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import "./TitleChecker.css";

const COLORS = ["#00C49F", "#FF8042"];

function TitleChecker() {
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [constraintResults, setConstraintResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle animation sequence for constraint checks
  useEffect(() => {
    if (showModal && constraintResults.length > 0 && !isLoading) {
      if (animationStep < constraintResults.length) {
        const timer = setTimeout(() => {
          setAnimationStep(prev => prev + 1);
        }, 800); // Time between each constraint animation
        return () => clearTimeout(timer);
      } else {
        // After all constraints are animated, show final result
        const timer = setTimeout(() => {
          setShowModal(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [showModal, animationStep, constraintResults.length, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setShowModal(true);
    setAnimationStep(0);
    setConstraintResults([]);
    setIsLoading(true);
    
    try {
      const response = await axios.post("http://127.0.0.1:5000/verify", {
        title,
      });
      
      // Store the result first
      setResult(response.data);
      
      // Then prepare constraint results for animation
      if (response.data.constraint_status) {
        setConstraintResults([
          { 
            label: "Guidelines Enforcement", 
            passed: response.data.constraint_status.guideline_check 
          },
          { 
            label: "Prefix/Suffix Handling", 
            passed: response.data.constraint_status.prefix_suffix_check 
          },
          { 
            label: "Similarity Check", 
            passed: response.data.constraint_status.similarity_check 
          }
        ]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error verifying title:", error);
      setShowModal(false);
      setIsLoading(false);
    }
  };

  const renderConstraint = (label, passed) => (
    <div className={`constraint ${passed ? "pass" : "fail"}`}>
      <input type="checkbox" checked={passed} readOnly />
      <span>{label}</span>
    </div>
  );

  const handleRegisterClick = () => {
    navigate("/register", { 
      state: { 
        title: title, 
        verificationProbability: result?.verification_probability 
      } 
    });
  };

  const pieData = result?.verification_probability
    ? [
        {
          name: "Similar",
          value: result.verification_probability,
        },
        {
          name: "Unique",
          value: 100 - result.verification_probability,
        },
      ]
    : [];
    const COLORS = ['#00C49F', '#FF6B6B'];
 // "Similar" = greenish, "Unique" = orange

    <PieChart width={300} height={300}>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {pieData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  return (
    <div className="main-container">
      <h1>Title Verification System</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Title"
          required
        />
        <button type="submit" id="verify-btn">Verify Title</button>
      </form>

      {/* Animated Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Verifying Title...</h2>
            
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <div className="constraints-animation">
                  {constraintResults.map((constraint, index) => (
                    <div 
                      key={index} 
                      className={`constraint-item ${index < animationStep ? (constraint.passed ? "pass" : "fail") : ""} ${index === animationStep - 1 ? "animate" : ""}`}
                    >
                      <div className="checkbox-container">
                        {index < animationStep && (
                          <div className="checkmark">
                            {constraint.passed ? "✓" : "✗"}
                          </div>
                        )}
                      </div>
                      <span>{constraint.label}</span>
                    </div>
                  ))}
                </div>
                
                {result && animationStep >= constraintResults.length && (
                  <div className="result-animation">
                    <h3 className={result.status === "Accepted" ? "accepted" : "rejected"}>
                      {result.status}
                    </h3>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Results (shown after animation) */}
      {result && !showModal && (
        <div className="two-column">
          {/* Left Column */}
          <div className="left-column">
            <h2>Result: {result.status}</h2>

            {result.constraint_status && (
              <div className="constraints-box">
                <h3>Constraint Checks</h3>
                {renderConstraint("Guidelines Enforcement", result.constraint_status.guideline_check)}
                {renderConstraint("Prefix/Suffix Handling", result.constraint_status.prefix_suffix_check)}
                {renderConstraint("Similarity Check", result.constraint_status.similarity_check)}
              </div>
            )}

            {result.status === "Rejected" && (
              <>
                <p className="reason"><strong>Reason:</strong> {result.reason}</p>
                {result.similarity_score && (
                  <p><strong>Similarity Score:</strong> {`${(result.similarity_score * 100).toFixed(2)}%`}</p>
                )}
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="right-column">
            {pieData.length > 0 && (
              <div className="chart-box">
                <h3>Verification Probability</h3>
                <PieChart width={250} height={250}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            )}

            {result?.status === "Accepted" && (
              <div className="register-button-container">
                <button className="register-button" onClick={handleRegisterClick}>
                  Register Title
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TitleChecker;