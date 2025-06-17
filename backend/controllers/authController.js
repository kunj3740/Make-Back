const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const axios = require('axios')

exports.signup = async (req, res) => {
  try {
    console.log("in signup");
    const { name, username, password } = req.body
    const existingUser = await User.findOne({ username })
    if (existingUser) return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({ name, username, password: hashedPassword })

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET)
    res.json(token)
  } catch (err) {
    res.status(500).json({ message: 'Signup error' })
  }
}

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET)
    res.json(token)
  } catch (err) {
    res.status(500).json({ message: 'Signin error' })
  }
}

exports.googleAuth = async (req, res) => {
  const { token } = req.body

  if (!token) return res.status(400).json({ message: 'Token is required' })

  try {
    const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
    const { email, name } = googleRes.data

    if (!email) return res.status(400).json({ message: 'Invalid Google token' })

    let user = await User.findOne({ username: email })

    if (!user) {
      user = await User.create({
        username: email,
        name: name || 'Google User',
        password: 'xyz@kunj3740',
      })
    }

    const jwtToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET
    )

    res.json({ token: jwtToken })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Google authentication failed' })
  }
}
