import { gql } from "@apollo/client";

export const userTypeDefs = gql`
  type Query {
    getUser(id: ID): User
    me: User
  }

  type Mutation {
    createUser(userInput: UserInput): User
    signIn(userCredentials: UserCredentials): User
    signOut: Boolean
    updateUser(id: ID, userInfo: UserInput): User
    deleteUser(id: ID): User
    seedDatabase: Boolean
    createTemplate(templateInfo: CreateTemplateInput): Template
    editTemplate(templateInfo: EditTemplateInput): Template
    deleteTemplate(templateId: ID, userId: ID): Template
    setBudget(budgetInfo: BudgetInput): Boolean
  }

  input BudgetInput {
    budget: String
    value: Int
    userId: String
  }

  input CreateTemplateInput {
    userId: ID
    receiverName: String
    receiverAccount: String
    receiverEmail: String
  }

  input EditTemplateInput {
    userId: ID
    templateId: ID
    receiverName: String
    receiverAccount: String
    receiverEmail: String
  }

  input UserInput {
    firstName: String
    lastName: String
    address: String
    state: String
    postalCode: String
    dateOfBirth: String
    ssn: String
    email: String
    password: String
  }

  input UserCredentials {
    email: String
    password: String
  }

  type User {
    id: ID
    firstName: String
    lastName: String
    address: String
    state: String
    postalCode: String
    dateOfBirth: String
    ssn: String
    email: String
    budgets: Budget
    accounts: [Account]
    cards: [Card]
    templates: [Template]
  }

  type Budget {
    food: Int
    travel: Int
    debt: Int
    general: Int
    entertainment: Int
  }

  type Template {
    id: ID
    receiverName: String
    receiverAccount: String
    receiverEmail: String
  }

  type Transaction {
    sender: Account
    receiver: Account
    amount: Float
  }
`;
