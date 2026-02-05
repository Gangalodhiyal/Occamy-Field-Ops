const express = require('express');   // Import Express framework to create the web server
const cors = require('cors');         // Import CORS to allow communication between Frontend (React) and Backend
const fs = require('fs');             // Import File System module to handle JSON file read/write operations
const path = require('path');         // Import Path module to manage file and directory paths

const app = express();                // Initialize the Express application

// Enable CORS for the frontend running on localhost:3000 and allow credentials
app.use(cors({ origin: "http://localhost:3000", credentials: true })); 

// Set JSON payload limit to 15mb to handle large Base64 encoded images from the field
app.use(express.json({ limit: '15mb' })); 

// Define the path for the JSON file where all activity data will be persisted
const DATA_FILE = path.join(__dirname, 'activities.json');

// Define the directory path for storing uploaded proof photos
const PHOTO_DIR = path.join(__dirname, 'photos');

// Create the 'photos' directory if it does not already exist
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR);

// Serve the 'photos' folder as a static directory to make images accessible on the dashboard
app.use('/photos', express.static(PHOTO_DIR));

// Temporary server-side variable to track odometer reading during the 'Day Start' event
let startOdometer = 0;

/**
 * Function to read data from the local JSON file.
 * Returns an array of activities or an empty array if the file doesn't exist.
 */
const readData = () => {
    try {
        return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];
    } catch (e) { return []; }
};

/**
 * Function to write/save updated data back to the local JSON file.
 */
const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// POST Route: Triggered when an officer submits a new activity from the mobile app
app.post('/api/activities', (req, res) => {
    try {
        // Destructure required fields from the request body
        const { type, payload, officer, lat, lng, village, photo } = req.body;

        const allData = readData();   // Fetch existing data from the file
        let distanceToday = 0;        // Variable to store calculated travel distance

        // BUSINESS LOGIC: Odometer Calculation
        if (type === 'Day Start') {
            // Capture initial odometer reading when the work day begins
            startOdometer = Number(payload.odometer) || 0;
        } 
        else if (type === 'Day End') {
            // Calculate total distance by subtracting start reading from the end reading
            const endReading = Number(payload.odometer) || 0;
            distanceToday = endReading - startOdometer;
        }

        // Create a structured activity entry object
        const newEntry = {
            id: Date.now(),                          // Generate a unique ID using current timestamp
            officer: officer || "Unknown",           // Name of the field officer
            type: type,                              // Category of action (Meeting/Sale/Start/End)
            location: { lat: lat || 0, lng: lng || 0 }, // Verified GPS coordinates
            village: village || "N/A",               // Name of the target village
            payload: payload || {},                  // Additional dynamic data (e.g., attendees)
            distanceToday: distanceToday,            // Calculated distance (populated on Day End)
            photo: photo || null,                    // Base64 proof of physical presence
            timestamp: new Date().toISOString(),     // Precise ISO timestamp
            date: new Date().toLocaleDateString('en-IN') // Indian localized date format
        };

        allData.push(newEntry);       // Append the new entry to the data array
        saveData(allData);            // Persist the updated array to the JSON file
        
        // Respond with success and the calculated distance for UI confirmation
        res.json({ success: true, distance: distanceToday });
    } catch (err) {
        console.error("Server Error:", err);         // Log errors to server console for debugging
        res.status(500).json({ error: "Internal Server Error" }); // Send error response to frontend
    }
});

// GET Route: Fetch all recorded activities for the Admin Dashboard
app.get("/api/activities", (req, res) => {
    res.json(readData());             // Return the entire database as a JSON response
});

// Start the server on Port 5000
app.listen(5000, () => console.log("Server running on port 5000"));