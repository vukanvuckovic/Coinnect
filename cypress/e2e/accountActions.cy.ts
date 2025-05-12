describe("Account and Card Controls", () => {
  beforeEach(() => {
    cy.login();
    cy.intercept("POST", "/api/graphql").as("graphqlRequest");
  });

  it("enables and disables an account", () => {
    cy.visit("/accounts");

    cy.get("[data-test='account-card']").first().click();
    cy.get("[data-test='account-options']").click();

    // Disable account
    cy.get("[data-test='disable-account']").click();
    cy.get("[data-test='alert-continue']").click();
    cy.wait("@graphqlRequest");
    cy.contains("Successfully disabled this account!").should("exist");

    cy.get("[data-test='account-options']").click();

    // Enable account
    cy.get("[data-test='enable-account']").click();
    cy.get("[data-test='alert-continue']").click();
    cy.wait("@graphqlRequest");
    cy.contains("Successfully enabled this account!").should("exist");
  });

  it("disables and re-enables a card", () => {
    cy.visit("/cards");

    // Disable card
    cy.get("[data-test='card']").first().click();
    cy.get("[data-test='disable-card']").click();
    cy.get("[data-test='alert-continue']").click();
    cy.wait("@graphqlRequest");
    cy.contains("Successfully disabled this card!").should("exist");

    // Re-enable card
    cy.get("[data-test='card']").first().click();
    cy.get("[data-test='enable-card']").click();
    cy.get("[data-test='alert-continue']").click();
    cy.wait("@graphqlRequest");
    cy.contains("Successfully enabled this card!").should("exist");
  });
});
