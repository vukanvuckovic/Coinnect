describe("Budgets Work", () => {
    beforeEach(() => {
      cy.login();
      cy.intercept("POST", "/api/graphql").as("graphqlRequest");
      cy.visit("/budgets");
    });
  
    it("adds, edits, and removes a budget", () => {
      const updateBudget = (value: string) => {
        cy.get("[data-test='budget-card']").contains("General").click();
        cy.get("[data-test='budget-input']").clear().type(value);
        cy.get("[data-test='set-budget']").click();
        cy.wait("@graphqlRequest");
      };
  
      const removeBudget = () => {
        cy.get("[data-test='budget-card']").contains("General").click();
        cy.get("[data-test='budget-input']").clear();
        cy.get("[data-test='set-budget']").click();
        cy.wait("@graphqlRequest");
      };
  
      // Set budget to $120
      updateBudget("120");
      cy.contains("$120").should("be.visible");
  
      // Update budget to $130
      updateBudget("130");
      cy.contains("$130").should("be.visible");
  
      // Remove budget (set to empty)
      removeBudget();
      cy.get("[data-test='budget-card']").contains("No budget").should("be.visible");
    });
  });