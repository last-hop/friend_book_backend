const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require('cors');
const userRoutes = require("./routes/userRoutes");
const app = express();




dotenv.config();


const mongoURI = "mongodb://localhost:27017";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use(express.json())

app.use(cors({ origin: 'http://localhost:3000' })); ;

// Routes
app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
