/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    getBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>
    getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>
    findBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>
    selectTokenByChain(
      selector: string,
      direction: 'source' | 'destination',
      chain: string,
      token: string,
    ): Chainable<JQuery<HTMLElement>>
    connectWallet(): Chainable<JQuery<HTMLElement>>
  }
}
