/**
 * Playwright Test Fixtures
 * ========================
 *
 * Custom fixtures for authenticated testing and common utilities.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

import { test as base, expect, type Page } from '@playwright/test'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Test user credentials.
 */
interface TestUser {
  email: string
  password: string
  role: 'owner' | 'admin' | 'professional' | 'staff'
}

/**
 * Custom fixtures type.
 */
type AuthFixtures = {
  /** Page with authenticated session */
  authenticatedPage: Page
  /** Test user data */
  testUser: TestUser
}

// =============================================================================
// TEST DATA
// =============================================================================

/**
 * Default test user (owner role).
 * In production, these would be seeded in Firebase emulator.
 */
const DEFAULT_TEST_USER: TestUser = {
  email: 'test@clinicagenesis.com',
  password: 'TestPassword123!',
  role: 'owner',
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Wait for app to be fully loaded.
 */
async function waitForAppReady(page: Page): Promise<void> {
  // Wait for React to hydrate
  await page.waitForFunction(() => {
    const root = document.getElementById('root')
    return root && root.children.length > 0
  })

  // Wait for any loading spinners to disappear
  await page
    .waitForSelector('[data-testid="loading-spinner"]', {
      state: 'hidden',
      timeout: 10000,
    })
    .catch(() => {
      // Loading spinner may not be present, that's OK
    })
}

/**
 * Login via UI.
 */
async function loginViaUI(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')
  await waitForAppReady(page)

  // Fill login form
  await page.fill('input[type="email"]', user.email)
  await page.fill('input[type="password"]', user.password)

  // Submit
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|agenda)/, { timeout: 30000 })
}

/**
 * Check if user is already logged in.
 */
async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check for presence of authenticated UI elements
    const sidebar = await page.locator('[data-testid="sidebar"]').isVisible({ timeout: 2000 })
    return sidebar
  } catch {
    return false
  }
}

// =============================================================================
// FIXTURES
// =============================================================================

/**
 * Extended test with authentication fixtures.
 */
/* eslint-disable react-hooks/rules-of-hooks */
// Note: Playwright's `use` fixture function is not a React Hook
export const test = base.extend<AuthFixtures>({
  // Test user data
  // eslint-disable-next-line no-empty-pattern
  testUser: async ({}, use) => {
    await use(DEFAULT_TEST_USER)
  },

  // Authenticated page
  authenticatedPage: async ({ page, testUser }, use) => {
    // Check if already logged in (from storage state)
    await page.goto('/')

    const loggedIn = await isLoggedIn(page)

    if (!loggedIn) {
      await loginViaUI(page, testUser)
    }

    // Provide the authenticated page
    await use(page)
  },
})
/* eslint-enable react-hooks/rules-of-hooks */

// =============================================================================
// CUSTOM MATCHERS
// =============================================================================

export { expect }

// =============================================================================
// TEST HELPERS
// =============================================================================

/**
 * Navigate to a specific page via sidebar.
 */
export async function navigateTo(
  page: Page,
  destination: 'dashboard' | 'agenda' | 'patients' | 'finance' | 'settings'
): Promise<void> {
  const testIds: Record<string, string> = {
    dashboard: 'nav-dashboard',
    agenda: 'nav-agenda',
    patients: 'nav-patients',
    finance: 'nav-finance',
    settings: 'nav-settings',
  }

  await page.click(`[data-testid="${testIds[destination]}"]`)
  await page.waitForURL(new RegExp(`/${destination}`))
}

/**
 * Wait for toast notification.
 */
export async function waitForToast(
  page: Page,
  type: 'success' | 'error' | 'info' = 'success'
): Promise<string> {
  const toastSelector = `[data-sonner-toast][data-type="${type}"]`
  const toast = await page.waitForSelector(toastSelector, { timeout: 5000 })
  const text = await toast.textContent()
  return text || ''
}

/**
 * Fill form field by label.
 */
export async function fillField(page: Page, label: string, value: string): Promise<void> {
  const input = page.locator(`label:has-text("${label}") + input, label:has-text("${label}") input`)
  await input.fill(value)
}

/**
 * Select option in dropdown by label.
 */
export async function selectOption(page: Page, label: string, value: string): Promise<void> {
  const select = page.locator(
    `label:has-text("${label}") + select, label:has-text("${label}") select`
  )
  await select.selectOption(value)
}

/**
 * Click button by text.
 */
export async function clickButton(page: Page, text: string): Promise<void> {
  await page.click(`button:has-text("${text}")`)
}

/**
 * Wait for modal to appear.
 */
export async function waitForModal(page: Page, title?: string): Promise<void> {
  if (title) {
    await page.waitForSelector(`[role="dialog"]:has-text("${title}")`, { timeout: 5000 })
  } else {
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
  }
}

/**
 * Close modal.
 */
export async function closeModal(page: Page): Promise<void> {
  await page.click(
    '[role="dialog"] button:has-text("Fechar"), [role="dialog"] [aria-label="Close"]'
  )
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' })
}
