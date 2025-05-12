/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
  }
}

Cypress.Commands.add("login", () => {
  cy.visit("localhost:3000/sign-in");

  cy.get("[data-test='auth-email']")
    .should("be.visible")
    .clear()
    .type("vukanvuckovic05@gmail.com");

  cy.get("[data-test='auth-password']")
    .should("be.visible")
    .clear()
    .type("password123");
  cy.intercept("POST", "/api/graphql").as("signinRequest");

  cy.get("[data-test='sign-in-button']").should("be.visible").click();

  cy.wait("@signinRequest");

  cy.get("[data-test='welcome-heading']").should("be.visible");
});
