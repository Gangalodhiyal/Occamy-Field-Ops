const express = require('express');   // Express framework ko import kiya web server banane ke liye
const cors = require('cors');   // CORS ko import kiya taaki frontend (React) backend se connect ho sake
const fs = require('fs');    // File System module import kiya data (JSON) files ko read/write karne ke liye
const path = require('path');    // Path module import kiya files aur directories ka rasta manage karne ke liye

const app = express();   // Express app initialize ki

// Frontend (localhost:3000) ko backend se request bhejne ki permission di
app.use(cors({ origin: "http://localhost:3000", credentials: true })); 

// JSON data ki limit 15mb set ki taaki badi photos (Base64) server receive kar sake
app.use(express.json({ limit: '15mb' })); 

// activities.json file ka path set kiya jahan saara data store hoga
const DATA_FILE = path.join(__dirname, 'activities.json');

// Photos store karne ke liye folder ka path define kiya
const PHOTO_DIR = path.join(__dirname, 'photos');

// Agar 'photos' folder nahi hai, toh use create kar lo
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR);

// 'photos' folder ko public kiya taaki dashboard par images dikhayi ja sakein
app.use('/photos', express.static(PHOTO_DIR));

// Ek temporary variable jo 'Day Start' ke waqt odometer reading ko server ki memory mein rakhega
let startOdometer = 0;

// activities.json se data read karne ka function
const readData = () => {
    try {
        // Agar file exist karti hai toh JSON format mein return karo, nahi toh khali list [] bhejo
        return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];
    } catch (e) { return []; }
};

// Data ko wapas activities.json file mein save karne ka function
const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// POST API: Jab koi officer app se activity submit karta hai
app.post('/api/activities', (req, res) => {
    try {
        // Request body se saari zaroori fields nikali (Destructuring)
        const { type, payload, officer, lat, lng, village, photo } = req.body;

        const allData = readData();   // Purana saara data read kiya
        let distanceToday = 0;   // Travel distance calculate karne ke liye variable

        // ODOMETER CALCULATION LOGIC:
        if (type === 'Day Start') {
            // Agar din shuru hua hai, toh odometer reading save kar lo
            startOdometer = Number(payload.odometer) || 0;
        } 
        else if (type === 'Day End') {
            // Agar din khatam hua hai, toh current reading se start reading minus karke total distance nikal li
            const endReading = Number(payload.odometer) || 0;
            distanceToday = endReading - startOdometer;
        }

        // Ek naya object banaya jo ek activity ki poori details rakhta hai
        const newEntry = {
            id: Date.now(),    // Unique ID banane ke liye current timestamp use kiya
            officer: officer || "Unknown",    // Officer ka naam
            type: type,       // Activity ka type (Meeting/Sale/Start/End)
            location: { lat: lat || 0, lng: lng || 0 },       // GPS coordinates
            village: village || "N/A",    // Gaon ka naam
            payload: payload || {},    // Additional info (jaise odometer ya attendees)
            distanceToday: distanceToday,   // Calculate kiya gaya total safar
            photo: photo || null,   // Proof image
            timestamp: new Date().toISOString(), // Entry ka exact time
            date: new Date().toLocaleDateString('en-IN') // Bharat ke format mein date
        };

        allData.push(newEntry); // Nayi entry ko purane data list mein joda
        saveData(allData); // Poori list ko wapas file mein save kar diya
        
        // Response bheja ki data save ho gaya hai
        res.json({ success: true, distance: distanceToday });
    } catch (err) {
        console.error("Server Error:", err); // Agar koi error aaye toh console par print karo
        res.status(500).json({ error: "Internal Server Error" }); // Frontend ko error bhej do
    }
});

// GET API: Dashboard ke liye saara data fetch karne ka route
app.get("/api/activities", (req, res) => {
    res.json(readData()); // Jitna bhi data save hai wo JSON format mein bhej diya
});

// Server ko port 5000 par start kiya
app.listen(5000, () => console.log(" Server running on port 5000"));