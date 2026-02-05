import React, { useState, useEffect } from 'react'; // React aur hooks ko import kiya UI manage karne ke liye
import axios from 'axios'; // API calls karne ke liye axios library ka use kiya
import AdminDashboard from './AdminDashboard'; // Admin Dashboard component ko import kiya

// Backend API ka base URL set kiya (local server port 5000)
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

function App() {
  // Application ki states define ki (Officer name, Login status, etc.)
  const [officer, setOfficer] = useState(localStorage.getItem('officer') || ""); // Officer ka naam storage se liya
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('officer')); // Login check kiya
  const [dayStarted, setDayStarted] = useState(false); // Field work shuru hua ya nahi
  const [village, setVillage] = useState(""); // Current gaon ka naam
  const [photo, setPhoto] = useState(null); // Captured photo ki state
  const [view, setView] = useState('officer'); // Kaunsi screen dikhani hai (App ya Dashboard)
  const [stats, setStats] = useState([]); // Saari activities ka data store karne ke liye
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'officer'); // User ka role (admin/officer)

  // Backend se saara activity data load karne ka function
  const loadStats = async () => {
    try {
      const res = await api.get('/activities'); // GET request bheji
      setStats(res.data); // Data ko state mein save kiya
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  // Jab bhi user login kare, stats automatic load ho jayein
  useEffect(() => {
    if (isLoggedIn) loadStats();
  }, [isLoggedIn]);

  // GPS Coordinates (Latitude/Longitude) fetch karne ka function
  const getLoc = () => new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), // Success: location bheji
      () => rej("GPS Required"), // Error: GPS on karne ko kaha
      { enableHighAccuracy: true } // Accuracy high rakhi
    );
  });

  // Camera se photo capture karne ya file select karne ka function
  const handleCapture = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result); // Photo ko Base64 format mein badla
    if (file) reader.readAsDataURL(file);
  };

  // Har ek activity (Meeting/Sale) ko backend par submit karne ka main function
  const submitLog = async (type, payload) => {
    // Validation: Meeting aur Sales ke liye photo aur village mandatory hain
    if (type !== 'Day Start' && type !== 'Day End') {
      if (!photo || !village) return alert("Photo and Village are mandatory!");
    }

    try {
      const loc = await getLoc(); // Pehle location li
      
      // Backend ko saara data POST kiya
      await api.post('/activities', { 
        type, 
        lat: loc.lat, 
        lng: loc.lng,
        village: village || 'N/A', 
        officer, 
        payload, 
        photo, // Photo Base64 string mein ja rahi hai
        date: new Date().toLocaleDateString('en-IN') // Bharat ke format mein date
      });

      alert(`${type} recorded successfully!`);
      
      // Submit ke baad form fields reset ki
      setPhoto(null); 
      setVillage(""); 
      loadStats(); // Dashboard data update kiya
    } catch (err) { 
      alert("Error: " + err.message); 
    }
  };

  // Login handle karne ka function
  const handleLogin = () => {
    if (!officer) return alert("Please enter your name");
    // Agar naam 'admin' hai toh admin role diya, warna officer
    const role = officer.toLowerCase() === 'admin' ? 'admin' : 'officer';
    localStorage.setItem('officer', officer); // Storage mein naam save kiya
    localStorage.setItem('role', role); // Role save kiya
    setUserRole(role);
    setIsLoggedIn(true);
  };

  // Agar user logged in nahi hai, toh Login Screen dikhao
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

  // Logged in hone par Navigation aur Screens dikhao
  return (
    <div>
      {/* Top Navigation Bar */}
      <nav style={styles.nav}>
        <button style={navBtn} onClick={() => setView('officer')}> APP</button>
        {/* Dashboard button sirf admin ko dikhega */}
        {userRole === 'admin' && (
          <button style={navBtn} onClick={() => setView('admin')}> DASHBOARD</button>
        )}
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }} 
          style={{...navBtn, backgroundColor: '#e74c3c'}}
        > LOGOUT</button>
      </nav>

      {/* View logic: Officer App dikhani hai ya Admin Dashboard */}
      {view === 'officer' ? (
        <div style={styles.container}>
          <h3>Officer: {officer}</h3>
          {/* Day Start Logic: Odometer reading leta hai */}
          {!dayStarted ? (
            <button style={styles.btn} onClick={() => { 
              const reading = prompt("Start Odometer Reading:"); 
              if(reading) {
                submitLog('Day Start', { odometer: reading });
                setDayStarted(true); 
              }
            }}>START DAY</button>
          ) : (
            // Day Start hone ke baad ki saari activities
            <div style={styles.form}>
              <input type="file" accept="image/*" capture="environment" onChange={handleCapture} />
              <input style={styles.input} placeholder="Current Village" value={village} onChange={e => setVillage(e.target.value)} />
              
              {/* Meeting aur Sale buttons */}
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

              {/* Day End Logic: Odometer reading lekar distance calculate karta hai */}
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

// Styling Objects (UI design ke liye)
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