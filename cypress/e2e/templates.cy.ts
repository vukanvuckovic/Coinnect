describe("Templates Functionalities", () => {
  it("adds, edits, and deletes a template", () => {
    cy.login();
    cy.visit("http://localhost:3000/templates");

    // Add Template
    cy.get("[data-test='add-template']").click();
    cy.contains("Add new template").should("be.visible");

    cy.get("[data-test='recipient-name']").clear().type("Test Name");
    cy.get("[data-test='recipient-email']").clear().type("test@test.test");
    cy.get("[data-test='recipient-account']").clear().type("123123123123");

    cy.get("[data-test='confirm-template']").click();
    cy.contains("Template created successfully!").should("exist");

    // Edit Template
    cy.get("[data-test='template']")
      .contains("test@test.test")
      .parents("[data-test='template']")
      .find("[data-test='template-menu']")
      .click();

    cy.get("[data-test='edit-template']").click();
    cy.contains("Edit template").should("be.visible");

    cy.get("[data-test='recipient-name']").clear().type("Test Name New");
    cy.get("[data-test='recipient-email']").clear().type("test2@test.test");
    cy.get("[data-test='recipient-account']").clear().type("67676767676767676");

    cy.get("[data-test='confirm-template']").click();
    cy.contains("Template edited successfully!").should("exist");

    // Delete Template
    cy.get("[data-test='template']")
      .contains("test2@test.test")
      .parents("[data-test='template']")
      .find("[data-test='template-menu']")
      .click();

    cy.get("[data-test='delete-template']").click();
    cy.get("[data-test='alert-continue']").click();

    cy.contains("Template deleted successfully!").should("exist");
  });
});
