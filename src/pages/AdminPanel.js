import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import './AdminPanel.css';
import SeatMap from './../components/SeatMap';

const ADMIN_ID = 'admin';
const ADMIN_PASSWORD = 'rashad1234';

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [acceptedSubmissions, setAcceptedSubmissions] = useState([]);
  const [rejectedSubmissions, setRejectedSubmissions] = useState([]);
  const [balconyData, setBalconyData] = useState([]);
  const [juriesData, setJuriesData] = useState([]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (id === ADMIN_ID && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert('Invalid ID or password');
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const pendingQuery = query(collection(db, 'submissions'), where('status', '==', 'pending'));
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      setPendingSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const acceptedQuery = query(collection(db, 'submissions'), where('status', '==', 'accepted'));
    const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
      setAcceptedSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const rejectedQuery = query(collection(db, 'submissions'), where('status', '==', 'rejected'));
    const unsubscribeRejected = onSnapshot(rejectedQuery, (snapshot) => {
      const now = new Date();
      const rejected = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRejectedSubmissions(rejected);

      rejected.forEach(submission => {
        const rejectedAt = submission.rejectedAt?.toDate();
        if (rejectedAt) {
          const expiryDate = new Date(rejectedAt);
          expiryDate.setDate(expiryDate.getDate() + 7);
          if (now > expiryDate) {
            deleteDoc(doc(db, 'submissions', submission.id));
          }
        }
      });
    });

    const balconyRef = doc(db, 'seats', 'balcony');
    const juriesRef = doc(db, 'seats', 'juries');
    const unsubscribeBalcony = onSnapshot(balconyRef, (doc) => {
      if (doc.exists()) {
        setBalconyData(doc.data().data);
      }
    });
    const unsubscribeJuries = onSnapshot(juriesRef, (doc) => {
      if (doc.exists()) {
        setJuriesData(doc.data().data);
      }
    });

    return () => {
      unsubscribePending();
      unsubscribeAccepted();
      unsubscribeRejected();
      unsubscribeBalcony();
      unsubscribeJuries();
    };
  }, [isLoggedIn]);

  const handleAccept = async (submission) => {
    const submissionRef = doc(db, 'submissions', submission.id);
    await updateDoc(submissionRef, { status: 'accepted', acceptedAt: Timestamp.fromDate(new Date()) });

    const updatedBalconyData = [...balconyData];
    const updatedJuriesData = [...juriesData];

    submission.seats.forEach(seatId => {
      const [sectionName, section, rowPart, seatPart] = seatId.split('-');
      const rowIndex = parseInt(rowPart.replace('row', '')) - 1;
      const seatIndex = parseInt(seatPart.replace('seat', '')) - 1;

      if (sectionName === 'Balcony') {
        const rowData = updatedBalconyData[rowIndex];
        const totalSeatsBefore = section === 'left' ? 0 : section === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = false;
        rowData.pending[index] = false;
      } else if (sectionName === 'Juries') {
        const rowData = updatedJuriesData[rowIndex];
        const totalSeatsBefore = section === 'left' ? 0 : section === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = false;
        rowData.pending[index] = false;
      }
    });

    await updateDoc(doc(db, 'seats', 'balcony'), { data: updatedBalconyData });
    await updateDoc(doc(db, 'seats', 'juries'), { data: updatedJuriesData });
  };

  const handleReject = async (submission) => {
    const submissionRef = doc(db, 'submissions', submission.id);
    await updateDoc(submissionRef, {
      status: 'rejected',
      rejectedAt: Timestamp.fromDate(new Date()),
    });

    const updatedBalconyData = [...balconyData];
    const updatedJuriesData = [...juriesData];

    submission.seats.forEach(seatId => {
      const [sectionName, section, rowPart, seatPart] = seatId.split('-');
      const rowIndex = parseInt(rowPart.replace('row', '')) - 1;
      const seatIndex = parseInt(seatPart.replace('seat', '')) - 1;

      if (sectionName === 'Balcony') {
        const rowData = updatedBalconyData[rowIndex];
        const totalSeatsBefore = section === 'left' ? 0 : section === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = true;
        rowData.pending[index] = false;
      } else if (sectionName === 'Juries') {
        const rowData = updatedJuriesData[rowIndex];
        const totalSeatsBefore = section === 'left' ? 0 : section === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = true;
        rowData.pending[index] = false;
      }
    });

    await updateDoc(doc(db, 'seats', 'balcony'), { data: updatedBalconyData });
    await updateDoc(doc(db, 'seats', 'juries'), { data: updatedJuriesData });
  };

  const handleSeatClick = async (seat) => {
    const { id, section, row, seatNum, available, pending } = seat;
    if (pending) return; // Ignore pending seats

    const [sectionName, sectionPart, rowPart, seatPart] = id.split('-');
    const rowIndex = parseInt(rowPart.replace('row', '')) - 1;
    const seatIndex = parseInt(seatPart.replace('seat', '')) - 1;

    const updatedBalconyData = [...balconyData];
    const updatedJuriesData = [...juriesData];

    if (available) {
      // Reserve the seat
      if (sectionName === 'Balcony') {
        const rowData = updatedBalconyData[rowIndex];
        const totalSeatsBefore = sectionPart === 'left' ? 0 : sectionPart === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = false;
      } else if (sectionName === 'Juries') {
        const rowData = updatedJuriesData[rowIndex];
        const totalSeatsBefore = sectionPart === 'left' ? 0 : sectionPart === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = false;
      }

      await updateDoc(doc(db, 'seats', 'balcony'), { data: updatedBalconyData });
      await updateDoc(doc(db, 'seats', 'juries'), { data: updatedJuriesData });

      await addDoc(collection(db, 'reservations'), {
        seatId: id,
        section,
        row,
        seatNum,
        reservedAt: Timestamp.fromDate(new Date()),
      });
    } else {
      // Unreserve the seat
      if (sectionName === 'Balcony') {
        const rowData = updatedBalconyData[rowIndex];
        const totalSeatsBefore = sectionPart === 'left' ? 0 : sectionPart === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = true;
      } else if (sectionName === 'Juries') {
        const rowData = updatedJuriesData[rowIndex];
        const totalSeatsBefore = sectionPart === 'left' ? 0 : sectionPart === 'middle' ? rowData.left : rowData.left + rowData.middle;
        const index = totalSeatsBefore + seatIndex;
        rowData.availability[index] = true;
      }

      await updateDoc(doc(db, 'seats', 'balcony'), { data: updatedBalconyData });
      await updateDoc(doc(db, 'seats', 'juries'), { data: updatedJuriesData });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>ID:</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <h2>Pending Submissions</h2>
      <table className="submission-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Seats</th>
            <th>Receipt</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingSubmissions.map(submission => (
            <tr key={submission.id}>
              <td>{submission.name}</td>
              <td>{submission.surname}</td>
              <td>{submission.email}</td>
              <td>{submission.seats.join(', ')}</td>
              <td>
                <a href={submission.receiptUrl} target="_blank" rel="noopener noreferrer">View Receipt</a>
              </td>
              <td>
                <button className="accept-btn" onClick={() => handleAccept(submission)}>✔</button>
                <button className="reject-btn" onClick={() => handleReject(submission)}>✖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Accepted Submissions</h2>
      <table className="submission-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Seats</th>
            <th>Receipt</th>
            <th>Accepted At</th>
          </tr>
        </thead>
        <tbody>
          {acceptedSubmissions.map(submission => (
            <tr key={submission.id}>
              <td>{submission.name}</td>
              <td>{submission.surname}</td>
              <td>{submission.email}</td>
              <td>{submission.seats.join(', ')}</td>
              <td>
                <a href={submission.receiptUrl} target="_blank" rel="noopener noreferrer">View Receipt</a>
              </td>
              <td>{submission.acceptedAt?.toDate().toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Rejected Submissions</h2>
      <table className="submission-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Seats</th>
            <th>Receipt</th>
            <th>Rejected At</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {rejectedSubmissions.map(submission => {
            const rejectedAt = submission.rejectedAt?.toDate();
            const expiryDate = new Date(rejectedAt);
            expiryDate.setDate(expiryDate.getDate() + 7);
            return (
              <tr key={submission.id}>
                <td>{submission.name}</td>
                <td>{submission.surname}</td>
                <td>{submission.email}</td>
                <td>{submission.seats.join(', ')}</td>
                <td>
                  <a href={submission.receiptUrl} target="_blank" rel="noopener noreferrer">View Receipt</a>
                </td>
                <td>{rejectedAt?.toLocaleString()}</td>
                <td>{expiryDate.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Seat Map</h2>
      <SeatMap
        balconyData={balconyData}
        juriesData={juriesData}
        onSeatClick={handleSeatClick}
        
      />
    </div>
  );
};

export default AdminPanel;