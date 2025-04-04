// tests/blog_app.spec.js
const { test, expect, beforeEach, describe } = require('@playwright/test');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Reset the database
    await request.post('http://localhost:3003/api/testing/reset');
    
    // Create a test user for the backend
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser1',
        password: 'password123'
      }
    });
    
    // Navigate to the app
    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    // Check for login form elements
    await expect(page.getByText('Log in to application')).toBeVisible();
    await expect(page.getByText('username')).toBeVisible();
    await expect(page.getByText('password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // Fill in the login form
      await page.fill('input[name="Username"]', 'testuser1');
      await page.fill('input[name="Password"]', 'password123');
      await page.getByRole('button', { name: 'login' }).click();
      
      // Check that login was successful
      await expect(page.getByText('Test User logged in', { exact: false })).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      // Fill in the login form with wrong password
      await page.fill('input[name="Username"]', 'testuser1');
      await page.fill('input[name="Password"]', 'wrongpassword');
      await page.getByRole('button', { name: 'login' }).click();
      
      // Check for error notification - using a more specific selector
      const notification = page.locator('div[style*="color: red"]').filter({ hasText: 'wrong username or password' });
      await expect(notification).toBeVisible();
      await expect(notification).toHaveCSS('color', 'rgb(255, 0, 0)');
      
      // Verify we're still at login page
      await expect(page.getByText('Log in to application')).toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      // Login
      await page.fill('input[name="Username"]', 'testuser1');
      await page.fill('input[name="Password"]', 'password123');
      await page.getByRole('button', { name: 'login' }).click();
      
      // Verify login was successful - using a more flexible selector to match the actual UI
      await expect(page.getByText('Test User logged in', { exact: false })).toBeVisible();
    });

    test('a new blog can be created', async ({ page }) => {
      // Click on the button to show the blog form
      await page.getByRole('button', { name: 'create new blog' }).click();
      
      // Fill in the blog form
      await page.fill('input[name="Title"]', 'Test Blog Title');
      await page.fill('input[name="Author"]', 'Test Author');
      await page.fill('input[name="Url"]', 'http://testblog.com');
      
      // Submit the form
      await page.getByRole('button', { name: 'create' }).click();
      
      // The notification might still be showing "Welcome Test User!" from login
      // Let's wait for the blog to be visible in the list instead of checking notification
      
      // Wait for the blog to appear in the list - using more precise selector
      const blogElement = page.locator('div')
        .filter({ hasText: /Test Blog Title.*Test Author/ })
        .first();
      
      await expect(blogElement).toBeVisible({ timeout: 10000 });
    });

    test('a blog can be liked', async ({ page }) => {
      // Create blog
      await page.getByRole('button', { name: 'create new blog' }).click();
      
      const uniqueId = Date.now().toString().slice(-4);
      const blogTitle = `Like Test Blog ${uniqueId}`;
      const blogAuthor = `Like Tester ${uniqueId}`;
      
      await page.fill('input[name="Title"]', blogTitle);
      await page.fill('input[name="Author"]', blogAuthor);
      await page.fill('input[name="Url"]', 'http://liketestblog.com');
      
      // Submit and wait for notification
      await page.getByRole('button', { name: 'create' }).click();
      
      // Wait for success notification and verify blog creation message
      const notification = page.locator('div[style*="color: green"]');
      await expect(notification).toBeVisible({ timeout: 10000 });
      await expect(notification).toContainText(`a new blog ${blogTitle} by ${blogAuthor} added`);
      
      // Wait for notification to disappear
      await expect(notification).not.toBeVisible({ timeout: 10000 });
      
      // Find the blog container - using a more specific selector
      const blogContainer = page.locator('div[style*="border: solid"]')
        .filter({ hasText: new RegExp(`${blogTitle}.*${blogAuthor}`) })
        .first();
      
      await expect(blogContainer).toBeVisible({ timeout: 10000 });
      
      // Click view button and wait for expanded content
      await blogContainer.getByRole('button', { name: 'view' }).click();
      
      // Wait for the expanded content to be visible
      await expect(
        blogContainer.locator('div').filter({ 
          hasText: new RegExp(`${blogTitle}.*${blogAuthor}.*http://liketestblog.com`) 
        })
      ).toBeVisible({ timeout: 5000 });
      
      // Get the likes count using a more specific selector
      const likesText = await blogContainer
        .locator('div')
        .filter({ hasText: /^likes \d+$/ })
        .first()
        .textContent();
      
      const initialLikes = parseInt(likesText.match(/\d+/)[0]);
      console.log(`Initial likes: ${initialLikes}`);
      
      // Click the like button
      await blogContainer.getByRole('button', { name: 'like' }).click();
      
      // Wait and verify likes increased using a more precise approach
      await expect(async () => {
        const updatedLikesText = await blogContainer
          .locator('div')
          .filter({ hasText: /^likes \d+$/ })
          .first()
          .textContent();
        
        const newLikes = parseInt(updatedLikesText.match(/\d+/)[0]);
        console.log(`New likes: ${newLikes}`);
        expect(newLikes).toBe(initialLikes + 1);
      }).toPass({ timeout: 5000 });
    });
  });
});