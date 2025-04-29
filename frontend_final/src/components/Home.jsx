import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import SplitText from "./reactbits/SplitText";
import Balatro from "./reactbits/Balatro"; // Make sure path is correct

function Home() {
  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <div className="home-wrapper">
      {/* Balatro background */}
      <Balatro isRotate={false} mouseInteraction={true} pixelFilter={700} />

      {/* Main content on top of background */}
      <div className="home-container">
        <SplitText
          text="Authentica.ai"
          className="animated-title"
          delay={150}
          animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
          animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
          onLetterAnimationComplete={handleAnimationComplete}
        />

        <p className="sub-text">
          Use this portal to verify if your publication title is acceptable and
          see suggestions to avoid duplicate or similar titles.
        </p>

        <Link to="/title-checker">
        <button className="get-started-button">Get Started</button>
      </Link>
      </div>
    </div>
  );
}

export default Home;
