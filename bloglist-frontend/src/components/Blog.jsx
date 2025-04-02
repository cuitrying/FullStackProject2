import { useState } from 'react'
import PropTypes from 'prop-types'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlog, user, handleRemove }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)
  // Track the blog state locally for immediate UI updates
  const [blogObject, setBlogObject] = useState(blog)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleVisibility = () => {
    setDetailsVisible(!detailsVisible)
  }

  const handleLike = async () => {
    try {
      // Create a copy of the blog for update
      const blogToUpdate = {
        title: blogObject.title,
        author: blogObject.author,
        url: blogObject.url,
        likes: blogObject.likes + 1,
        // Send only the user ID as required by the backend
        user: blogObject.user.id || blogObject.user._id
      }
      
      // Send the request to the backend
      const updatedBlog = await blogService.update(blogObject.id, blogToUpdate)
      
      // Important: Ensure the user object is preserved correctly
      // If the response doesn't include full user info, maintain the original user object
      const updatedBlogWithUser = {
        ...updatedBlog,
        user: updatedBlog.user.name ? updatedBlog.user : blogObject.user
      }
      
      // Update the local state
      setBlogObject(updatedBlogWithUser)
      
      // If a callback for updating blogs in the parent component exists, call it
      if (updateBlog) {
        updateBlog(updatedBlogWithUser)
      }
    } catch (error) {
      console.error('Error updating likes:', error)
    }
  }

  // Check if the current user is the creator of this blog
  const isCreator = user && blogObject.user && 
    (user.username === blogObject.user.username || 
     user.id === blogObject.user.id ||
     user._id === blogObject.user._id)

  return (
    <div style={blogStyle}>
      <div>
        {blogObject.title} {blogObject.author}
        <button onClick={toggleVisibility}>
          {detailsVisible ? 'hide' : 'view'}
        </button>
      </div>
      {detailsVisible && (
        <div>
          <div>{blogObject.url}</div>
          <div>
            likes {blogObject.likes} 
            <button onClick={handleLike}>like</button>
          </div>
          <div>{blogObject.user ? blogObject.user.name : ''}</div>
          
          {/* Show remove button only if the current user created this blog */}
          {isCreator && (
            <button 
              onClick={() => handleRemove(blogObject.id, blogObject.title, blogObject.author)}
              style={{ backgroundColor: 'blue', color: 'white' }}
            >
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Define PropTypes
Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      _id: PropTypes.string,
      name: PropTypes.string,
      username: PropTypes.string
    })
  }).isRequired,
  updateBlog: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    token: PropTypes.string
  }).isRequired,
  handleRemove: PropTypes.func.isRequired
}

export default Blog