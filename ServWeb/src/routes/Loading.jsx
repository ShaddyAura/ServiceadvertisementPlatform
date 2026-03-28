import React from "react";
import "./Loading.css";

const Loading = () => {
  return (
    <div className="premium-loading-overlay">
      <div className="premium-loading-content">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loading-text">
          <span className="text-serv">Serv</span>
          <span className="text-adds">Adds</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
