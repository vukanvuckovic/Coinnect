import { gql } from "@apollo/client";

export const transactionTypeDefs = gql`
  type Query {
    getTransaction(id: ID, userId: ID): Transaction
    getTransactions(accountId: ID, limit: Int, userId: ID): TransactionResult
    getMultipleTransactions(
      accountIds: [String]
      limit: Int
      userId: ID
    ): TransactionResult
    getMonthlySpendingRecap(accountIds: [ID], userId: ID): [MonthlyReport]
    getBudgetsSummary(ownerId: ID): BudgetsSummary
  }
  type Mutation {
    createTransaction(transactionInfo: TransactionInput): Transaction
    setCategory(categoryInfo: CategoryInput): Boolean
  }

  input CategoryInput {
    transactionId: ID
    category: String
  }

  input TransactionInput {
    receiver: ID
    sender: ID
    amount: Float
    note: String
    receiverEmail: String
    senderEmail: String
    category: String
    currentUserId: ID
  }

  type MonthlyReport {
    month: String
    amount: Float
  }

  type BudgetsSummary {
    general: Float
    entertainment: Float
    food: Float
    travel: Float
    debt: Float
  }

  type Transaction {
    id: ID
    sender: Account
    receiver: Account
    senderStatic: UserStatic
    receiverStatic: UserStatic
    amount: Float
    status: String
    note: String
    category: String
    createdAt: String
  }

  type UserStatic {
    firstName: String
    lastName: String
    accountId: String
    email: String
  }

  type TransactionResult {
    transactions: [Transaction]
    hasMore: Boolean
  }
`;
