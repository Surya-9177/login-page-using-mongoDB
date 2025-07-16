require('dotenv').config()
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const User = require("./models/User")

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB")
  app.listen(PORT, () => {
    console.log(`��� Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error("❌ MongoDB connection failed:", err)
})

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body
  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) return res.status(400).json("User already exists")

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ username, email, password: hashedPassword })
    await newUser.save()
    res.status(200).json("User created successfully")
  } catch (err) {
    res.status(500).json("Error creating user")
  }
})

app.post("/login", async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ error: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ error: "Invalid password" })

    const token = jwt.sign({ username }, "MY_SECRET_TOKEN")
    res.json({ jwtToken: token })
  } catch (err) {
    res.status(500).json({ error: "Login failed" })
  }
})
