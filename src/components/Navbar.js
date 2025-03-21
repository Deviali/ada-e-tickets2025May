import React, { useState } from 'react';
import images from '../constants/images';
import './Navbar.css';
import { RxCross1, RxHamburgerMenu } from "react-icons/rx";
import { Link } from 'react-router-dom';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="Navbar">
      <img src={images.DramaLogo} alt="Logo of Drama Events" />
      
      {/* Desktop Navigation */}
      <ul className="Navbar-list">
        <li className="Navbar-item">
          <Link to="/" className="Navbar-item-link p_nav">About us</Link>
        </li>
        <li className="Navbar-item">
          <Link to="/" className="Navbar-item-link p_nav">Service</Link>
        </li>
        <li className="Navbar-item">
          <Link to="/" className="Navbar-item-link p_nav">Portfolio</Link>
        </li>
        <li className="Navbar-item">
          <Link to="/" className="Navbar-item-link p_nav">Media</Link>
        </li>
        <li className="Navbar-item">
          <Link to="/" className="Navbar-item-link p_nav">Contact us</Link>
        </li>
      </ul>
      <div className="Navbar-button p_contactus">
        <Link to="/" className="Navbar-item-link">Contact us</Link>
      </div>

      <div className="Navbar-hamburger" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <RxCross1 /> : <RxHamburgerMenu />}
      </div>

      {/* Mobile Menu */}
      <div className={`Navbar-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="Navbar-mobile-header">
          <RxCross1 className="Navbar-mobile-close" onClick={toggleMobileMenu} />
        </div>
        <ul className="Navbar-mobile-list">
          <li className="Navbar-mobile-item">
            <Link to="/" className="Navbar-mobile-link p_nav" onClick={toggleMobileMenu}>
              About us
            </Link>
          </li>
          <li className="Navbar-mobile-item">
            <Link to="/" className="Navbar-mobile-link p_nav" onClick={toggleMobileMenu}>
              Portfolio
            </Link>
          </li>
          <li className="Navbar-mobile-item">
            <Link to="/" className="Navbar-mobile-link p_nav" onClick={toggleMobileMenu}>
              Service
            </Link>
          </li>
          <li className="Navbar-mobile-item">
            <Link to="/" className="Navbar-mobile-link p_nav" onClick={toggleMobileMenu}>
              Media
            </Link>
          </li>
          <li className="Navbar-mobile-item">
            <Link to="/" className="Navbar-mobile-link p_nav" onClick={toggleMobileMenu}>
              Contact us
            </Link>
          </li>
        </ul>
        <div className="Navbar-mobile-footer">
          <button className="Navbar-mobile-contact-btn">
            <Link to="/" className="Navbar-mobile-link" onClick={toggleMobileMenu}>
              Contact us
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;