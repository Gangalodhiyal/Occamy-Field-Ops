function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}


const express = require("express");
const app = express();

app.use(express.json());

let currentOfficer = null;
let currentDay = null;
let meetings = [];

/* ================= LOGIN ================= */
app.post("/api/login", (req, res) => {
  const { officerId, name } = req.body;

  if (!officerId || !name) {
    return res.status(400).json({
      message: "Officer ID and name required"
    });
  }

  currentOfficer = {
    officerId,
    name,
    loginTime: new Date()
  };

  res.json({
    message: "Login successful",
    officer: currentOfficer
  });
});

/* ================= START DAY ================= */
app.post("/api/activity/start-day", (req, res) => {

  // ❌ Start day without login
  if (!currentOfficer) {
    return res.status(401).json({
      message: "Login required before starting day"
    });
  }

  // ❌ Double start blocked
  if (currentDay) {
    return res.status(400).json({
      message: "Day already started"
    });
  }

  const { lat, lng } = req.body;

  // ❌ GPS mandatory
  if (lat == null || lng == null) {
    return res.status(400).json({
      message: "GPS required to start day"
    });
  }

  currentDay = {
    startTime: new Date(),       // ✅ auto time
    startLocation: { lat, lng }  // ✅ auto GPS
  };

  meetings = [];

  res.json({
    message: "Day started successfully",
    startTime: currentDay.startTime
  });
});

/* ================= LOG MEETING ================= */
app.post("/api/activity/log-meeting", (req, res) => {

  // ❌ Meeting without login
  if (!currentOfficer) {
    return res.status(401).json({
      message: "Login required"
    });
  }

  // ❌ Meeting without start day
  if (!currentDay) {
    return res.status(400).json({
      message: "Start day before logging meeting"
    });
  }

  const { type, lat, lng, notes, photo } = req.body;

  // ❌ Wrong meeting type
  const allowedTypes = ["Farmer", "Distributor"];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      message: "Meeting type must be Farmer or Distributor"
    });
  }

  // ❌ GPS mandatory
  if (lat == null || lng == null) {
    return res.status(400).json({
      message: "GPS required for meeting"
    });
  }

  const meeting = {
    type,
    location: { lat, lng },
    notes: notes || "",
    photo: photo || null,   // ✅ photo proof supported (dummy)
    time: new Date()        // ✅ auto timestamp
  };

  meetings.push(meeting);

  res.json({
    message: "Meeting logged successfully",
    meeting
  });
});

/* ================= END DAY ================= */
app.post("/api/activity/end-day", (req, res) => {

  // ❌ End day without login
  if (!currentOfficer) {
    return res.status(401).json({
      message: "Login required"
    });
  }

  let totalDistance = 0;

for (let i = 1; i < meetings.length; i++) {
  totalDistance += calculateDistance(
    meetings[i - 1].location.lat,
    meetings[i - 1].location.lng,
    meetings[i].location.lat,
    meetings[i].location.lng
  );
}

  // ❌ End without start
  if (!currentDay) {
    return res.status(400).json({
      message: "Day not started"
    });
  }

  const endTime = new Date();

  const summary = {
  officerName: currentOfficer.name,
  startTime: currentDay.startTime,
  endTime,
  totalMeetings: meetings.length,
  totalDistance: totalDistance.toFixed(2) + " km"
};


  currentDay = null;
  meetings = [];

  res.json({
    message: "Day ended successfully",
    summary
    
  });
  
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});



