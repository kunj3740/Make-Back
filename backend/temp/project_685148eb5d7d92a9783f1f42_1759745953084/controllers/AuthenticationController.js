const express = require('express');
const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }
    const userExists = await Users.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    const newUser = new Users({ username, email, password });
    await newUser.save();
    return res.status(201).json({ success: true, message: 'User registered successfully', data: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred during registration', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ success: true, data: { token, user: { id: user._id, email: user.email, name: user.username } }, message: 'Login successful' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred during login', error: error.message });
  }
};