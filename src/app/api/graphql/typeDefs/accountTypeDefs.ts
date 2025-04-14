import { gql } from "@apollo/client";

export const accountTypeDefs = gql`
  type Query {
    getAccount(id: ID): Account
    getAccounts(userId: ID): [Account]
    getAccountsReport(ownerId: ID): [AccountReport]
  }

  type Mutation {
    createAccount(accountInfo: AccountInput): Account
    deleteAccount(id: ID, userId: ID): Account
    setAccountDisabled(id: ID, disabled: Boolean): Account
    setBalance(id: ID, balance: Float): Account
    addAmount(id: ID, amount: Float): Account
    subtractAmount(id: ID, amount: Float): Account
  }

  type AccountReport {
    account: ID
    amount: Float
  }

  input AccountInput {
    owner: String
    type: String
    cardNumber: ID
    pin: Int
    coOwner: String
  }

  type Account {
    id: ID
    owner: User
    coOwner: User
    type: String
    balance: Float
    interest: Float
    disabled: Boolean
    accountName: String
    cardNumber: String
    transactions: [Transaction]
  }
`;
