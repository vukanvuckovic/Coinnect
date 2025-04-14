import { connectDB } from "@/mongodb/config";
import Accounts from "@/mongodb/models/Accounts";
import Cards from "@/mongodb/models/Cards";
import Users from "@/mongodb/models/Users";
import { generateCardNumber } from "../../../../../utils/utils";
import { verifyUser } from "@/lib/verifyUser";

export const accountResolvers = {
  Query: {
    getAccount: async (_: any, args: { id: string }) => {
      try {
        if (!args.id) throw new Error("No id provided");

        await connectDB();

        const account = await Accounts.findById(args.id);

        if (!account) throw new Error("No account found");

        const verified = await verifyUser(account.owner.toString());

        if (!verified) throw new Error("Action not verified");

        return account;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getAccounts: async (_: any, args: { userId: string }) => {
      try {
        if (!args.userId) throw new Error("No user id provided");

        await connectDB();

        const verified = await verifyUser(args.userId);

        if (!verified) throw new Error("Action not verified");

        const accounts = await Accounts.find({
          $or: [{ owner: args.userId }, { coOwner: args.userId }],
        });

        if (!accounts) throw new Error("No accounts found");

        return accounts;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    createAccount: async (_: any, args: { accountInfo: AccountInfo }) => {
      try {
        console.log("creation started");
        if (!args.accountInfo) throw new Error("No account info provided");

        const { cardNumber, pin, owner, coOwner, type } = args.accountInfo;

        if ((!cardNumber && !pin) || !owner) throw new Error("No user or pin");

        await connectDB();

        if (!coOwner && type === "joint")
          throw new Error("Co-owner not specified");

        const coOwnerUser = await Users.findOne({ email: coOwner });

        if (!coOwnerUser && type === "joint")
          throw new Error("Co-owner not found");

        const account = new Accounts({
          ...args.accountInfo,
          coOwner: coOwnerUser?._id ?? undefined,
        });

        const savedAccount = await account.save();

        if (!account) throw new Error("Error creating account");

        const linkAccountToUser = await Users.findByIdAndUpdate(owner, {
          $push: {
            accounts: savedAccount._id,
          },
        });

        if (!linkAccountToUser)
          console.error("Account wasn't properly linked to the user");

        if (coOwner) {
          const linkAccountToCoOwner = await Users.findByIdAndUpdate(coOwner, {
            $push: {
              accounts: savedAccount._id,
            },
          });
          if (!linkAccountToCoOwner)
            console.error("Account wasn't properly linked to the coOwner");
        }

        if (!cardNumber) {
          const newCard = new Cards({
            user: owner,
            type: args.accountInfo.type === "credit" ? "credit" : "debit",
            expiry: new Date().setFullYear(new Date().getFullYear() + 3),
            pin: pin,
            cardNumber: generateCardNumber(),
            accounts: [savedAccount._id],
          });
          await newCard.save();
          await Accounts.findByIdAndUpdate(savedAccount._id, {
            cardNumber: newCard._id,
          });
          await Users.findByIdAndUpdate(owner, {
            $push: { cards: newCard._id },
          });
        } else {
          const linkAccountToCard = await Cards.findByIdAndUpdate(cardNumber, {
            $push: {
              accounts: savedAccount._id,
            },
          });

          if (!linkAccountToCard)
            console.error("Account wasn't properly linked to the card");
        }

        return savedAccount;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    deleteAccount: async (_: any, args: { id: string; userId: string }) => {
      try {
        const { id, userId } = args;
        if (!id || !userId) throw new Error("No id or user provided");

        const verified = await verifyUser(userId);
        if (!verified) throw new Error("User not verified");

        await connectDB();

        const verifyOwner = await Accounts.findById(id);

        if (!verifyOwner) throw new Error("Account not found.");

        if (
          userId !== verifyOwner.owner._id.toString() &&
          userId !== verifyOwner.coOwner._id.toString()
        )
          throw new Error("User is not the owner of the account");

        const account = await Accounts.findByIdAndDelete(id);

        if (!account) throw new Error("Error deleting account");

        const updatedUser = await Users.findByIdAndUpdate(account.owner, {
          $pull: {
            accounts: account._id,
          },
        });

        if (!updatedUser)
          console.error("Account couldn't be unlinked from the owner.");

        if (account.coOwner) {
          const updatedCoOwner = await Users.findByIdAndUpdate(
            account.coOwner,
            {
              $pull: {
                accounts: account._id,
              },
            }
          );
          if (!updatedCoOwner)
            console.error("Account couldn't be unlinked from the owner.");
        }

        const card = await Cards.findById(account.cardNumber);

        if (!card) console.error("Card attached to this account wasn't found.");

        if (card.accounts.length === 1 && card.accounts.includes(account._id)) {
          const deletedCard = await Cards.findByIdAndDelete(card.id);
          if (!deletedCard)
            throw new Error("Card with only one account deletion failed");
        } else {
          const updatedCard = await Cards.findByIdAndUpdate(card.id, {
            $pull: { accounts: account._id },
          });
          if (!updatedCard) throw new Error("Card update failed.");
        }

        return account;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    setAccountDisabled: async (
      _: any,
      args: { id: string; disabled: boolean; userId: string }
    ) => {
      try {
        const { id, disabled } = args;
        if (!id || typeof disabled === "undefined")
          throw new Error("No id or disabled state provided");

        await connectDB();

        const account = await Accounts.findByIdAndUpdate(id, {
          disabled,
        });

        if (!account) throw new Error("Error disabling account");

        return account;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    setBalance: async (_: any, args: { id: string; balance: number }) => {
      try {
        if (!args.id) throw new Error("No id provided");
        if (!args.balance) throw new Error("No balance provided");

        await connectDB();

        const account = await Accounts.findByIdAndUpdate(args.id, {
          balance: args.balance,
        });

        if (!account) throw new Error("Error setting balance account");

        return account;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    addAmount: async (_: any, args: { id: string; amount: number }) => {
      try {
        if (!args.id) throw new Error("No id provided");
        if (!args.amount) throw new Error("No amount provided");

        await connectDB();

        const account = await Accounts.findByIdAndUpdate(args.id, {
          $inc: { balance: args.amount },
        });

        if (!account) throw new Error("Error setting amount account");

        return account;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    subtractAmount: async (_: any, args: { id: string; amount: number }) => {
      try {
        if (!args.id) throw new Error("No id provided");
        if (!args.amount) throw new Error("No amount provided");

        await connectDB();

        const account = await Accounts.findByIdAndUpdate(args.id, {
          $inc: { balance: -args.amount },
        });

        if (!account) throw new Error("Error setting amount account");

        return account;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};
