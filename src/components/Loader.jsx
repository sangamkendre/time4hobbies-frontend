import React from 'react';
import { createPortal } from 'react-dom';
import '../styles/Loader.css';

export default function Loader() {
  return createPortal(
    <div className="beautiful-loader-container">
      <div className="sleek-spinner">
        <span className="sleek-logo">T4H</span>
      </div>
      <div className="beautiful-loader-text">
        Loading
      </div>
    </div>,
    document.body
  );
}
