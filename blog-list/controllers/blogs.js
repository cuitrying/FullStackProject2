const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user') // Import User model
// const { userExtractor } = require('../middleware/auth')

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
  // blogsRouter.post('/', userExtractor, async (request, response) => {
    // POST a new blog
blogsRouter.post('/', async (request, response) => {
  const body = request.body;
  
  // Check if user is authenticated
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  // Validate required fields
  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' });
  }
  
  // Get the user from the request (set by userExtractor middleware)
  const user = request.user;
  
  // if (!user) {
  //   return response.status(401).json({ error: 'token missing or invalid' });
  // }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  });
  
  const savedBlog = await blog.save();
  
  // Update the user's blogs array
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  
  // Populate the user information before returning
  const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 });
  
  response.status(201).json(populatedBlog);
})
// blog
// .save()
// .then(result => {
//   response.status(201).json(result)
// })

// DELETE a blog post by ID
// blogsRouter.delete('/:id', userExtractor, async (request, response) => {
blogsRouter.delete('/:id', async (request, response) => {
  try {
    // Check if user is authenticated
    if (!request.user) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }

    const blog = await Blog.findById(request.params.id);
    
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' });
    }
    
    // Check if the user is the creator of the blog
    if (blog.user && blog.user.toString() !== request.user.id.toString()) {
      return response.status(403).json({ error: 'only the creator can delete a blog' });
    }
    
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: 'Invalid ID or error deleting blog' });
  }
})

// UPDATE a blog post by ID
blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body;

  const blog = {
    title,
    author,
    url,
    likes
  };

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id, 
    blog, 
    { new: true, runValidators: true, context: 'query' }
  ).populate('user', { username: 1, name: 1 });
  
  response.json(updatedBlog);
})

module.exports = blogsRouter 