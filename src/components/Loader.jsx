import React from 'react';
import '../styles/Loader.css';

export default function Loader() {
  return (
    <div className="beautiful-loader-container">
      <div className="sleek-spinner">
        <span className="sleek-logo">T4H</span>
      </div>
      <div className="beautiful-loader-text">
        Loading
      </div>
    </div>
  );
}
