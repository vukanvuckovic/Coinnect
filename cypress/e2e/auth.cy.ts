describe("Auth Flow", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql").as("graphqlRequest");
  });

  it("logs in and logs out", () => {
    cy.visit("/sign-in");

    cy.get("[data-test='auth-email']")
      .should("be.visible")
      .clear()
      .type("vukanvuckovic05@gmail.com");

    cy.get("[data-test='auth-password']")
      .should("be.visible")
      .clear()
      .type("password123");

    cy.get("[data-test='sign-in-button']").should("be.visible").click();

    cy.wait("@graphqlRequest");

    cy.get("[data-test='welcome-heading']").should("be.visible");

    cy.get("[data-test='user-menu-trigger']").click();
    cy.get("[data-test='user-menu-logout']").click();

    cy.get("[data-test='auth-heading']").should("be.visible");
  });

  it("signs up and handles duplicate email", () => {
    cy.visit("/sign-up");

    // Fill in form with existing email
    cy.get("[data-test='first-name']").clear().type("Vukan");
    cy.get("[data-test='last-name']").clear().type("Vuckovic");
    cy.get("[data-test='address']").clear().type("Serbia");
    cy.get("[data-test='state']").clear().type("Serbia");
    cy.get("[data-test='postal-code']").clear().type("11000");
    cy.get("[data-test='date-of-birth']").clear().type("2005-11-11");
    cy.get("[data-test='auth-email']")
      .clear()
      .type("vukanvuckovic05@gmail.com");
    cy.get("[data-test='auth-password']").clear().type("password123");

    cy.get("[data-test='sign-up-button']").click();
    cy.wait("@graphqlRequest");

    cy.contains("Error signing up.").should("be.visible");

    // Try with a new email
    cy.get("[data-test='auth-email']")
      .clear()
      .type("vukanvuckovic222@gmail.com");

    cy.get("[data-test='sign-up-button']").click();
    cy.wait("@graphqlRequest");

    cy.get("[data-test='welcome-heading']").should("be.visible");
    cy.contains("Account created!").should("be.visible");
  });
});