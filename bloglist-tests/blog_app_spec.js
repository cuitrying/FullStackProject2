// tests/blog_app.spec.js
const { test, expect, beforeEach, describe } = require('@playwright/test');

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    // Check for login form elements
    await expect(page.getByText('Log in to application')).toBeVisible();
    await expect(page.getByText('username')).toBeVisible();
    await expect(page.getByText('password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();
  });
});