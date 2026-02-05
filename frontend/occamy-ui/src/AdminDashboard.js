import React from 'react'; // Import React library to create the functional component

const AdminDashboard = ({ stats }) => {
  // --- CALCULATIONS (Processing data for the dashboard metrics) ---

  // Filter entries that include the word 'Meeting' in their type and get the total count
  const totalMeetings = stats.filter(s => s.type && s.type.includes('Meeting')).length;
  
  // Filter 'Sale' entries where the mode is 'B2B' (using toUpperCase to handle case-sensitivity)
  const b2bSales = stats.filter(s => s.type === 'Sale' && s.payload?.mode?.toUpperCase() === 'B2B').length;
  
  // Filter 'Sale' entries where the mode is 'B2C'
  const b2cSales = stats.filter(s => s.type === 'Sale' && s.payload?.mode?.toUpperCase() === 'B2C').length;
  
  // Total Distance: Use the reduce function to sum up all 'distanceToday' values from the stats array
  const totalDistance = stats.reduce((acc, s) => acc + (Number(s.distanceToday) || 0), 0);

  return (
    // Main dashboard container with professional padding, background, and typography
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{color: '#2c3e50'}}>🛰️ Occamy Central Control</h2>
      
      {/* Top Summary Cards: Displays key performance indicators (KPIs) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={cardStyle}><h4>Total Distance</h4><p>{totalDistance} km</p></div>
        <div style={cardStyle}><h4>Meetings</h4><p>{totalMeetings}</p></div>
        <div style={cardStyle}><h4>B2B Sales</h4><p>{b2bSales}</p></div>
        <div style={cardStyle}><h4>B2C Sales</h4><p>{b2cSales}</p></div>
      </div>

      {/* Ground Activity Log: A table to display verifiable field activities */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3>Ground Activity Log (Verifiable)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {/* Table Header: Columns aligned with the Hackathon's verification requirements */}
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
            {/* Map through the stats array to dynamically generate table rows */}
            {stats.map(s => (
              <tr key={s.id || Math.random()} style={{borderBottom: '1px solid #eee'}}>
                <td style={tdStyle}>{s.date || 'N/A'}</td>
                <td style={tdStyle}>{s.officer || 'N/A'}</td>
                <td style={tdStyle}><strong>{s.type}</strong></td>
                
                {/* Distance Logic: Display travel distance if available, otherwise show a hyphen */}
                <td style={tdStyle}>{s.distanceToday ? `${s.distanceToday} km` : '-'}</td>
                
                {/* Village Logic: Fallback to payload data if the primary village field is empty */}
                <td style={tdStyle}>{s.village || s.payload?.village || 'N/A'}</td>
                
                {/* GPS Logic: Display Latitude and Longitude fixed to 2 decimal places for better readability */}
                <td style={tdStyle}>
                  {s.location?.lat ? `${s.location.lat.toFixed(2)}, ${s.location.lng.toFixed(2)}` : 'N/A'}
                </td>
                
                {/* Proof Logic: Render a clickable link for photos (handles both Base64 and Server URLs) */}
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
 
// --- STYLING (Professional CSS-in-JS objects for UI consistency) ---
const cardStyle = { flex: 1, padding: '20px', background: '#fff', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const tdStyle = { padding: '12px' };

export default AdminDashboard; // Export the component for use in App.js