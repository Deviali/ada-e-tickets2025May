import React from 'react'
import images from '../constants/images';
import Navbar from './../components/Navbar';
import './Landing.css'
import { GoArrowUpRight } from "react-icons/go";
import Footer from './../components/Footer';
import Banner from './../components/Banner';

function Landing() {
  return (
    <div className='home'>
     <Navbar />
      <div className="home-container">
        <div className="home-container-champion">
          <img src={images.ChampionLogo} alt="ADA Drama Champions" />
        </div>
        <div className="home-container-info">
          <h className="h_landing">ADAVISION</h>
          <p className="p_landing_gray">ADA Uniersity E Large <br/> auditorium / May 8</p>
          <a href='/Seat-selection' className='landing-button'>
            <p className="p_button">Get tickets now</p>
            <GoArrowUpRight className='ArrowUpRight' />
          </a>
        </div>
      </div>
      <Banner />
      <Footer />
    </div>
  )
}

export default Landing