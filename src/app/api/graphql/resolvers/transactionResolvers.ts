import { sendEmail } from "@/lib/sendEmail";
import { verifyUser } from "@/lib/verifyUser";
import { connectDB } from "@/mongodb/config";
import Accounts from "@/mongodb/models/Accounts";
import Transactions from "@/mongodb/models/Transactions";
import mongoose from "mongoose";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const transactionResolvers = {
  Query: {
    getTransaction: async (_: any, args: { id: string; userId: string }) => {
      try {
        const { id, userId } = args;
        if (!id) throw new Error("No id provided.");

        await connectDB();

        const verified = await verifyUser(userId);
        if (!verified) throw new Error("Not authorized.");

        const transaction = await Transactions.findById(id)
          .populate("sender")
          .populate("receiver");

        if (!transaction) throw new Error("No transaction found.");

        return transaction;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getTransactions: async (
      _: any,
      args: { accountId: string; limit: number; userId: string }
    ) => {
      try {
        const { accountId, limit, userId } = args;
        if (!accountId || !limit || !userId)
          throw new Error("No accountid, userid or limit provided.");

        await connectDB();

        const verified = await verifyUser(userId);
        if (!verified) throw new Error("Not authorized.");

        const filter = {
          $or: [{ sender: accountId }, { receiver: accountId }],
        };

        const transactions = await Transactions.find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate({
            path: "sender",
            populate: [{ path: "owner" }, { path: "coOwner" }],
          })
          .populate({
            path: "receiver",
            populate: [{ path: "owner" }, { path: "coOwner" }],
          });

        if (!transactions) throw new Error("No transaction found.");

        const totalMatching = await Transactions.countDocuments(filter);
        const hasMore = totalMatching > limit;

        return { transactions, hasMore };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getMultipleTransactions: async (
      _: any,
      args: { accountIds: string[]; limit: number; userId: string }
    ) => {
      try {
        const { accountIds, limit, userId } = args;
        if (!accountIds) throw new Error("No ids provided.");
        if (accountIds.length === 0) return [];
        if (!userId) throw new Error("No userid provided.");

        await connectDB();

        const verified = await verifyUser(userId);
        if (!verified) throw new Error("Not authorized.");

        const filter = {
          $or: [
            { sender: { $in: accountIds } },
            { receiver: { $in: accountIds } },
          ],
        };

        const transactions = await Transactions.find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate({
            path: "sender",
            populate: [{ path: "owner" }, { path: "coOwner" }],
          })
          .populate({
            path: "receiver",
            populate: [{ path: "owner" }, { path: "coOwner" }],
          });

        if (!transactions) throw new Error("No transactions found.");

        const totalMatching = await Transactions.countDocuments(filter);
        const hasMore = totalMatching > limit;

        return { transactions, hasMore };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getMonthlySpendingRecap: async (
      _: any,
      args: { accountIds: string[]; userId: string }
    ) => {
      try {
        const { accountIds, userId } = args;
        if (!userId) throw new Error("No userId provided");
        if (!accountIds) throw new Error("No account IDs provided");
        if (accountIds.length === 0) return [];

        const verified = await await verifyUser(userId);
        if (!verified) throw new Error("Not authorized.");

        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        await connectDB();

        const transactions = await Transactions.find({
          sender: { $in: accountIds },
          status: "completed",
          createdAt: { $gte: sixMonthsAgo },
        });

        const monthlyTotals = new Map<number, number>();
        const monthSequence: number[] = [];

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = d.getMonth(); // 0 - 11
          monthlyTotals.set(month, 0);
          monthSequence.push(month);
        }

        transactions.forEach((tx) => {
          const txMonth = new Date(tx.createdAt).getMonth();
          const amount = Number(tx.amount) || 0;

          if (!monthlyTotals.has(txMonth)) return;

          const currentTotal = monthlyTotals.get(txMonth)!;

          const isSender = accountIds.includes(tx.sender.toString());

          let updatedAmount = currentTotal;

          if (isSender) updatedAmount += amount;

          monthlyTotals.set(txMonth, updatedAmount);
        });

        const result = monthSequence.map((month) => ({
          month: monthNames[month],
          amount: monthlyTotals.get(month) || 0,
        }));

        return result;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getBudgetsSummary: async (_: any, args: { ownerId: string }) => {
      try {
        const { ownerId } = args;
        if (!ownerId) throw new Error("No owner ID provided");

        await connectDB();

        const verified = await verifyUser(ownerId);
        if (!verified) throw new Error("Not authorized.");

        const accounts = await Accounts.find({
          $or: [{ owner: ownerId }, { coOwner: ownerId }],
        });

        const accountIds = accounts.map((acc) => acc._id.toString());

        if (accountIds.length === 0)
          return {
            general: 0,
            entertainment: 0,
            food: 0,
            travel: 0,
            debt: 0,
          };

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await Transactions.find({
          sender: { $in: accountIds },
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: "completed",
        });

        const categoryTotals: Record<string, number> = {
          general: 0,
          entertainment: 0,
          food: 0,
          travel: 0,
          debt: 0,
        };

        transactions.forEach((tx) => {
          const category = tx.category || "general";
          const amount = Number(tx.amount) || 0;

          if (categoryTotals.hasOwnProperty(category)) {
            categoryTotals[category] += amount;
          } else {
            categoryTotals["general"] += amount; // fallback
          }
        });

        return categoryTotals;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    createTransaction: async (
      _: any,
      args: {
        transactionInfo: {
          sender: string;
          receiver: string;
          amount: number;
          note: string;
          receiverEmail: string;
          senderEmail: string;
          currentUserId: string;
        };
      }
    ) => {
      try {
        const {
          sender,
          receiver,
          amount,
          note,
          receiverEmail,
          senderEmail,
          currentUserId,
        } = args.transactionInfo;

        if (
          !sender ||
          !receiver ||
          typeof amount === "undefined" ||
          !receiverEmail ||
          !currentUserId ||
          !senderEmail
        ) {
          throw new Error("Missing required transaction fields.");
        }

        if (sender === receiver)
          throw new Error(
            "Cannot make a transaction because sender and receiver accounts are the same."
          );

        const verified = await verifyUser(currentUserId);
        if (!verified) throw new Error("Not authorized.");

        if (amount < 1)
          throw new Error("Amount is invalid. Amount must be $1.00 or above.");

        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(sender)) {
          throw new Error("Sender account ID is not a valid ObjectId.");
        }
        if (!mongoose.Types.ObjectId.isValid(receiver)) {
          throw new Error("Receiver account ID is not a valid ObjectId.");
        }

        const senderAccount = await Accounts.findById(sender).populate("owner");
        if (!senderAccount) {
          throw new Error("No account found with that sender ID.");
        }
        if (senderAccount.disabled) {
          throw new Error(
            "Account from which you're trying to send money is disabled."
          );
        }
        const receiverAccount = await Accounts.findById(receiver).populate(
          "owner"
        );
        if (!receiverAccount) {
          throw new Error("No account found with that receiver ID.");
        }
        if (receiverAccount.disabled) {
          throw new Error(
            "Account to which you're trying to send money is disabled."
          );
        }

        if (receiverAccount.owner.email !== receiverEmail) {
          throw new Error("Recipient email does not match the account number.");
        }

        const transaction = new Transactions({
          ...args.transactionInfo,
          note: note?.length === 0 ? undefined : note,
          senderStatic: {
            firstName: senderAccount.owner.firstName,
            lastName: senderAccount.owner.lastName,
            email: senderAccount.owner.email,
            accountId: sender,
          },
          receiverStatic: {
            firstName: receiverAccount.owner.firstName,
            lastName: receiverAccount.owner.lastName,
            email: receiverAccount.owner.email,
            accountId: receiver,
          },
        });

        const savedTransaction = await transaction.save();

        if (!savedTransaction) {
          throw new Error("Failed to create transaction.");
        }

        if (amount > 10000) {
          await Transactions.findByIdAndUpdate(savedTransaction.id, {
            status: "declined",
          });
          throw new Error("Transaction cannot be larger than $10.000,00");
        }

        if (amount > senderAccount.balance && senderAccount.type !== "credit") {
          await Transactions.findByIdAndUpdate(savedTransaction.id, {
            status: "declined",
          });
          throw new Error("You do not have enough funds on your account.");
        }

        const acc1 = await Accounts.findByIdAndUpdate(sender, {
          $inc: { balance: -amount },
        });

        const acc2 = await Accounts.findByIdAndUpdate(receiver, {
          $inc: { balance: amount },
        });

        if (acc1 && acc2) {
          await Transactions.findByIdAndUpdate(savedTransaction.id, {
            status: "completed",
          });
          sendEmail(receiverEmail, "payment successful", "payment");
          sendEmail(senderEmail, "payment successful", "sent");
        }

        return savedTransaction;
      } catch (error: any) {
        // console.error("Transaction error:", error.message);
        throw new Error(error.message || "Unknown transaction error.");
      }
    },
    setCategory: async (
      _: any,
      args: { categoryInfo: { transactionId: string; category: string } }
    ) => {
      try {
        const { transactionId, category } = args.categoryInfo;
        if (!transactionId || !category)
          throw new Error("No transactionId or category");

        await connectDB();

        const updatedTransaction = await Transactions.findByIdAndUpdate(
          transactionId,
          {
            category,
          }
        );

        if (!updatedTransaction) throw new Error("setting category failed");

        return true;
      } catch (error: any) {
        // console.error(error.message);
        return false;
      }
    },
  },
};
