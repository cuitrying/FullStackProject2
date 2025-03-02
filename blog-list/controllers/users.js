const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Create a new user
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  // Validate required fields
  if (!username || !password || !name) {
    return response.status(400).json({ error: 'Username, name, and password are required' })
  }

  // Validate username and password length
  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({ error: 'Username and password must be at least 3 characters long' })
  }

  // Check for unique username
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({ error: 'Username must be unique' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()
//   response.status(201).json(savedUser)
  // Generate a token
  const userForToken = {
    username: savedUser.username,
    id: savedUser._id
  }

  const token = jwt.sign(userForToken, process.env.JWT_SECRET) // Use .env

  response.status(201).json({ token, username: savedUser.username, name: savedUser.name })
})

// Get all users
usersRouter.get('/', async (request, response) => {
    // const users = await User.find({})
    const users = await User.find({}).populate('blogs', { title: 1, url: 1 })
  response.json(users)
})

module.exports = usersRouter 