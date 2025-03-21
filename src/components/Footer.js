import React from 'react';
import images from '../constants/images';
import { GoArrowDownRight } from "react-icons/go";
import { FaInstagram, FaTiktok, FaFacebook, FaTwitter } from "react-icons/fa";
import './Footer.css';

function Footer() {
  return (
    <div className="footer">
      <div className="footer-container">
        <div className="footer-logo-list">
          <div className="footer-logo">
            <img src={images.DramaLogo} alt="Drama Logo" />
          </div>
          <ul className="footer-list">
            <li className="p_nav footer-item">About us</li>
            <li className="p_nav footer-item">Service</li>
            <li className="p_nav footer-item">Portfolio</li>
            <li className="p_nav footer-item">Media</li>
            <li className="p_nav footer-item">Contact us</li>
          </ul>
          <ul className="footer-list footer-contact">
          <li className="footer-item p_footer">info@ada.edu.az</li>
          <li className="footer-item p_footer">(+994 12) 437 32 35</li>
          <li className="footer-item p_footer">
            Ahmadbey Aghaoghlu str. 61,<br />Baku, Azerbaijan, AZ1008
          </li>
        </ul>
        <div className="footer-findus">
          <h1 className="h_footer">
            Find us on <br />Social Media <GoArrowDownRight />
          </h1>
          <div className="footer-icons">
            <FaTiktok className="footer-icon-colored" />
            <FaFacebook className="footer-icon-colored" />
            <FaInstagram className="footer-icon-colored" />
            <FaTwitter className="footer-icon-colored" />
          </div>
        </div>
        </div>
        <div className="footer-mobile">
          <div className="footer-logo">
            <img src={images.DramaLogo} alt="Drama Logo" />
          </div>
          <div className="f-mobile-info">
            <ul className="footer-list">
              <li className="p_nav footer-item">About us</li>
              <li className="p_nav footer-item">Service</li>
              <li className="p_nav footer-item">Portfolio</li>
              <li className="p_nav footer-item">Media</li>
              <li className="p_nav footer-item">Contact us</li>
          </ul>
          <ul className="footer-list footer-contact">
            <li className="footer-item p_footer">info@ada.edu.az</li>
            <li className="footer-item p_footer">(+994 12) 437 32 35</li>
           <li className="footer-item p_footer">
            Ahmadbey Aghaoghlu str. 61,<br />Baku, Azerbaijan, AZ1008
            </li>
          </ul>
          </div>
          <div className="footer-findus">
            <h1 className="h_footer">
              Find us on <br />Social Media <GoArrowDownRight />
            </h1>
           <div className="footer-icons">
              <FaTiktok className="footer-icon-colored" />
              <FaFacebook className="footer-icon-colored" />
              <FaInstagram className="footer-icon-colored" />
              <FaTwitter className="footer-icon-colored" />
            </div>
          </div>
        </div>
      </div>
      <div className="footer-cc">
        <p className="p_cc">© Drama. Bütün hüquqlar qorunur.</p>
        <div className="footer-purple-line"></div>
        <div className="footer-mobile-breaker">
          <p className="p_cc">Privacy Policy</p>
          <a   href="https://www.linkedin.com/in/ali-pashmineh-3ab0bb1bb/" 
             className="p_cc" 
             target="_blank" 
             rel="noopener noreferrer">Made By Ali-Pa</a></div>
        
      </div>
    </div>
    
  );
}

export default Footer;