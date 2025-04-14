import { gql } from "@apollo/client";

export const cardTypeDefs = gql`
  type Query {
    getCard(id: ID, userId: ID): Card
    getCards(userId: ID): [Card]
  }

  type Mutation {
    deleteCard(id: ID, userId: ID): Card
    setCardDisabled(id: ID, userId: ID, disabled: Boolean): Card
    changePin(id: ID, pin: Int, userId: ID): Card
    verifyPin(id: ID, pin: Int, userId: ID): Boolean
  }

  type Card {
    id: ID
    user: User
    type: String
    expiry: String
    cardNumber: String
    disabled: Boolean
    accounts: [Account]
  }
`;
