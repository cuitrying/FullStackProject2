import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: null, type: null })
  
  const blogFormRef = useRef()

  const fetchBlogs = async () => {
    try {
      const blogs = await blogService.getAll()
      console.log('Fetched blogs:', blogs)
      setBlogs(blogs)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      showNotification('Failed to fetch blogs', 'error')
    }
  }

  // Load blogs when component mounts
  useEffect(() => {
    console.log('Initial blog fetch')
    fetchBlogs()
  }, [])

  // Check if user is already logged in (in local storage)
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      console.log('Found user in localStorage:', user)
      setUser(user)
      blogService.setToken(user.token)
      // Fetch blogs again after setting the token
      fetchBlogs()
    }
  }, [])

  // Function to show notification
  const showNotification = (message, type) => {
    setNotification({ message, type })
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      setNotification({ message: null, type: null })
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    
    try {
      console.log('Logging in with:', username)
      const user = await loginService.login({
        username, password,
      })
      
      console.log('Login successful:', user)
      
      // Save user to local storage
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      showNotification(`Welcome ${user.name}!`, 'success')
      
      // Fetch blogs again after successful login
      fetchBlogs()
    } catch (exception) {
      console.error('Login failed:', exception)
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    console.log('Logging out')
    // Remove user from local storage
    window.localStorage.removeItem('loggedBlogappUser')
    // Set user state to null
    setUser(null)
    // Clear token from blog service
    blogService.setToken(null)
    showNotification('Logged out successfully', 'success')
  }

  const addBlog = async (blogObject) => {
    try {
      const newBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(newBlog))
      
      // Hide the form after successful blog creation
      blogFormRef.current.toggleVisibility()
      
      showNotification(`a new blog ${blogObject.title} by ${blogObject.author} added`, 'success')
    } catch (exception) {
      console.error('Error creating blog:', exception)
      showNotification('Failed to create blog', 'error')
    }
  }

  const updateBlog = (updatedBlog) => {
    setBlogs(
      blogs.map(blog => 
        blog.id === updatedBlog.id 
          ? { 
              ...updatedBlog,
              // Ensure user information is preserved
              user: updatedBlog.user || blog.user 
            } 
          : blog
      )
    )
  }

  const removeBlog = async (id, title, author) => {
    try {
      // Use window.confirm to ask for confirmation
      if (window.confirm(`Remove blog ${title} by ${author}?`)) {
        await blogService.remove(id)
        
        // Update state to remove the deleted blog
        setBlogs(blogs.filter(blog => blog.id !== id))
        
        showNotification(`Blog '${title}' by ${author} was deleted successfully`, 'success')
      }
    } catch (error) {
      console.error('Error removing blog:', error)
      showNotification('Failed to remove blog', 'error')
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={notification.message} type={notification.type} />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  console.log('Rendering blogs:', blogs)
  
  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification.message} type={notification.type} />
      <p>
        {user.name} logged in 
        <button onClick={handleLogout}>logout</button>
      </p>
      
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      
      {blogs
        .sort((a, b) => b.likes - a.likes) // Sort blogs by likes in descending order
        .map(blog =>
          <Blog 
            key={blog.id} 
            blog={blog} 
            updateBlog={updateBlog}
            user={user}
            handleRemove={removeBlog}
          />
        )}
    </div>
  )
}

export default App