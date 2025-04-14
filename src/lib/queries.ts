import { gql } from "@apollo/client";

export const GET_ACCOUNTS = gql`
  query GetAccounts($userId: ID) {
    getAccounts(userId: $userId) {
      id
      disabled
      balance
      type
    }
  }
`;

export const GET_CARDS = gql`
  query GetCards($userId: ID) {
    getCards(userId: $userId) {
      id
      user {
        firstName
        lastName
      }
      type
      expiry
      cardNumber
      disabled
      accounts {
        cardNumber
      }
    }
  }
`;

export const GET_MULTIPLE_TRANSACTIONS = gql`
  query GetMultipleTransactions(
    $accountIds: [String]
    $limit: Int
    $userId: ID
  ) {
    getMultipleTransactions(
      accountIds: $accountIds
      limit: $limit
      userId: $userId
    ) {
      transactions {
        id
        sender {
          id
          owner {
            firstName
            lastName
          }
        }
        receiver {
          id
          owner {
            firstName
            lastName
          }
        }
        senderStatic {
          ...StaticFragment
        }
        receiverStatic {
          ...StaticFragment
        }
        amount
        note
        status
        category
        createdAt
      }
      hasMore
    }
  }

  fragment StaticFragment on UserStatic {
    firstName
    lastName
    accountId
    email
  }
`;

export const GET_BUDGETS_SUMMARY = gql`
  query GetBudgetsSummary($ownerId: ID) {
    getBudgetsSummary(ownerId: $ownerId) {
      general
      entertainment
      food
      travel
      debt
    }
  }
`;

export const GET_MONTHLY_SPENDING_RECAP = gql`
  query GetMonthlySpendingRecap($accountIds: [ID], $userId: ID) {
    getMonthlySpendingRecap(accountIds: $accountIds, userId: $userId) {
      month
      amount
    }
  }
`;

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($templateInfo: CreateTemplateInput) {
    createTemplate(templateInfo: $templateInfo) {
      id
      receiverEmail
      receiverName
      receiverAccount
    }
  }
`;
