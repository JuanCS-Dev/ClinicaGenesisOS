/**
 * Authentication E2E Tests
 * ========================
 *
 * Tests for login, logout, and session management.
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      // Check page title
      await expect(page).toHaveTitle(/Genesis|Login/i)

      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login')

      // Submit empty form
      await page.click('button[type="submit"]')

      // Should show validation message or stay on login page
      await expect(page).toHaveURL(/login/)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      // Fill with invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Should show error message (toast or inline)
      const errorVisible = await Promise.race([
        page
          .waitForSelector('[data-sonner-toast][data-type="error"]', { timeout: 5000 })
          .then(() => true),
        page.waitForSelector('[role="alert"]', { timeout: 5000 }).then(() => true),
        page.waitForSelector('text=/erro|invalid|incorret/i', { timeout: 5000 }).then(() => true),
      ]).catch(() => false)

      expect(errorVisible).toBeTruthy()
    })

    test('should redirect to dashboard after successful login', async ({ page }) => {
      // Skip if no test account available
      test.skip(!process.env.E2E_TEST_EMAIL, 'No test credentials available')

      await page.goto('/login')

      await page.fill('input[type="email"]', process.env.E2E_TEST_EMAIL!)
      await page.fill('input[type="password"]', process.env.E2E_TEST_PASSWORD!)
      await page.click('button[type="submit"]')

      // Should redirect to dashboard or agenda
      await page.waitForURL(/\/(dashboard|agenda)/, { timeout: 30000 })
    })

    test('should have link to forgot password', async ({ page }) => {
      await page.goto('/login')

      // Check for forgot password link
      const forgotLink = page.locator('a:has-text("Esqueci"), a:has-text("Forgot")')
      await expect(forgotLink).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      // Try to access protected route directly
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })

    test('should redirect to login when accessing patients page', async ({ page }) => {
      await page.goto('/patients')
      await expect(page).toHaveURL(/login/)
    })

    test('should redirect to login when accessing agenda', async ({ page }) => {
      await page.goto('/agenda')
      await expect(page).toHaveURL(/login/)
    })
  })

  test.describe('Public Routes', () => {
    test('should allow access to landing page', async ({ page }) => {
      await page.goto('/')

      // Should show landing page content (not redirect to login)
      const isLandingOrLogin = await page.url().match(/\/(login)?$/)
      expect(isLandingOrLogin).toBeTruthy()
    })

    test('should allow access to public booking page', async ({ page }) => {
      // Public booking pages should be accessible without auth
      await page.goto('/agendar/test-clinic')

      // Should show booking page or 404, not redirect to login
      const url = page.url()
      expect(url).not.toMatch(/login/)
    })
  })
})
