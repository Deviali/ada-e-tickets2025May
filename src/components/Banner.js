import React from 'react'
import './Banner.css';

const Banner = () => {
    const bannerText = (
        <div className="carousel-item h_banner">
          <span className='banner-bordered'>ADAVISION SONG CONTEST 2025 </span>
          <span className="dot"> • </span>
          <span> GET YOUR TICKET</span>
        </div>
      );
    
    return (
      <div className="carousel-container">
        <div className="carousel-track">
          <span className="carousel-item">{bannerText}</span>
          <span className="carousel-item">{bannerText}</span>
          <span className="carousel-item">{bannerText}</span>
          <span className="carousel-item">{bannerText}</span>
          <span className="carousel-item">{bannerText}</span>
          <span className="carousel-item">{bannerText}</span>

        </div>
      </div>
    );
  };
  
  export default Banner;


