import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000')
})

test.describe('Turtle', () => {
  test('Health Check', async ({ page }) => {
    await expect(page).toHaveTitle(/Turtle/)
  })

  test('Happy Path – allows selecting chains, tokens, and amount', async ({ page }) => {
    await expect(page.getByTestId('chain-select-trigger-to')).toHaveAttribute('aria-disabled', 'true')
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled()

    // Select From chain → unlock From token
    await page.getByTestId('chain-select-trigger-from').getByText('Chain').click()

    await expect(page.getByText('Ethereum')).toBeVisible()
    await page.getByText('Ethereum').click()

    await expect(page.getByText('ETH', { exact: true })).toBeVisible()
    await page.getByText('ETH', { exact: true }).click()

    // Closes the dropdown
    await page.click('body')

    await expect(page.getByTestId('chain-select-trigger-to')).toHaveAttribute('aria-disabled', 'false')
    await page.getByTestId('chain-select-trigger-to').getByText('Chain').click()

    await expect(page.getByText('Bifrost')).toBeVisible()
    await page.getByText('Bifrost').click()

    await page.getByRole('listitem').filter({ hasText: 'ETH' }).locator('span').click()

    await page.getByPlaceholder('Amount').fill('0.01')

    await expect(page.getByPlaceholder('Amount')).toHaveValue('0.01')
  })

  test('Destination token and chain are disabled until Source token and chain are selected', async ({ page }) => {
    await expect(page.getByTestId('chain-select-trigger-to')).toHaveAttribute('aria-disabled', 'true')

    await page.getByTestId('chain-select-trigger-from').getByText('Chain').click()
    await page.getByRole('listitem').filter({ hasText: 'Ethereum' }).click()
    await page.getByText('ETH', { exact: true }).click()
    await page.click('body')

    await expect(page.getByTestId('chain-select-trigger-to')).toHaveAttribute('aria-disabled', 'false')

    await page.getByTestId('chain-select-trigger-from').getByText('Ethereum').click()
    await page.getByTestId('clear-button').first().click()
    await page.click('body')

    await expect(page.getByTestId('chain-select-trigger-to')).toHaveAttribute('aria-disabled', 'true')
  })
})
