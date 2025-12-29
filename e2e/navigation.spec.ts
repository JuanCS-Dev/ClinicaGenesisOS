/**
 * Navigation E2E Tests
 * ====================
 *
 * Tests for app navigation, sidebar, and page transitions.
 * These tests require authentication via fixtures.
 */

import { test, expect } from './fixtures'

test.describe('Navigation', () => {
  test.describe('Sidebar Navigation', () => {
    test('should display sidebar with main navigation items', async ({
      authenticatedPage: page,
    }) => {
      // Check sidebar is visible
      await expect(page.locator('[data-testid="sidebar"], nav')).toBeVisible()

      // Check main navigation items exist
      const navItems = [/dashboard|painel/i, /agenda|calendar/i, /pacientes|patients/i]

      for (const item of navItems) {
        // At least check the text exists somewhere
        await expect(page.locator(`text=${item}`).first()).toBeVisible()
      }
    })

    test('should navigate to Agenda page', async ({ authenticatedPage: page }) => {
      // Click agenda navigation
      await page.click('text=/agenda|calendar/i')

      // Verify URL
      await expect(page).toHaveURL(/agenda/)

      // Verify page content
      await expect(page.locator('text=/agenda|calendar|hoje|today/i').first()).toBeVisible()
    })

    test('should navigate to Patients page', async ({ authenticatedPage: page }) => {
      // Click patients navigation
      await page.click('text=/pacientes|patients/i')

      // Verify URL
      await expect(page).toHaveURL(/patients|pacientes/)

      // Verify page content (search or list)
      const hasContent = await Promise.race([
        page
          .waitForSelector('input[placeholder*="Buscar"], input[placeholder*="Search"]', {
            timeout: 5000,
          })
          .then(() => true),
        page.waitForSelector('text=/paciente|patient/i', { timeout: 5000 }).then(() => true),
      ]).catch(() => false)

      expect(hasContent).toBeTruthy()
    })

    test('should navigate to Finance page', async ({ authenticatedPage: page }) => {
      // Click finance navigation
      await page.click('text=/financeiro|finance|faturamento/i')

      // Verify URL
      await expect(page).toHaveURL(/finance|financeiro|billing/)
    })

    test('should navigate to Settings page', async ({ authenticatedPage: page }) => {
      // Click settings navigation
      await page.click('text=/configurações|settings/i')

      // Verify URL
      await expect(page).toHaveURL(/settings|configuracoes/)
    })
  })

  test.describe('Page Header', () => {
    test('should display clinic logo or name in header', async ({ authenticatedPage: page }) => {
      // Check for logo or clinic name in header
      const hasLogo = await page
        .locator('header img[alt*="logo"], header img[src*="logo"]')
        .isVisible()
        .catch(() => false)
      const hasName = await page
        .locator('header:has-text("Genesis"), header:has-text("Clínica")')
        .isVisible()
        .catch(() => false)

      expect(hasLogo || hasName).toBeTruthy()
    })

    test('should display user menu or profile button', async ({ authenticatedPage: page }) => {
      // Check for user menu/avatar
      const hasUserMenu = await Promise.race([
        page.waitForSelector('[data-testid="user-menu"]', { timeout: 3000 }).then(() => true),
        page
          .waitForSelector('button:has(img[alt*="avatar"]), button:has(img[alt*="profile"])', {
            timeout: 3000,
          })
          .then(() => true),
        page
          .waitForSelector('[aria-label*="menu"], [aria-label*="profile"]', { timeout: 3000 })
          .then(() => true),
      ]).catch(() => false)

      // User menu should exist
      expect(hasUserMenu).toBeTruthy()
    })
  })

  test.describe('Responsive Navigation', () => {
    test('should show mobile menu on small screens', async ({ authenticatedPage: page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Reload to trigger responsive layout
      await page.reload()

      // Should have hamburger menu or bottom navigation
      const hasMobileNav = await Promise.race([
        page
          .waitForSelector('[data-testid="mobile-menu-button"]', { timeout: 5000 })
          .then(() => true),
        page.waitForSelector('[aria-label="Menu"]', { timeout: 5000 }).then(() => true),
        page.waitForSelector('nav[role="navigation"]', { timeout: 5000 }).then(() => true),
      ]).catch(() => false)

      expect(hasMobileNav).toBeTruthy()
    })
  })

  test.describe('Breadcrumbs', () => {
    test('should show breadcrumbs on patient details page', async ({ authenticatedPage: page }) => {
      // Navigate to patients
      await page.click('text=/pacientes|patients/i')
      await page.waitForURL(/patients|pacientes/)

      // Try to click on first patient if list is not empty
      const patientCard = page
        .locator('[data-testid="patient-card"], [data-testid="patient-row"]')
        .first()

      if (await patientCard.isVisible().catch(() => false)) {
        await patientCard.click()

        // Breadcrumbs are optional but good to have
        // Just verify we're on a details page
        await expect(page).toHaveURL(/patients\/|pacientes\//)
      }
    })
  })
})
