describe("Payments Work", () => {
  beforeEach(() => {
    cy.visit("/sign-in");

    cy.get("[data-test='auth-email']").clear().type("vukanvuckovic05@gmail.com");
    cy.get("[data-test='auth-password']").clear().type("password123");

    cy.intercept("POST", "/api/graphql").as("signinRequest");
    cy.get("[data-test='sign-in-button']").click();
    cy.wait("@signinRequest");

    cy.get("[data-test='welcome-heading']").should("be.visible");
    cy.visit("/payments");
  });

  it("prevents over-limit payment and allows valid payment", () => {
    // Select account
    cy.get("[data-test='account-selector-trigger']").click();
    cy.get("[data-test='account-selector-option']")
      .contains("Credit")
      .click();

    // Select template
    cy.get("[data-test='template-selector-trigger']").click();
    cy.get("[data-test='template-selector-option']")
      .contains("Vukan")
      .click();

    // Try to make an over-limit payment
    cy.get("[data-test='transfer-amount']").clear().type("15000");
    cy.get("[data-test='category-selector-trigger']").click();
    cy.get("[data-test='category-selector-option']")
      .contains("Entertainment")
      .click();

    cy.intercept("POST", "/api/graphql").as("paymentRequest");
    cy.get("[data-test='payment-button']").click();
    cy.wait("@paymentRequest");

    cy.contains("Transaction cannot be larger than $10.000,00").should("be.visible");

    // Retry with valid amount
    cy.get("[data-test='transfer-amount']").clear().type("15");

    cy.intercept("POST", "/api/graphql").as("paymentRequestValid");
    cy.get("[data-test='payment-button']").click();
    cy.wait("@paymentRequestValid");

    cy.contains("Transaction completed").should("be.visible");
  });
});