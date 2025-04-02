import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Blog from '../components/Blog'
import blogService from '../services/blogs'

// Mock the blog service
vi.mock('../services/blogs', () => {
  return {
    default: {
      update: vi.fn().mockResolvedValue({})
    }
  }
})

describe('<Blog />', () => {
  let blog, mockUpdateBlog, mockHandleRemove, user

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    blog = {
      id: '12345',
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'https://testurl.com',
      likes: 5,
      user: {
        id: 'user123',
        name: 'Test User',
        username: 'testuser'
      }
    }

    mockUpdateBlog = vi.fn()
    mockHandleRemove = vi.fn()
    user = {
      id: 'user123',
      name: 'Test User',
      username: 'testuser'
    }

    render(
      <Blog 
        blog={blog} 
        updateBlog={mockUpdateBlog} 
        user={user} 
        handleRemove={mockHandleRemove} 
      />
    )
  })

  test('renders title and author but not url or likes by default', () => {
    // Check that title and author are visible
    const titleAuthor = screen.getByText(`${blog.title} ${blog.author}`)
    expect(titleAuthor).toBeInTheDocument()

    // URL and likes should not be visible by default
    const urlElement = screen.queryByText(blog.url)
    expect(urlElement).toBeNull()

    const likesElement = screen.queryByText(`likes ${blog.likes}`)
    expect(likesElement).toBeNull()
  })

  test('url and likes are shown when the view button is clicked', () => {
    // Find and click the view button
    const viewButton = screen.getByText('view')
    fireEvent.click(viewButton)

    // After clicking, URL and likes should be visible
    const urlElement = screen.getByText(blog.url)
    expect(urlElement).toBeInTheDocument()

    const likesElement = screen.getByText(`likes ${blog.likes}`)
    expect(likesElement).toBeInTheDocument()
  })

  test('like button clicked twice calls event handler twice', async () => {
    // First, click the view button to make the like button visible
    const viewButton = screen.getByText('view')
    fireEvent.click(viewButton)

    // Find the like button 
    const likeButton = screen.getByText('like')
    
    // Mock the blogService update to resolve with an updated blog
    blogService.update.mockImplementation(() => {
      return Promise.resolve({
        ...blog,
        likes: blog.likes + 1,
        user: blog.user
      })
    })
    
    // Click the like button twice
    fireEvent.click(likeButton)
    fireEvent.click(likeButton)
    
    // Check that the blog service update method was called twice
    expect(blogService.update.mock.calls).toHaveLength(2)
  })
}) 