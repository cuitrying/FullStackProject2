const request = require('supertest')
const app = require('../app')
const User = require('../models/user')
const { beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')

beforeEach(async () => {
  await User.deleteMany({}) // Clear the database before each test
})

describe('POST /api/users', () => {
  test('successfully creates a new user', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'password123'
    }

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201) // Expecting a 201 Created status

    assert.strictEqual(response.body.username, newUser.username)
    assert.strictEqual(response.body.name, newUser.name)
    assert.ok(response.body.id) // Check if id exists
  })

  test('responds with 400 if username or password is missing', async () => {
    const newUser = {
      name: 'Test User',
      password: 'password123'
    }

    await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400) // Expecting a 400 Bad Request status
  })

  test('responds with 400 if username is less than 3 characters', async () => {
    const newUser = {
      username: 'ab', // Invalid username
      name: 'Test User',
      password: 'password123'
    }

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400) // Expecting a 400 Bad Request status

    assert.strictEqual(response.body.error, 'Username and password must be at least 3 characters long')
  })

  test('responds with 400 if password is less than 3 characters', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'ab' // Invalid password
    }

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400) // Expecting a 400 Bad Request status

    assert.strictEqual(response.body.error, 'Username and password must be at least 3 characters long')
  })

  test('responds with 400 if username is not unique', async () => {
    const newUser1 = {
      username: 'testuser',
      name: 'Test User 1',
      password: 'password123'
    }

    const newUser2 = {
      username: 'testuser', // Duplicate username
      name: 'Test User 2',
      password: 'password456'
    }

    await request(app)
      .post('/api/users')
      .send(newUser1)
      .expect(201) // First user creation should succeed

    const response = await request(app)
      .post('/api/users')
      .send(newUser2)
      .expect(400) // Expecting a 400 Bad Request status

    assert.strictEqual(response.body.error, 'Username must be unique')
  })
})

describe('GET /api/users', () => {
  test('returns all users', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'password123'
    }

    await request(app)
      .post('/api/users')
      .send(newUser)

    const response = await request(app).get('/api/users')
    assert.strictEqual(response.status, 200)
    assert.strictEqual(response.body.length, 1) // Expecting 1 user
    assert.strictEqual(response.body[0].username, newUser.username)
    assert.strictEqual(response.body[0].name, newUser.name)
    assert.ok(response.body[0].id) // Check if id exists
  })
}) 