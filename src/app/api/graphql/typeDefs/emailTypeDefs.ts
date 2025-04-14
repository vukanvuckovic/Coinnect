import { gql } from "@apollo/client";

export const emailTypeDefs = gql`
  type Mutation {
    sendEmail(to: String, message: String, type:String): Boolean
  }
`;
