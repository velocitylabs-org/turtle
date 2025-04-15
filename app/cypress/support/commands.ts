Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy="${selector}"]`, ...args)
})

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-cy*="${selector}"]`, ...args)
})

Cypress.Commands.add('findBySel', { prevSubject: true }, (subject, selector, ...args) => {
  return subject.find(`[data-cy="${selector}"]`, ...args)
})
