import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { userTypeDefs } from "./typeDefs/userTypeDefs";
import { userResolver } from "./resolvers/userResolvers";
import { accountTypeDefs } from "./typeDefs/accountTypeDefs";
import { accountResolvers } from "./resolvers/accountResolvers";
import { transactionTypeDefs } from "./typeDefs/transactionTypeDefs";
import { cardTypeDefs } from "./typeDefs/cardTypeDefs";
import { cardResolvers } from "./resolvers/cardResolvers";
import { transactionResolvers } from "./resolvers/transactionResolvers";
import { emailTypeDefs } from "./typeDefs/emailTypeDefs";
import { emailResolver } from "./resolvers/emailResolver";
import { NextRequest } from "next/server";

const server = new ApolloServer({
  typeDefs: mergeTypeDefs([
    userTypeDefs,
    accountTypeDefs,
    transactionTypeDefs,
    cardTypeDefs,
    emailTypeDefs,
  ]),
  resolvers: mergeResolvers([
    userResolver,
    accountResolvers,
    cardResolvers,
    transactionResolvers,
    emailResolver,
  ]),
});

const handler = startServerAndCreateNextHandler<NextRequest>(server);

export const GET = (req: NextRequest) => handler(req);
export const POST = (req: NextRequest) => handler(req);
