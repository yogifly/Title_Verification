import React, { useState } from "react";
import axios from "axios";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "../App.css";

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

function App() {
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: "",
    state: "",
    publicationDistrict: "",
    language: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    try {
      const response = await axios.post("http://127.0.0.1:5000/verify", {
        title,
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error verifying title:", error);
    }
  };

  const renderConstraint = (label, passed) => (
    <div className={`constraint ${passed ? "pass" : "fail"}`}>
      <input type="checkbox" checked={passed} readOnly />
      <span>{label}</span>
    </div>
  );

  const generateTitleCode = () => {
    const stateCode = stateShortMap[formData.state] || "UNK";
    const langCode = languageCodeMap[formData.language] || "UNK";
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    return `${stateCode}${langCode}${randomCode}`;
  };

  const handleRegister = async () => {
    const generatedCode = generateTitleCode();
    try {
      await addDoc(collection(db, "titles"), {
        title,
        titleCode: generatedCode,
        ownerName: formData.ownerName,
        state: formData.state,
        language: formData.language,
        publicationDistrict: formData.publicationDistrict,
        registeredAt: new Date().toISOString(),
      });
      alert("Title registered successfully!");
      setFormData({ ownerName: "", state: "", publicationDistrict: "", language: "" });
      setTitle("");
      setResult(null);
    } catch (err) {
      console.error("Error registering title:", err);
      alert("Failed to register title.");
    }
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
        <button type="submit">Verify Title</button>
      </form>

      {result && (
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

            {result.status === "Accepted" && (
              <div className="register-box">
                <h3>Register Accepted Title</h3>

                <input
                  type="text"
                  placeholder="Owner Name"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />

                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                >
                  <option value="">Select State</option>
                  {Object.keys(stateShortMap).map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>

                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  required
                >
                  <option value="">Select Language</option>
                  {Object.keys(languageCodeMap).map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Publication State/District"
                  value={formData.publicationDistrict}
                  onChange={(e) => setFormData({ ...formData, publicationDistrict: e.target.value })}
                  required
                />

                <button onClick={handleRegister}>Register Title</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
