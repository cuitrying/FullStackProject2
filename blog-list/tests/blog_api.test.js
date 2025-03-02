const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { beforeEach, describe, test, afterAll } = require('node:test')
const assert = require('node:assert')

let token = null
let userId = null

const initialBlogs = [
  {
    title: 'Test Blog 1',
    author: 'Test Author 1',
    url: 'http://test1.com',
    likes: 5
  },
  {
    title: 'Test Blog 2',
    author: 'Test Author 2',
    url: 'http://test2.com',
    likes: 10
  }
]

beforeEach(async () => {
//     await Blog.deleteMany({}) // Clear the database before each test
//   const blog = new Blog({
//     title: 'Test Blog',
//     author: 'Test Author',
//     url: 'http://testblog.com',
//     likes: 0
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create a test user
  const passwordHash = await bcrypt.hash('testpass', 10)
  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash
  })
  const savedUser = await user.save()
  userId = savedUser._id

  // Get token for test user
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'testpass'
    })
  token = loginResponse.body.token

//   describe('GET /api/blogs', () => {
//     test('returns the correct amount of blog posts in JSON format', async () => {
//       const response = await request(app).get('/api/blogs')
//       assert.strictEqual(response.status, 200)
//       assert.strictEqual(response.type, 'application/json')
//       assert.strictEqual(response.body.length, 1) // Expecting 1 blog post
//     })
  // Create initial blogs with user reference
  const blogObjects = initialBlogs.map(blog => new Blog({
    ...blog,
    user: userId
  }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

// test('blog posts have an id property', async () => {
//     const response = await request(app).get('/api/blogs')
//     const blog = response.body[0]
//     assert.strictEqual(typeof blog.id, 'string') // Check that id is a string
//     assert.ok(blog.id) // Ensure id exists
//   })

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data and token', async () => {
    const newBlog = {
      title: 'Test Blog 3',
      author: 'Test Author 3',
      url: 'http://test3.com',
      likes: 15
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain('Test Blog 3')
  })

  test('fails with status code 401 if token is not provided', async () => {
    const newBlog = {
      title: 'Test Blog 3',
      author: 'Test Author 3',
      url: 'http://test3.com',
      likes: 15
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })

  test('likes defaults to 0 if not provided', async () => {
    const newBlog = {
        // title: 'Blog to Delete',
        // author: 'Author',
        // url: 'http://deleteblog.com',
        // likes: 0
      title: 'Test Blog No Likes',
      author: 'Test Author',
      url: 'http://testnolike.com'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    expect(response.body.likes).toBe(0)
  })

  test('fails with status code 400 if title or url is missing', async () => {
    const newBlog = {
      author: 'Test Author'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid and user is creator', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

  test('fails with status code 401 if token is not provided', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('succeeds with valid data', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await Blog.find({})
    const updated = blogsAtEnd.find(b => b.id === blogToUpdate.id)
    expect(updated.likes).toBe(blogToUpdate.likes + 1)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
}) 