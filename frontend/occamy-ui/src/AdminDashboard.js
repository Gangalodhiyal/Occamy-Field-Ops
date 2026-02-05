import React from 'react'; // React library ko import kiya component banane ke liye

const AdminDashboard = ({ stats }) => {
  // CALCULATIONS (Dashboard ke top cards ke liye data process karna)

  // 'stats' array mein se wo entries filter ki jinke 'type' mein 'Meeting' word aata hai aur unki ginti (length) li
  const totalMeetings = stats.filter(s => s.type && s.type.includes('Meeting')).length;
  
  // Wo 'Sale' entries nikaali jiska mode B2B hai (toUpperCase() se case-sensitivity ki problem solve ki)
  const b2bSales = stats.filter(s => s.type === 'Sale' && s.payload?.mode?.toUpperCase() === 'B2B').length;
  
  // Wo 'Sale' entries nikaali jiska mode B2C hai
  const b2cSales = stats.filter(s => s.type === 'Sale' && s.payload?.mode?.toUpperCase() === 'B2C').length;
  
  // Total Distance: Sabhi entries ki 'distanceToday' ko jod kar (reduce function se) total safar nikala
  const totalDistance = stats.reduce((acc, s) => acc + (Number(s.distanceToday) || 0), 0);

  return (
    // Dashboard ka main container (light background aur padding ke saath)
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{color: '#2c3e50'}}>🛰️ Occamy Central Control</h2>
      
      {/* Top Cards Section: Chaar cards jo key metrics (Distance, Meetings, Sales) dikhate hain */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={cardStyle}><h4>Total Distance</h4><p>{totalDistance} km</p></div>
        <div style={cardStyle}><h4>Meetings</h4><p>{totalMeetings}</p></div>
        <div style={cardStyle}><h4>B2B Sales</h4><p>{b2bSales}</p></div>
        <div style={cardStyle}><h4>B2C Sales</h4><p>{b2cSales}</p></div>
      </div>

      {/* Main Table Container: Jisme verifiable activities ka log dikhega */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3>Ground Activity Log (Verifiable)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {/* Table Header: Problem Statement (PF) ki requirement ke according columns */}
            <tr style={{background: '#ecf0f1', textAlign: 'left'}}>
              <th style={tdStyle}>Date</th>
              <th style={tdStyle}>Officer</th>
              <th style={tdStyle}>Activity</th>
              <th style={tdStyle}>Travel (km)</th>
              <th style={tdStyle}>Village</th>
              <th style={tdStyle}>GPS Location</th>
              <th style={tdStyle}>Proof</th>
            </tr>
          </thead>
          <tbody>
            {/* stats array ko loop (map) karke table rows generate ki */}
            {stats.map(s => (
              <tr key={s.id || Math.random()} style={{borderBottom: '1px solid #eee'}}>
                <td style={tdStyle}>{s.date || 'N/A'}</td>
                <td style={tdStyle}>{s.officer || 'N/A'}</td>
                <td style={tdStyle}><strong>{s.type}</strong></td>
                {/* Distance sirf tab dikhega jab value ho, warna '-' dikhega */}
                <td style={tdStyle}>{s.distanceToday ? `${s.distanceToday} km` : '-'}</td>
                
                {/* VILLAGE LOGIC: Agar seedha village nahi hai toh payload ke andar check kiya */}
                <td style={tdStyle}>{s.village || s.payload?.village || 'N/A'}</td>
                
                {/* GPS LOGIC: Latitude aur Longitude ko 2 decimal points tak fix karke dikhaya */}
                <td style={tdStyle}>
                  {s.location?.lat ? `${s.location.lat.toFixed(2)}, ${s.location.lng.toFixed(2)}` : 'N/A'}
                </td>
                
                {/* PROOF LOGIC: Agar photo Base64 hai ya server URL, dono ko link mein convert kiya */}
                <td style={tdStyle}>
                  {s.photo ? (
                    <a 
                      href={s.photo.startsWith('data:') ? s.photo : `http://localhost:5000${s.photo}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{color: '#3498db', fontWeight: 'bold'}}
                    >
                      View Photo
                    </a>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
// --- STYLING (UI ko professional banane ke liye CSS-in-JS) ---
const cardStyle = { flex: 1, padding: '20px', background: '#fff', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const tdStyle = { padding: '12px' };

export default AdminDashboard; // Component ko export kiya taaki App.js mein use ho sake