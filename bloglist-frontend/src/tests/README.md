# Testing the Blog List Frontend

This directory contains tests for the Blog List frontend components.

## Test Files

- `Blog.test.jsx`: Tests for the Blog component
  - Verifies that the component displays blog titles and authors but not URLs or likes by default (Exercise 5.13)
  - Tests that the URL and number of likes are shown when the view button is clicked (Exercise 5.14)
  - Tests that if the like button is clicked twice, the event handler is called twice (Exercise 5.15)

- `BlogForm.test.jsx`: Tests for the BlogForm component
  - Tests that the form correctly calls the event handler with right details when creating a new blog (Exercise 5.16)

## Running Tests

Run tests with:

```
npm test
```

Run tests in watch mode:

```
npm run test:watch
```

## Testing Stack

- Vitest: Test runner integrated with Vite
- React Testing Library: Testing utilities for React components
- jest-dom: Custom DOM element matchers