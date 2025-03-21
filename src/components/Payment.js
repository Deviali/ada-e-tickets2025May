import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from './Navbar';
import Footer from './Footer';
import './Payment.css';
import { RxCross1 } from 'react-icons/rx';
import images from '../constants/images';
import ReactCountryFlag from 'react-country-flag';
import countryData from 'country-telephone-data';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSeats, totalSum } = location.state || { selectedSeats: [], totalSum: 0 };

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthday: '',
    phone: '',
    email: '',
    countryCode: '+994',
  });

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);

  const submissionSchema = {
    name: 'string',
    surname: 'string',
    birthday: 'string',
    phone: 'string',
    email: 'string',
    seats: 'array',
    total: 'number',
    receiptUrl: 'string',
    status: 'string',
    createdAt: 'timestamp',
  };

  useEffect(() => {
    const initializeSchema = async () => {
      try {
        const schemaRef = doc(db, 'schemas', 'submissions');
        const schemaSnap = await getDoc(schemaRef);

        if (!schemaSnap.exists()) {
          await setDoc(schemaRef, submissionSchema);
          console.log('Schema created in Firestore');
        }
      } catch (error) {
        console.error('Error initializing schema:', error);
      }
    };

    initializeSchema();
  }, []);

  useEffect(() => {
    if (!selectedSeats || selectedSeats.length === 0) {
      alert('Please select seats before proceeding to payment.');
      navigate('/seat-selection');
    }
  }, [selectedSeats, navigate]);

  const sortedCountries = [...countryData.allCountries].sort((a, b) => {
    if (a.iso2 === 'az') return -1;
    if (b.iso2 === 'az') return 1;
    return a.name.localeCompare(b.name);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name' || name === 'surname') {
      const formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: formattedValue });
    } else if (name === 'birthday') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2 && formattedValue.length <= 4) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      } else if (formattedValue.length > 4) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}/${formattedValue.slice(4, 8)}`;
      }
      setFormData({ ...formData, [name]: formattedValue });
    } else if (name === 'countryCode') {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      setIsFileLoading(true);
      setTimeout(() => {
        if (validateFile(uploadedFile)) {
          setFile(uploadedFile);
        } else {
          alert('Invalid file type or size. Please upload a PDF, image, or DOCX file under 5MB.');
        }
        setIsFileLoading(false);
      }, 1000);
    }
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setIsFileLoading(true);
    setTimeout(() => {
      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
      } else {
        alert('Invalid file type or size. Please upload a PDF, image, or DOCX file under 5MB.');
      }
      setIsFileLoading(false);
    }, 1000);
  };

  const validateFile = (file) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file && allowedTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.surname || !formData.birthday || !formData.phone || !formData.email || !file) {
      alert('Please fill in all required fields and upload a receipt.');
      return;
    }

    setIsLoading(true);

    let docRef = null;
    let seatIds = selectedSeats.map((seat) => seat.seatId); // Store seat IDs for rollback

    try {
      console.log('Step 1: Fetching schema');
      const schemaRef = doc(db, 'schemas', 'submissions');
      const schemaSnap = await getDoc(schemaRef);
      if (!schemaSnap.exists()) {
        throw new Error('Schema not found in Firestore');
      }

      const schema = schemaSnap.data();

      const submissionData = {
        name: formData.name,
        surname: formData.surname,
        birthday: formData.birthday,
        phone: `${formData.countryCode}${formData.phone}`,
        email: formData.email,
        seats: selectedSeats.map((seat) => seat.seatId),
        total: totalSum,
        receiptUrl: '',
        status: 'pending',
        createdAt: new Date(),
      };

      console.log('Step 2: Validating schema');
      for (const [key, expectedType] of Object.entries(schema)) {
        const value = submissionData[key];
        if (value === undefined) {
          throw new Error(`Missing required field: ${key}`);
        }

        if (expectedType === 'string' && typeof value !== 'string' && !(key === 'receiptUrl' && value === '')) {
          throw new Error(`Field ${key} must be a string`);
        } else if (expectedType === 'number' && typeof value !== 'number') {
          throw new Error(`Field ${key} must be a number`);
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          throw new Error(`Field ${key} must be an array`);
        } else if (expectedType === 'timestamp' && !(value instanceof Date)) {
          throw new Error(`Field ${key} must be a timestamp`);
        }
      }

      console.log('Step 3: Uploading file');
      const storageRef = ref(storage, `receipts/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
      } catch (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
      const receiptUrl = await getDownloadURL(storageRef);
      submissionData.receiptUrl = receiptUrl;

      console.log('Step 4: Writing to Firestore submissions');
      docRef = await addDoc(collection(db, 'submissions'), submissionData);

      console.log('Step 5: Marking seats as pending');
      const seatUpdates = selectedSeats.map((seat) =>
        setDoc(
          doc(db, 'seats', seat.seatId),
          { status: 'pending', submissionId: docRef.id },
          { merge: true }
        )
      );
      await Promise.all(seatUpdates);

      console.log('Step 6: Navigating to /ok');
      navigate('/ok');
    } catch (error) {
      console.error('Error submitting form:', error.message);

      // Rollback: Revert seats to 'available' if any error occurs
      if (seatIds.length > 0) {
        console.log('Rolling back seat status to available');
        const rollbackUpdates = seatIds.map((seatId) =>
          setDoc(
            doc(db, 'seats', seatId),
            { status: 'available', submissionId: null },
            { merge: true }
          )
        );
        try {
          await Promise.all(rollbackUpdates);
          console.log('Seats reverted to available');
        } catch (rollbackError) {
          console.error('Error rolling back seat status:', rollbackError.message);
        }
      }

      navigate('/not-ok');
    } finally {
      setIsLoading(false);
    }
  };

  const closePayment = () => {
    navigate('/seat-selection', { state: { clearCart: true } });
  };

  return (
    <div className="payment">
      <Navbar />
      <div className="payment-container">
        <div className="payment-info-gather">
          <div className="payment-cross">
            <RxCross1 className="payment-cross-icon" onClick={closePayment} />
          </div>
          <div className="payment-form-container">
            <div className="payment-flex">
              <h1 className="h_payment payment-form-col">Payment</h1>
              <div className='payment-form-col'></div>
            </div>
            <div className="payment-form-columns">
              <div className="payment-form-col">
                <div className="form-gather">
                  <p className="p_form">
                    Name <span className="font-red">*</span>
                  </p>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="gather"
                    required
                  />
                </div>
                <div className="form-gather">
                  <p className="p_form">
                    Surname <span className="font-red">*</span>
                  </p>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="gather"
                    required
                  />
                </div>
                <div className="form-gather">
                  <p className="p_form">
                    Birthday date <span className="font-red">*</span>
                  </p>
                  <input
                    type="text"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    className="gather p_placeholder"
                    maxLength="10"
                    required
                  />
                </div>
                <div className="form-gather">
                  <p className="p_form">
                    Phone number <span className="font-red">*</span>
                  </p>
                  <div className="phone-input">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="country-code"
                    >
                      {sortedCountries.map((country) => (
                        <option key={country.iso2} value={country.dialCode}>
                          <ReactCountryFlag
                            countryCode={country.iso2}
                            svg
                            style={{ marginRight: '8px' }}
                          />
                          {country.iso2.toUpperCase()} ({country.dialCode})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="00 000 00 00"
                      className="gather p_placeholder"
                      required
                    />
                  </div>
                </div>
                <div className="form-gather">
                  <p className="p_form">
                    Email <span className="font-red">*</span>
                  </p>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="gather"
                    required
                  />
                </div>
              </div>
              <div className="payment-form-col">
                <div className="bank-details">
                  <p className="p_cart_black">
                    Bank: <span className="p_cart_gray">ABB Bank</span>
                  </p>
                  <p className="p_cart_black">
                    Card Number: <span className="p_cart_gray">5566 7788 9988 8800</span>
                  </p>
                  <p className="p_cart_black">
                    Expiry Date: <span className="p_cart_gray">12/26</span>
                  </p>
                </div>
                <div className="form-gather">
                  <div className="warning">
                    <span className="warning-icon">!</span>
                    <div className="warning-info">
                      <p className="p_warning">ATTENTION</p>
                      <p className="p_warning w400">Payment are non-refundable</p>
                      <p className="p_warning w300">
                        If you are not a member of this community event, you will not be able to get a ticket to this event, even if you have paid for it.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="form-gather">
                  <p className="p_form">
                    Receipt <span className="font-red">*</span>
                  </p>
                  <div
                    className={`file-upload ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="receipt"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf,.docx"
                      className="file-input"
                    />
                    <label htmlFor="receipt" className="file-label">
                      {isFileLoading ? (
                        <div className="loading-bar">
                          <div className="loading-bar-progress"></div>
                        </div>
                      ) : (
                        <>
                          <img src={images.UploadIcon} alt="logo of upload" />
                          <p className="p_form_reciept font-purple">
                            {file ? file.name : 'Upload a file'}
                            <span className="p_form_reciept">{file ? '' : ' or drag and drop'}</span>
                            <br />
                            <span className="p_pdf">Accepted file types: Images, PDF, DOCX</span>
                            <br />
                            <span className="p_pdf">Maximum file size: 5MB</span>
                          </p>
                          {file && (
                            <RxCross1
                              className="file-cross-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                              }}
                            />
                          )}
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="form-gather">
                  <button
                    className="submit-button p_contactus"
                    onClick={handleSubmit}
                    disabled={isLoading || !file}
                  >
                    {isLoading ? (
                      <div className="loading-bar">
                        <div className="loading-bar-progress"></div>
                      </div>
                    ) : (
                      'Upload payment receipt'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Payment;