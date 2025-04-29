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
    const generatedCode = generateTitleCode();
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
      alert("Title registered successfully!");
      navigate("/title-checker");
    } catch (err) {
      console.error("Error registering title:", err);
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

  return (
    <div className="registration-container">
      <h1>Register Your Title</h1>
      
      <div className="registration-details">
        <div className="left-registration">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label>Owner Name</label>
              <input
                type="text"
                name="ownerName"
                placeholder="Owner Name"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>State</label>
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

            <div className="form-group">
              <label>Language</label>
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

            <div className="form-group">
              <label>Publication District</label>
              <input
                type="text"
                name="publicationDistrict"
                placeholder="Publication District"
                value={formData.publicationDistrict}
                onChange={handleChange}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="register-button">Complete Registration</button>
              <button type="button" className="cancel-button" onClick={() => navigate("/title-checker")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        <div className="right-registration">
          <div className="verification-info">
            <h3>Title Uniqueness Score</h3>
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
        </div>
      </div>
    </div>
  );
}

export default TitleRegistration;