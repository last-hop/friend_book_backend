Backend Project Setup

This guide will help you set up and run the backend project on your local machine.

Prerequisites

Make sure you have the following tools installed:

Node.js (v14 or higher recommended)

MongoDB (Ensure MongoDB is running locally)

# setup Project 

git clone https://github.com/last-hop/git_backend.git

cd git_backend

npm install



# setup .env file 

MONGO_URI=mongodb://localhost:27017
JWT_SECRET=your_jwt_secret
PORT=5000


# Run the Backend Server

npm start

you should see similar 

# Server running on port 5000
# MongoDB connected...


