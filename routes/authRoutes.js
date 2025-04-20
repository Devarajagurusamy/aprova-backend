const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// User Registration (For Testing)
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username, password: hashedPassword, role });
  await newUser.save();

  res.json({ message: "User registered successfully!" });
});

// User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token, role: user.role });
});

module.exports = router;
