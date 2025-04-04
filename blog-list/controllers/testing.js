const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

// Reset the database (delete all blogs and users)
router.post('/reset', async (request, response) => {
  try {
    await Blog.deleteMany({})
    await User.deleteMany({})
    
    response.status(204).end()
  } catch (error) {
    console.error('Error resetting database:', error)
    response.status(500).json({ error: 'Database reset failed' })
  }
})

// Create a test user after reset
router.post('/user', async (request, response) => {
  try {
    const { username, name, password } = request.body
    
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    const user = new User({
      username,
      name,
      passwordHash
    })
    
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    console.error('Error creating test user:', error)
    response.status(400).json({ error: error.message })
  }
})

// Health check to verify the testing API is working
router.get('/health', (request, response) => {
  response.status(200).send('Testing API is working')
})

module.exports = router
