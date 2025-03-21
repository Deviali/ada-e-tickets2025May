import React from 'react';
import './NotOk.css';

const NotOk = () => {
  return (
    <div className="result-container">
      <div className="result-box">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6L18 18M6 18L18 6" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default NotOk;