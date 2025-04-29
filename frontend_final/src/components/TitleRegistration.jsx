import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./TitleRegistration.css";

const stateShortMap = {
  Maharashtra: "MUM",
  Gujarat: "GUJ",
  Delhi: "DEL",
  Karnataka: "KAR",
  TamilNadu: "TN",
  Rajasthan: "RAJ",
};

const languageCodeMap = {
  English: "ENG",
  Hindi: "HIN",
  Marathi: "MAR",
};

const COLORS = ["#00C49F", "#FF8042"];

function TitleRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title = "", verificationProbability = 0 } = location.state || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleCode, setTitleCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: title,
    ownerName: "",
    state: "",
    publicationDistrict: "",
    language: "",
  });

  const generateTitleCode = () => {
    const stateCode = stateShortMap[formData.state] || "UNK";
    const langCode = languageCodeMap[formData.language] || "UNK";
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    return `${stateCode}${langCode}${randomCode}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const generatedCode = generateTitleCode();
    setTitleCode(generatedCode);
    
    try {
      await addDoc(collection(db, "titles"), {
        title: formData.title,
        titleCode: generatedCode,
        ownerName: formData.ownerName,
        state: formData.state,
        language: formData.language,
        publicationDistrict: formData.publicationDistrict,
        registeredAt: new Date().toISOString(),
        verificationProbability: verificationProbability
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/title-checker");
      }, 3000);
    } catch (err) {
      console.error("Error registering title:", err);
      setIsSubmitting(false);
      alert("Failed to register title.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const pieData = [
    {
      name: "Similar",
      value: verificationProbability,
    },
    {
      name: "Unique",
      value: 100 - verificationProbability,
    },
  ];

  if (showSuccess) {
    return (
      <div className="registration-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Registration Complete</h2>
          <p>Your title has been successfully registered</p>
          <div className="title-code">
            <span>Title Code:</span>
            <strong>{titleCode}</strong>
          </div>
          <p className="redirect-message">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h1>Title Registration</h1>
          <p className="subtitle">Complete the details below to register your title</p>
        </div>
        
        <div className="registration-content">
          <div className="registration-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <div className="readonly-field-container">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    readOnly
                    className="readonly-field"
                  />
                  <div className="lock-icon">🔒</div>
                </div>
              </div>

              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Enter owner's full name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>State</label>
                  <div className="select-wrapper">
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select State</option>
                      {Object.keys(stateShortMap).map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group half">
                  <label>Language</label>
                  <div className="select-wrapper">
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Language</option>
                      {Object.keys(languageCodeMap).map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Publication District</label>
                <input
                  type="text"
                  name="publicationDistrict"
                  placeholder="Enter publication district"
                  value={formData.publicationDistrict}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="button-group">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => navigate("/title-checker")}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="register-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="button-loader"></span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="verification-info">
            <div className="chart-container">
              <h3>Title Uniqueness</h3>
              <PieChart width={220} height={220}>
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
              
              <div className="uniqueness-score">
                <span>Uniqueness Score:</span>
                <div className="score-value">
                  {(100 - verificationProbability).toFixed(0)}%
                </div>
              </div>
            </div>
            
            <div className="registration-info">
              <div className="info-item">
                <div className="info-icon">ℹ️</div>
                <p>Registering this title will provide you with legal protection for your intellectual property.</p>
              </div>
              <div className="info-item">
                <div className="info-icon">⚠️</div>
                <p>Please ensure all details are accurate. Title registration cannot be modified after submission.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TitleRegistration;