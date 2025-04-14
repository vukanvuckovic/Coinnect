import { verifyUser } from "@/lib/verifyUser";
import { connectDB } from "@/mongodb/config";
import Accounts from "@/mongodb/models/Accounts";
import Cards from "@/mongodb/models/Cards";
import Users from "@/mongodb/models/Users";

export const cardResolvers = {
  Query: {
    getCard: async (_: any, args: { id: string; userId: string }) => {
      try {
        const { id, userId } = args;
        if (!id || !userId) throw new Error("No id or user provided");

        await connectDB();

        const verified = await verifyUser(userId);

        if (!verified)
          throw new Error("Not authorized to perform this action.");

        const card = await Cards.findById(id);

        if (card.user !== userId)
          throw new Error("The user is not the owner of the card");

        return card;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getCards: async (_: any, args: { userId: string }) => {
      try {
        const { userId } = args;
        if (!userId) throw new Error("No user id provided");

        await connectDB();

        const verified = await verifyUser(userId);

        if (!verified)
          throw new Error("Not authorized to perform this action.");

        const cards = await Cards.find({ user: args.userId }).populate("user");

        if (!cards) throw new Error("No user found");

        return cards;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    deleteCard: async (_: any, args: { id: string; userId: string }) => {
      try {
        const { id, userId } = args;
        if (!id || !userId) throw new Error("No id or user provided");

        await connectDB();

        const verified = await verifyUser(userId);

        if (!verified)
          throw new Error("Not authorized to perform this action.");

        const verifyOwner = await Cards.findById(id);

        if (verifyOwner.user._id.toString() !== userId)
          throw new Error("The user is not the owner of the card");

        const deletedCard = await Cards.findByIdAndDelete(id);
        if (!deletedCard) throw new Error("No card found");

        for (const account of deletedCard.accounts) {
          try {
            const deletedAccount = await Accounts.findByIdAndDelete(account);
            if (!deletedAccount) {
              console.log("Failed to delete", account);
            }
          } catch (error) {
            console.error("Error deleting account:", account, error);
          }
        }

        const userUpdated = await Users.findByIdAndUpdate(userId, {
          $pull: { cards: deletedCard._id },
        });
        if (!userUpdated)
          console.log("User couldn't be updated for card deletion");

        return deletedCard;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    setCardDisabled: async (
      _: any,
      args: { id: string; userId: string; disabled: boolean }
    ) => {
      try {
        const { id, userId, disabled } = args;
        if (!id || !userId || typeof disabled === "undefined")
          throw new Error("Not enough data provided");

        await connectDB();

        const verified = await verifyUser(userId);

        if (!verified)
          throw new Error("Not authorized to perform this action.");

        const card = await Cards.findByIdAndUpdate(id, { disabled });

        if (!card) throw new Error("No card found");

        return card;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    verifyPin: async (
      _: any,
      args: { id: string; pin: number; userId: string }
    ) => {
      const { id, pin, userId } = args;
      if (!id) throw new Error("No id provided");
      if (!pin) throw new Error("No pin provided");
      if (!userId) throw new Error("No userId provided");

      await connectDB();

      const userVerified = await verifyUser(userId);

      if (!userVerified)
        throw new Error("Not authorized to perform this action.");

      const card = await Cards.findById(id);

      if (!card) throw new Error("No card found");

      if (card.user._id.toString() !== userId)
        throw new Error("User is not the owner of the card");

      const verified = card.pin === pin;

      return verified;
    },
    changePin: async (
      _: any,
      args: { id: string; pin: number; userId: string }
    ) => {
      try {
        const { id, pin, userId } = args;

        if (!id) throw new Error("No id provided");
        if (!pin) throw new Error("No pin provided");
        if (!userId) throw new Error("No userId provided");

        await connectDB();

        const userVerified = await verifyUser(userId);

        if (!userVerified)
          throw new Error("Not authorized to perform this action.");

        const card = await Cards.findById(id);

        if (!card) throw new Error("No card found");

        if (card.user._id.toString() !== userId)
          throw new Error("User is not the owner of the card");

        const updatedCard = await Cards.findByIdAndUpdate(args.id, {
          pin: args.pin,
        });

        if (!updatedCard) throw new Error("No card found");

        return updatedCard;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};
