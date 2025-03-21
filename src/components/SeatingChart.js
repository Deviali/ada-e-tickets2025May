import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import SeatMap from './SeatMap';
import './SeatingChart.css';

const SeatingChart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState([]);
  const [balconyData, setBalconyData] = useState([]);
  const [juriesData, setJuriesData] = useState([]);

  const initialBalconyData = [
    { left: 4, middle: 18, right: 4, price: 50, availability: Array(26).fill(false), pending: Array(26).fill(false) },
    { left: 4, middle: 19, right: 4, price: 50, availability: Array(27).fill(false), pending: Array(27).fill(false) },
  ];

  const initialJuriesData = [
    {
      left: 6,
      middle: 13,
      right: 6,
      price: 50,
      availability: [...Array(6).fill(false), ...Array(13).fill(true), ...Array(6).fill(false)],
      pending: Array(25).fill(false),
    },
    {
      left: 6,
      middle: 18,
      right: 6,
      price: [40, 50, 40],
      availability: Array(30).fill(true),
      pending: Array(30).fill(false),
    },
    { left: 7, middle: 19, right: 7, price: 40, availability: Array(33).fill(true), pending: Array(33).fill(false) },
    { left: 8, middle: 20, right: 8, price: [30, 40, 30], availability: Array(36).fill(true), pending: Array(36).fill(false) },
    { left: 10, middle: 27, right: 9, price: [30, 40, 30], availability: Array(46).fill(true), pending: Array(46).fill(false) },
    { left: 9, middle: 28, right: 8, price: 30, availability: Array(45).fill(true), pending: Array(45).fill(false) },
    { left: 8, middle: 29, right: 7, price: 30, availability: Array(44).fill(true), pending: Array(44).fill(false) },
    {
      left: 14,
      middle: 16,
      right: 14,
      price: 30,
      availability: [...Array(14).fill(true), ...Array(16).fill(false), ...Array(14).fill(true)],
      pending: Array(44).fill(false),
    },
    { left: 14, middle: 17, right: 14, price: 30, availability: Array(45).fill(true), pending: Array(45).fill(false) },
    { left: 13, middle: 18, right: 13, price: [20, 30, 20], availability: Array(44).fill(true), pending: Array(44).fill(false) },
    { left: 13, middle: 19, right: 13, price: 20, availability: Array(45).fill(true), pending: Array(45).fill(false) },
    { left: 12, middle: 17, right: 13, price: 20, availability: Array(42).fill(true), pending: Array(42).fill(false) },
  ];

  useEffect(() => {
    const balconyRef = doc(db, 'seats', 'balcony');
    const juriesRef = doc(db, 'seats', 'juries');

    const initializeData = async () => {
      try {
        const balconySnap = await getDoc(balconyRef);
        if (!balconySnap.exists() || !balconySnap.data().data || balconySnap.data().data.length === 0) {
          await setDoc(balconyRef, { data: initialBalconyData }, { merge: true });
        }

        const juriesSnap = await getDoc(juriesRef);
        if (!juriesSnap.exists() || !juriesSnap.data().data || juriesSnap.data().data.length === 0) {
          await setDoc(juriesRef, { data: initialJuriesData }, { merge: true });
        }
      } catch (error) {
        console.error('Error initializing Firestore data:', error);
        setBalconyData(initialBalconyData);
        setJuriesData(initialJuriesData);
      }
    };

    const unsubscribeBalcony = onSnapshot(balconyRef, (doc) => {
      if (doc.exists() && doc.data().data && doc.data().data.length > 0) {
        setBalconyData(doc.data().data);
      } else {
        setBalconyData(initialBalconyData);
        initializeData();
      }
    }, (error) => {
      console.error('Error fetching balcony data:', error);
      setBalconyData(initialBalconyData);
      initializeData();
    });

    const unsubscribeJuries = onSnapshot(juriesRef, (doc) => {
      if (doc.exists() && doc.data().data && doc.data().data.length > 0) {
        setJuriesData(doc.data().data);
      } else {
        setJuriesData(initialJuriesData);
        initializeData();
      }
    }, (error) => {
      console.error('Error fetching juries data:', error);
      setJuriesData(initialJuriesData);
      initializeData();
    });

    return () => {
      unsubscribeBalcony();
      unsubscribeJuries();
    };
  }, []);

  useEffect(() => {
    console.log('Balcony Data:', balconyData);
    console.log('Juries Data:', juriesData);
  }, [balconyData, juriesData]);

  useEffect(() => {
    if (location.state?.clearCart) {
      setCart([]);
    }
  }, [location.state]);

  const handleProceedToPay = async () => {
    const updatedBalconyData = [...balconyData];
    const updatedJuriesData = [...juriesData];

    cart.forEach((item) => {
      const parts = item.id.split('-');
      let sectionName, section, rowIndex, seatIndex;

      if (parts[0] === 'Juries') {
        [sectionName, section, , ] = parts;
        rowIndex = parseInt(parts[2].replace('row', '')) - 1;
        seatIndex = parseInt(parts[3].replace('seat', '')) - 1;
      } else {
        [sectionName, section, , ] = parts;
        rowIndex = parseInt(parts[2].replace('row', '')) - 1;
        seatIndex = parseInt(parts[3].replace('seat', '')) - 1;
      }

      if (sectionName === 'Balcony') {
        const rowData = updatedBalconyData[rowIndex];
        if (!rowData || !rowData.pending) {
          console.error('Invalid rowData for Balcony:', rowData);
          return;
        }
        const totalSeatsBefore = section === 'left' ? 0 : section === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.pending[index] = true;
      } else if (sectionName === 'Juries') {
        const rowData = updatedJuriesData[rowIndex];
        if (!rowData || !rowData.pending) {
          console.error('Invalid rowData for Juries:', rowData);
          return;
        }
        const totalSeatsBefore = section === 'left' ? 0 : section === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.pending[index] = true;
      }
    });

    const validateData = (data) => {
      return data.every(row => 
        row && 
        typeof row.left === 'number' &&
        typeof row.middle === 'number' &&
        typeof row.right === 'number' &&
        (typeof row.price === 'number' || Array.isArray(row.price)) &&
        Array.isArray(row.availability) &&
        Array.isArray(row.pending) &&
        !row.availability.includes(undefined) &&
        !row.pending.includes(undefined)
      );
    };

    if (!validateData(updatedBalconyData)) {
      console.error('Invalid balcony data:', updatedBalconyData);
      return;
    }
    if (!validateData(updatedJuriesData)) {
      console.error('Invalid juries data:', updatedJuriesData);
      return;
    }

    try {
      await setDoc(doc(db, 'seats', 'balcony'), { data: updatedBalconyData });
      await setDoc(doc(db, 'seats', 'juries'), { data: updatedJuriesData });
    } catch (error) {
      console.error('Error updating Firestore:', error);
      return;
    }

    navigate('/payment', {
      state: {
        selectedSeats: cart.map((item) => ({
          seatId: item.id,
          price: item.price,
        })),
        totalSum: cartTotal,
      },
    });
  };

  const toggleSeat = (seat) => {
    const { id, price, section, row, seatNum, available } = seat;
    if (!available) return;

    const isSelected = cart.some(item => item.id === id);
    if (isSelected) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart([...cart, { id, section, row, seatNum, price }]);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  const clearCart = () => {
    setCart([]);
  };

  const formatCartItem = (item) => {
    const parts = item.id.split('-');
    let rowNum, sectionDisplay, seatNum;

    if (parts[0] === 'Juries') {
      const rowPart = parts[2];
      const seatPart = parts[3];
      const sectionPart = parts[1];

      rowNum = parseInt(rowPart.replace('row', '')) + 1;
      sectionDisplay = `${sectionPart} section`;
      seatNum = parseInt(seatPart.replace('seat', ''));
    } else {
      const rowPart = parts[2];
      const seatPart = parts[3];
      const sectionPart = parts[1];

      rowNum = parseInt(rowPart.replace('row', '')) + 1;
      sectionDisplay = `${sectionPart} section`;
      seatNum = parseInt(seatPart.replace('seat', ''));
    }

    return `row ${rowNum} ${sectionDisplay} seat ${seatNum} - ${item.price} AZN`;
  };

  return (
    <div className="screen-container">
      <div className="overlay">
        <div className="event-header">
          <div className="event-details">
            <h1 className="h_chart">ADAVISION</h1>
            <p className="p_chart">ADA University E Large Auditorium</p>
          </div>
          <div className="event-details">
            <h1 className="h_chart">Date</h1>
            <p className="event-date p_chart">May 8</p>
          </div>
          <div className="event-info">
            <h1 className="h_chart">Price</h1>
            <p className="event-price p_chart">20-50 AZN</p>
          </div>
        </div>
        <div className="gray-line-chart"></div>

        <div className="cart" id="cart">
          <h1 className="h_chart">Your Tickets</h1>
          <ul className="cart-items">
            {cart.map(item => (
              <li className="p_cart_gray" key={item.id}>
                {formatCartItem(item)}
              </li>
            ))}
          </ul>
          <p className="p_cart_black">Total: {cartTotal.toFixed(2)} AZN</p>
          <div className="cart-buttons">
            <button className="proceed-button" onClick={handleProceedToPay}>
              Proceed to Pay
            </button>
            <button
              className={`proceed-button clear-cart ${cart.length < 1 ? 'hidden' : ''}`}
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
        <div className="price-legend">
          <button className="view-toggle">2D</button>
          <div className="price-indicators">
            <span className="price-circle">
              <span className="dot purple"></span>20
            </span>
            <span>20</span>
            <span className="price-circle">
              <span className="dot yellow"></span>30
            </span>
            <span>30</span>
            <span className="price-circle">
              <span className="dot green"></span>40
            </span>
            <span>40</span>
            <span className="price-circle">
              <span className="dot red"></span>50
            </span>
            <span>50</span>
          </div>
          <button className="view-toggle not-visible">2D</button>
        </div>
      </div>

      <SeatMap
        balconyData={balconyData}
        juriesData={juriesData}
        onSeatClick={toggleSeat}
        cart={cart}
      />
    </div>
  );
};

export default SeatingChart;