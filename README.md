Occamy Field-Ops : Rural Tracking & Distribution System


Project Context :

Developed for the HaXplore Hackathon, this system addresses the critical problem of fragmented rural supply chains for Occamy Bioscience. It replaces unreliable WhatsApp-based tracking with a verifiable, data-driven mobile platform for field officers.


Technical Implementation (How it Works) :

1. Verifiable Proof of Action
GPS Integration: Every activity (Meeting/Sale/Sample) captures precise Latitude and Longitude using the browser's Geolocation API.

Photo Evidence: Mandatory photo capture for meetings ensures that the field officer is physically present at the village.

Odometer Logic: A unique "Day Start/End" feature that automatically calculates the total distance traveled based on odometer readings, preventing manual travel claim errors.

2. Mobile-First User Experience
Simplified UI: Large action buttons and minimal text entry designed for officers with varying levels of digital literacy.

Dynamic Role Switch: Built-in logic to switch between the Officer App and the Admin Dashboard via a secure login.

3. Admin Analytics Dashboard
Centralized Control: Real-time aggregation of ground data into a single view.

Key Metrics: Automated calculation of Total Distance, Total Meetings, and B2B vs B2C Sales split.

Activity Log: A comprehensive, auditable table with direct links to "Proof Photos" and GPS coordinates.


Tech Stack :

Frontend: React.js (State management with Hooks).

Backend: Node.js & Express.js (RESTful API architecture).

Storage: JSON-based flat-file database (activities.json) for rapid deployment and high portability.

Communication: Axios for seamless Frontend-Backend synchronization.


Architecture & Assumptions :

High Portability: The system uses a JSON file-store approach, making it easy to deploy on any server without complex database migrations.

Rural Connectivity: Image payloads are limited to 15MB to ensure the server handles rural network uploads without crashing.

Security: Implemented CORS and localStorage based session management for secure data handling.

Quick Setup :

Install Dependencies:

# Backend  : 
cd backend && npm install
# Frontend  :
cd frontend/occamy-ui && npm install
Start Server:

# In /backend
node server.js

# In /frontend/occamy-ui
npm start