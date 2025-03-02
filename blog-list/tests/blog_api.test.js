const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

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

beforeAll(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
});

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  // Create a test user
  const passwordHash = await bcrypt.hash('testpass', 10);
  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash,
  });
  const savedUser = await user.save();
  userId = savedUser._id;

  // Get token for test user
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'testpass',
    });
  token = loginResponse.body.token;

  // Create initial blogs with user reference
  const blogObjects = initialBlogs.map((blog) => new Blog({
    ...blog,
    user: userId, // Associate each blog with the user
  }));
  
  // Save blogs and update user's blogs array
  const savedBlogs = await Promise.all(blogObjects.map(blog => blog.save()));
  
  // Update the user's blogs array with all blog IDs
  const blogIds = savedBlogs.map(blog => blog._id);
  await User.findByIdAndUpdate(userId, { blogs: blogIds });
});

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

describe('Blog creation and retrieval', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create a test user with a unique username
    const passwordHash = await bcrypt.hash('testpass', 10);
    const user = new User({
      username: `testuser_${Date.now()}`, // Add timestamp to make it unique
      name: 'Test User',
      passwordHash,
    });
    await user.save();
  });
  
  test('successfully creates a new blog with a creator', async () => {
    // Get a user from the database
    const user = await User.findOne();
    
    // Get a token for the user
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: user.username,
        password: 'testpass',
      });
    const token = loginResponse.body.token;
    
    const newBlog = {
      title: 'Test Blog with Creator',
      author: 'Test Author',
      url: 'http://testblog.com',
      likes: 5
    };
    
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    
    // Check that the created blog has a creator
    expect(response.body.user).toBeDefined();
    expect(response.body.user.username).toBeDefined();
    expect(response.body.user.name).toBeDefined();
  });
  
  test('retrieves all blogs with creator information', async () => {
    // Get a user from the database
    const user = await User.findOne();
    
    // Create a blog with the user as creator
    const blog = new Blog({
      title: 'Test Blog for Creator Info',
      author: 'Test Author',
      url: 'http://testblog.com',
      likes: 5,
      user: user._id
    });
    const savedBlog = await blog.save();
    
    // Update the user's blogs array
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    // Find the blog we just created in the response
    const createdBlog = response.body.find(b => b.id === savedBlog._id.toString());
    
    // Check that the blog has creator information
    expect(createdBlog).toBeDefined();
    expect(createdBlog.user).toBeDefined();
    expect(createdBlog.user.username).toBeDefined();
    expect(createdBlog.user.name).toBeDefined();
  });
})

describe('when there are blogs in the database', () => {
  test('blogs are returned with creator information', async () => {
    const response = await api.get('/api/blogs');
    
    // Check that blogs have creator information
    expect(response.body[0].user).toBeDefined();
    expect(response.body[0].user.username).toBeDefined();
    expect(response.body[0].user.name).toBeDefined();
  });

  test('new blog is created with a creator', async () => {
    const newBlog = {
      title: 'Test Blog with Creator',
      author: 'Test Author',
      url: 'http://testblog.com',
      likes: 5
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    // Check that the created blog has a creator
    expect(response.body.user).toBeDefined();
    expect(response.body.user.username).toBeDefined();
    expect(response.body.user.name).toBeDefined();
  });
})

afterAll(async () => {
  await mongoose.connection.close();
}, 10000); // Add a timeout value

// afterAll(async () => {
//   await mongoose.connection.close()
// }) 