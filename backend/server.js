
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// in-memory location store
let locations = [];

// test route
app.get('/', (req, res) => {
  res.send('Occamy Tracker Backend is running');
});

// receive location
app.post('/location', (req, res) => {
  const { lat, lng, timestamp } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and Longitude required' });
  }

  const data = {
    lat,
    lng,
    timestamp: timestamp || Date.now()
  };

  locations.push(data);

  res.json({ message: 'Location stored', data });
});

// get all locations
app.get('/locations', (req, res) => {
  res.json(locations);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
