import React from 'react'
import images from '../constants/images';
import Navbar from './../components/Navbar';
import SeatingChart from './../components/SeatingChart';
import './SeatSelector.css'

function SeatSelector() {
  return (
    <div className='selector'>
      <Navbar />
      <div className="selector-chart-cart">
        <SeatingChart />
        
      </div>
      
    </div>
  )
}

export default SeatSelector