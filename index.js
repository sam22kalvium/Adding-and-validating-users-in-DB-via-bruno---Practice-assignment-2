require("dotenv").config(); // Load environment variables
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const app = express();
const port = 3010;

app.use(express.json()); // Middleware to parse JSON request body

// Connect to MongoDB using .env variable
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
});

const User = mongoose.model("User", userSchema);

// Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.json({ message: "Login successful!", user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
