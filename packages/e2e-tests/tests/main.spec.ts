import { test as baseTest, expect } from '@playwright/test'
import dappwright, { type Dappwright, MetaMaskWallet, type OfficialOptions } from '@tenkeylabs/dappwright'
import type { BrowserContext } from 'playwright-core'

export const withWalletTest = baseTest.extend<{
  context: BrowserContext
  wallet: Dappwright
}>({
  // biome-ignore lint/correctness/noEmptyPattern: the first argument is not used, and will crash with _
  context: async ({}, use, testInfo) => {
    // Launch context with extension and playwright project params
    const metadata = testInfo.project.metadata as OfficialOptions
    const [wallet, , context] = await dappwright.bootstrap('', {
      ...metadata,
      headless: false,
    })

    if (wallet instanceof MetaMaskWallet) {
      // Add Hardhat as a custom network.
      await wallet.addNetwork({
        networkName: 'Hardhat',
        rpc: 'http://localhost:8546',
        chainId: 31337,
        symbol: 'ETH',
      })
    }

    await use(context)
  },

  wallet: async ({ context }, use, testInfo) => {
    const walletId = testInfo.project.metadata.wallet
    const metamask = await dappwright.getWallet(walletId, context)

    await use(metamask)
  },
})

baseTest.describe('Base Tests', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  baseTest('Health Check', async ({ page }) => {
    await expect(page).toHaveTitle(/Turtle/)
  })

  baseTest('Happy Path: allows selecting chains, tokens, and amount', async ({ page }) => {
    await page.waitForLoadState()

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

    await expect(page.getByText('Bifrost').first()).toBeVisible()
    await page.getByText('Bifrost').first().click()

    await page.getByRole('listitem').filter({ hasText: 'ETH' }).locator('span').click()

    await page.getByPlaceholder('Amount').fill('0.01')

    await expect(page.getByPlaceholder('Amount')).toHaveValue('0.01')
  })

  baseTest('Destination token and chain are disabled until Source token and chain are selected', async ({ page }) => {
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

withWalletTest.describe('Connect Wallet Tests', () => {
  withWalletTest.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  withWalletTest('Can connect wallet', async ({ page, context }) => {
    await expect(page.getByRole('button', { name: 'Connect' })).toBeDisabled()

    await page.getByTestId('chain-select-trigger-from').getByText('Chain').click()
    await page.getByRole('listitem').filter({ hasText: 'Ethereum' }).click()
    await page.getByText('ETH', { exact: true }).click()
    await page.click('body')

    await expect(page.getByTestId('chain-select-trigger-from').getByRole('button', { name: 'Connect' })).toBeEnabled()
    await page.getByTestId('chain-select-trigger-from').getByRole('button', { name: 'Connect' }).click()

    await expect(page.getByRole('button', { name: 'All Wallets' })).toBeVisible()
    await page.getByRole('button', { name: 'All Wallets' }).click()

    await page.getByTestId('wui-input-text').click()
    await page.getByTestId('wui-input-text').fill('coinbase')

    // await page.getByRole('button', { name: 'Coinbase Wallet Coinbase' }).click()
    const [popup] = await Promise.all([
      context.waitForEvent('page'), // catches target=_blank + rel=noopener
      page.getByRole('button', { name: 'Coinbase Wallet Coinbase' }).click(),
    ])

    await popup.waitForLoadState('domcontentloaded')
    console.log('popup url:', popup.url())

    console.log('evaluating location ref', await popup.evaluate('location.href'))

    await popup.getByRole('button', { name: 'Connect' }).click()
    await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible()
  })
})
