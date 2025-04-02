import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import BlogForm from '../components/BlogForm'

describe('<BlogForm />', () => {
  test('calls createBlog with the right details when a new blog is created', () => {
    // Mock function for createBlog
    const createBlogMock = vi.fn()
    
    // Test blog details
    const newBlog = {
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'https://testurl.com'
    }
    
    // Render the component
    const { container } = render(<BlogForm createBlog={createBlogMock} />)
    
    // Get input fields by name attribute
    const titleInput = container.querySelector('input[name="Title"]')
    const authorInput = container.querySelector('input[name="Author"]')
    const urlInput = container.querySelector('input[name="Url"]')
    
    // Fill in the form fields
    fireEvent.change(titleInput, { target: { value: newBlog.title } })
    fireEvent.change(authorInput, { target: { value: newBlog.author } })
    fireEvent.change(urlInput, { target: { value: newBlog.url } })
    
    // Submit the form
    const submitButton = screen.getByText('create')
    fireEvent.click(submitButton)
    
    // Check that createBlog was called with the right details
    expect(createBlogMock.mock.calls).toHaveLength(1)
    expect(createBlogMock.mock.calls[0][0]).toEqual(newBlog)
  })
}) 