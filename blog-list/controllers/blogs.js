const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user') // Import User model
const { userExtractor } = require('../middleware/auth')

// blogsRouter.get('/', (request, response) => {
//   Blog
//     .find({})
//     .then(blogs => {
//       response.json(blogs)
//     })
// })
// GET all blogs
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 }) // Populate user info
  response.json(blogs)
})

// blogsRouter.post('/', (request, response) => {
  // POST a new blog
  // blogsRouter.post('/', async (request, response) => {
  blogsRouter.post('/', userExtractor, async (request, response) => {
  console.log(request.body); // Log the request body
  const { title, author, url, likes = 0 } = request.body

  // Validate required fields
  if (!title || !url) {
    return response.status(400).json({ error: 'Title and URL are required' })
  }

  // const user = await User.findOne() // Get the first user
  const user = request.user // Get user from token
  if (!user) {
    // return response.status(400).json({ error: 'No user found to associate with the blog' })
    return response.status(401).json({ error: 'Token missing or invalid' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user.id // Associate the blog with the user from the token
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs || []
    user.blogs.push(savedBlog._id)
    await user.save()
    
    // Populate user info before sending response
    const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })
    response.status(201).json(populatedBlog)
  } catch (error) {
    console.error(error); // Log the error
    response.status(400).json({ error: 'Error saving blog' })
  }
})
// blog
// .save()
// .then(result => {
//   response.status(201).json(result)
// })

// DELETE a blog post by ID
blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  try {
    const blog = await Blog.findById(id)
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }

    const user = request.user
    if (!user) {
      return response.status(401).json({ error: 'Token missing or invalid' })
    }

    if (blog.user.toString() !== user.id.toString()) {
      return response.status(403).json({ error: 'Only the creator can delete this blog' })
    }

    await Blog.findByIdAndDelete(id)
    // Remove blog reference from user's blogs array
    user.blogs = user.blogs.filter(b => b.toString() !== id.toString())
    await user.save()
    
    response.status(204).end()
  } catch (error) {
    // response.status(400).json({ error: 'Invalid ID' })
    console.error(error)
    response.status(400).json({ error: 'Invalid ID or error deleting blog' })
  }
})

// UPDATE a blog post by ID
blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const { title, author, url, likes } = request.body

  const updatedBlog = {
    title,
    author,
    url,
    likes
  }

  try {
    // const result = await Blog.findByIdAndUpdate(id, updatedBlog, { new: true, runValidators: true })
    const result = await Blog.findByIdAndUpdate(
      id, 
      updatedBlog, 
      { new: true, runValidators: true }
    ).populate('user', { username: 1, name: 1 })
    
    if (result) {
      response.json(result)
    } else {
      response.status(404).json({ error: 'Blog not found' })
    }
  } catch (error) {
    response.status(400).json({ error: 'Invalid data' })
  }
})

module.exports = blogsRouter 