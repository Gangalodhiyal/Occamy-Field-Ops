import React, { useState, useEffect } from 'react'; // Import React and hooks for UI state management
import axios from 'axios'; // Import axios library for making API calls
import AdminDashboard from './AdminDashboard'; // Import the Admin Dashboard component

// Configure Backend API base URL (connecting to local server on port 5000)
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

function App() {
  // Define application states (Officer name, Login status, and tracking variables)
  const [officer, setOfficer] = useState(localStorage.getItem('officer') || ""); // Retrieve officer name from local storage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('officer')); // Check if user is already logged in
  const [dayStarted, setDayStarted] = useState(false); // Track if the field work session has started
  const [village, setVillage] = useState(""); // State to store the current village name
  const [photo, setPhoto] = useState(null); // State to store the captured proof photo
  const [view, setView] = useState('officer'); // Toggle between 'officer' app view and 'admin' dashboard view
  const [stats, setStats] = useState([]); // Array to store all activity data for the dashboard
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'officer'); // Store user role (admin/officer)

  // Function to fetch all activity data from the backend
  const loadStats = async () => {
    try {
      const res = await api.get('/activities'); // Send GET request to retrieve logs
      setStats(res.data); // Save the retrieved data into state
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  // Automatically load statistics whenever the user logs in
  useEffect(() => {
    if (isLoggedIn) loadStats();
  }, [isLoggedIn]);

  // Function to fetch precise GPS Coordinates (Latitude and Longitude)
  const getLoc = () => new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), // On Success: Return location object
      () => rej("GPS Required"), // On Error: Prompt user to enable GPS
      { enableHighAccuracy: true } // Request high-accuracy coordinates
    );
  });

  // Function to handle camera capture and file selection
  const handleCapture = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result); // Convert the image file to a Base64 string
    if (file) reader.readAsDataURL(file);
  };

  // Main function to submit any activity (Meeting, Sale, etc.) to the backend
  const submitLog = async (type, payload) => {
    // Validation: Mandatory Photo and Village name for meetings and sales
    if (type !== 'Day Start' && type !== 'Day End') {
      if (!photo || !village) return alert("Photo and Village are mandatory!");
    }

    try {
      const loc = await getLoc(); // Fetch current GPS location before submission
      
      // POST data to backend including activity details and location proof
      await api.post('/activities', { 
        type, 
        lat: loc.lat, 
        lng: loc.lng,
        village: village || 'N/A', 
        officer, 
        payload, 
        photo, // Transmitting photo as a Base64 encoded string
        date: new Date().toLocaleDateString('en-IN') // Store date in localized Indian format
      });

      alert(`${type} recorded successfully!`);
      
      // Reset form fields after successful submission
      setPhoto(null); 
      setVillage(""); 
      loadStats(); // Refresh dashboard data
    } catch (err) { 
      alert("Error: " + err.message); 
    }
  };

  // Function to handle user login and role assignment
  const handleLogin = () => {
    if (!officer) return alert("Please enter your name");
    // Assign 'admin' role if name is "admin", otherwise default to 'officer'
    const role = officer.toLowerCase() === 'admin' ? 'admin' : 'officer';
    localStorage.setItem('officer', officer); // Persist name in local storage
    localStorage.setItem('role', role); // Persist role in local storage
    setUserRole(role);
    setIsLoggedIn(true);
  };

  // Render Login Screen if user is not authenticated
  if (!isLoggedIn) return (
    <div style={styles.container}>
      <h2> OCCAMY LOGIN</h2>
      <input 
        style={styles.input} 
        placeholder="Enter Name" 
        value={officer}
        onChange={e => setOfficer(e.target.value)} 
      />
      <button style={styles.btn} onClick={handleLogin}>LOGIN</button>
    </div>
  );

  // Render Main Navigation and Screens upon successful login
  return (
    <div>
      {/* Top Navigation Bar Component */}
      <nav style={styles.nav}>
        <button style={navBtn} onClick={() => setView('officer')}> APP</button>
        {/* Render Dashboard button exclusively for Admin users */}
        {userRole === 'admin' && (
          <button style={navBtn} onClick={() => setView('admin')}> DASHBOARD</button>
        )}
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }} 
          style={{...navBtn, backgroundColor: '#e74c3c'}}
        > LOGOUT</button>
      </nav>

      {/* View Logic: Toggle between Field Officer App and Centralized Admin Dashboard */}
      {view === 'officer' ? (
        <div style={styles.container}>
          <h3>Officer: {officer}</h3>
          {/* Day Start Logic: Captures initial odometer reading */}
          {!dayStarted ? (
            <button style={styles.btn} onClick={() => { 
              const reading = prompt("Start Odometer Reading:"); 
              if(reading) {
                submitLog('Day Start', { odometer: reading });
                setDayStarted(true); 
              }
            }}>START DAY</button>
          ) : (
            // Form for field activities after day has started
            <div style={styles.form}>
              <input type="file" accept="image/*" capture="environment" onChange={handleCapture} />
              <input style={styles.input} placeholder="Current Village" value={village} onChange={e => setVillage(e.target.value)} />
              
              {/* Field Activity Action Buttons */}
              <button style={styles.actionBtn} onClick={() => {
                const name = prompt("Farmer Name?");
                const cat = prompt("Category (Farmer/Seller/Influencer)?");
                const pot = prompt("Potential (kg)?");
                if(name && cat) submitLog('One-on-One Meeting', { name, cat, pot });
              }}> ONE-ON-ONE MEETING</button>

              <button style={styles.actionBtn} onClick={() => {
                const attendees = prompt("Attendee Count?");
                if(attendees) submitLog('Group Meeting', { attendees });
              }}> GROUP MEETING</button>

              <button style={styles.actionBtn} onClick={() => {
                const mode = prompt("Mode (B2B/B2C)?");
                const sku = prompt("Product SKU?");
                const qty = prompt("Quantity?");
                if(sku && qty) submitLog('Sale', { mode, sku, qty });
              }}> LOG SALE</button>

              <button style={styles.actionBtn} onClick={() => {
                const qty = prompt("Sample Qty?");
                const purpose = prompt("Purpose (Trial/Demo)?");
                if(qty) submitLog('Sample', { qty, purpose });
              }}> GIVE SAMPLE</button>

              {/* Day End Logic: Captures final odometer and calculates total distance */}
              <button style={styles.endBtn} onClick={() => { 
                const reading = prompt("End Odometer Reading:"); 
                if(reading) {
                  submitLog('Day End', { odometer: reading });
                  setDayStarted(false); 
                }
              }}>END DAY</button>
            </div>
          )}
        </div>
      ) : <AdminDashboard stats={stats} />}
    </div>
  );
}

// Global Styling Objects for UI Consistency
const navBtn = { background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };

const styles = {
  container: { padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center', fontFamily: 'sans-serif' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  actionBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' },
  endBtn: { width: '100%', padding: '12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '15px', cursor: 'pointer' },
  nav: { background: '#2c3e50', padding: '10px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' }
};

export default App;