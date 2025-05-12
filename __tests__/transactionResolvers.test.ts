// @ts-nocheck
/* eslint-disable */
import { transactionResolvers } from "@/app/api/graphql/resolvers/transactionResolvers";
import { connectDB } from "@/mongodb/config";
import { verifyUser } from "@/lib/verifyUser";
import Transactions from "@/mongodb/models/Transactions";
import Accounts from "@/mongodb/models/Accounts";
import { sendEmail } from "@/lib/sendEmail";
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

jest.mock("@/mongodb/config", () => ({
  connectDB: jest.fn(),
}));
jest.mock("@/lib/verifyUser", () => ({
  verifyUser: jest.fn(),
}));
jest.mock("@/lib/sendEmail", () => ({
  sendEmail: jest.fn(),
}));
jest.mock("@/mongodb/models/Transactions");
jest.mock("@/mongodb/models/Accounts");

describe("setCategory", () => {
  const mockConnectDB = connectDB as jest.Mock;
  const mockFindByIdAndUpdate = Transactions.findByIdAndUpdate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully sets a category for a transaction", async () => {
    const mockTransactionId = "507f1f77bcf86cd799439011";
    const mockCategory = "Food";

    mockConnectDB.mockResolvedValueOnce(undefined);
    mockFindByIdAndUpdate.mockResolvedValueOnce({
      _id: mockTransactionId,
      category: mockCategory,
    });

    const result = await transactionResolvers.Mutation.setCategory(null, {
      categoryInfo: {
        transactionId: mockTransactionId,
        category: mockCategory,
      },
    });

    expect(mockConnectDB).toHaveBeenCalled();
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(mockTransactionId, {
      category: mockCategory,
    });
    expect(result).toBe(true);
  });

  it("returns false if transactionId or category is missing", async () => {
    const result = await transactionResolvers.Mutation.setCategory(null, {
      categoryInfo: { transactionId: "", category: "" },
    });

    expect(result).toBe(false);
    expect(mockConnectDB).not.toHaveBeenCalled();
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("returns false if transaction is not found", async () => {
    const mockTransactionId = "507f1f77bcf86cd799439011";

    mockConnectDB.mockResolvedValueOnce(undefined);
    mockFindByIdAndUpdate.mockResolvedValueOnce(null);

    const result = await transactionResolvers.Mutation.setCategory(null, {
      categoryInfo: {
        transactionId: mockTransactionId,
        category: "Groceries",
      },
    });

    expect(mockConnectDB).toHaveBeenCalled();
    expect(mockFindByIdAndUpdate).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});

describe("createTransaction", () => {
  const sender = "60d21b4667d0d8992e610c85";
  const receiver = "60d21b4667d0d8992e610c86";
  const transactionId = "txn123";
  const currentUserId = "user123";
  const amount = 100;
  const senderEmail = "sender@example.com";
  const receiverEmail = "receiver@example.com";
  const transactionInfo = {
    sender,
    receiver,
    amount,
    note: "Test payment",
    receiverEmail,
    senderEmail,
    currentUserId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a transaction successfully", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Accounts.findById as jest.Mock).mockImplementation((id: string) => {
      const owner = {
        firstName: "John",
        lastName: "Doe",
        email: id === sender ? senderEmail : receiverEmail,
      };
      return {
        populate: jest.fn().mockResolvedValue({
          _id: id,
          owner,
          balance: 5000,
          disabled: false,
          type: "debit",
        }),
      };
    });
    const mockTransaction = {
      id: transactionId,
      save: jest.fn().mockResolvedValue({ id: transactionId }),
    };
    (Transactions as jest.Mock).mockImplementation(() => mockTransaction);
    (Transactions.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

    const res = await transactionResolvers.Mutation.createTransaction(null, {
      transactionInfo,
    });

    expect(res).toEqual({ id: transactionId });
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(
      receiverEmail,
      "payment successful",
      "payment"
    );
    expect(sendEmail).toHaveBeenCalledWith(
      senderEmail,
      "payment successful",
      "sent"
    );
  });

  it("throws if required fields are missing", async () => {
    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo: { ...transactionInfo, sender: "" },
      })
    ).rejects.toThrow("Missing required transaction fields.");
  });

  it("throws if sender and receiver are the same", async () => {
    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo: {
          ...transactionInfo,
          sender: receiver,
        },
      })
    ).rejects.toThrow(
      "Cannot make a transaction because sender and receiver accounts are the same."
    );
  });

  it("throws if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);
    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo,
      })
    ).rejects.toThrow("Not authorized.");
  });

  it("throws if amount is below 1", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo: { ...transactionInfo, amount: 0.5 },
      })
    ).rejects.toThrow("Amount is invalid. Amount must be $1.00 or above.");
  });

  it("throws if sender ObjectId is invalid", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo: { ...transactionInfo, sender: "invalid-id" },
      })
    ).rejects.toThrow("Sender account ID is not a valid ObjectId.");
  });

  it("throws if receiver email does not match", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Accounts.findById as jest.Mock).mockImplementation((id: string) => {
      return {
        populate: jest.fn().mockResolvedValue({
          _id: id,
          owner: { email: "wrong@example.com" },
          disabled: false,
        }),
      };
    });
    (mongoose.Types.ObjectId.isValid as any) = () => true;

    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo,
      })
    ).rejects.toThrow("Recipient email does not match the account number.");
  });

  it("declines transaction if amount > 10000", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (mongoose.Types.ObjectId.isValid as any) = () => true;
    const mockTransaction = {
      id: transactionId,
      save: jest.fn().mockResolvedValue({ id: transactionId }),
    };
    (Transactions as jest.Mock).mockImplementation(() => mockTransaction);
    (Transactions.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
    (Accounts.findById as jest.Mock).mockImplementation((id: string) => {
      return {
        populate: jest.fn().mockResolvedValue({
          _id: id,
          owner: {
            email: id === receiver ? receiverEmail : senderEmail,
            firstName: "A",
            lastName: "B",
          },
          disabled: false,
          balance: 50000,
          type: "debit",
        }),
      };
    });

    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo: { ...transactionInfo, amount: 15000 },
      })
    ).rejects.toThrow("Transaction cannot be larger than $10.000,00");
  });

  it("declines transaction if not enough funds", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (mongoose.Types.ObjectId.isValid as any) = () => true;
    const mockTransaction = {
      id: transactionId,
      save: jest.fn().mockResolvedValue({ id: transactionId }),
    };
    (Transactions as jest.Mock).mockImplementation(() => mockTransaction);
    (Transactions.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
    (Accounts.findById as jest.Mock).mockImplementation((id: string) => {
      return {
        populate: jest.fn().mockResolvedValue({
          _id: id,
          owner: {
            email: id === receiver ? receiverEmail : senderEmail,
            firstName: "A",
            lastName: "B",
          },
          disabled: false,
          balance: id === sender ? 10 : 500,
          type: id === sender ? "debit" : "debit",
        }),
      };
    });

    await expect(
      transactionResolvers.Mutation.createTransaction(null, {
        transactionInfo: { ...transactionInfo, amount: 100 },
      })
    ).rejects.toThrow("You do not have enough funds on your account.");
  });
});

describe("getBudgetsSummary", () => {
  const ownerId = "user123";
  const accountId = "acc123";
  const now = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns budget summary totals by category for current month", async () => {
    const mockAccounts = [{ _id: accountId }];
    const mockTransactions = [
      {
        category: "food",
        amount: 50,
        createdAt: now,
        status: "completed",
        sender: accountId,
      },
      {
        category: "entertainment",
        amount: 100,
        createdAt: now,
        status: "completed",
        sender: accountId,
      },
      {
        category: "debt",
        amount: 200,
        createdAt: now,
        status: "completed",
        sender: accountId,
      },
      {
        category: "unknown",
        amount: 300,
        createdAt: now,
        status: "completed",
        sender: accountId,
      }, // should fall into "general"
    ];

    (verifyUser as jest.Mock).mockReturnValue(true);
    (Accounts.find as jest.Mock).mockResolvedValue(mockAccounts);
    (Transactions.find as jest.Mock).mockResolvedValue(mockTransactions);

    const res = await transactionResolvers.Query.getBudgetsSummary(null, {
      ownerId,
    });

    expect(res).toEqual({
      general: 300,
      entertainment: 100,
      food: 50,
      travel: 0,
      debt: 200,
    });
  });

  it("throws error when no ownerId is provided", async () => {
    await expect(
      transactionResolvers.Query.getBudgetsSummary(null, { ownerId: "" })
    ).rejects.toThrow("No owner ID provided");
  });

  it("throws error if user is not authorized", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      transactionResolvers.Query.getBudgetsSummary(null, { ownerId })
    ).rejects.toThrow("Not authorized.");
  });

  it("returns zero totals if user has no accounts", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Accounts.find as jest.Mock).mockResolvedValue([]);

    const res = await transactionResolvers.Query.getBudgetsSummary(null, {
      ownerId,
    });

    expect(res).toEqual({
      general: 0,
      entertainment: 0,
      food: 0,
      travel: 0,
      debt: 0,
    });
  });

  it("returns all zeros if there are no transactions", async () => {
    const mockAccounts = [{ _id: accountId }];
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Accounts.find as jest.Mock).mockResolvedValue(mockAccounts);
    (Transactions.find as jest.Mock).mockResolvedValue([]);

    const res = await transactionResolvers.Query.getBudgetsSummary(null, {
      ownerId,
    });

    expect(res).toEqual({
      general: 0,
      entertainment: 0,
      food: 0,
      travel: 0,
      debt: 0,
    });
  });
});

describe("getMonthlySpendingRecap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error if no account IDs are provided", async () => {
    await expect(
      transactionResolvers.Query.getMonthlySpendingRecap(null, {
        accountIds: null,
        userId: "123",
      })
    ).rejects.toThrow("No account IDs provided");
  });

  it("returns empty array if accountIds is empty", async () => {
    const res = await transactionResolvers.Query.getMonthlySpendingRecap(null, {
      accountIds: [],
      userId: "123",
    });

    expect(res).toEqual([]);
  });

  it("throws error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      transactionResolvers.Query.getMonthlySpendingRecap(null, {
        accountIds: ["acc1"],
        userId: "123",
      })
    ).rejects.toThrow("Not authorized.");
  });

  it("returns monthly totals for last 6 months", async () => {
    const now = new Date();
    const tx1 = {
      amount: 100,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      sender: "acc1",
    };
    const tx2 = {
      amount: 50,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      sender: "acc2",
    };
    const tx3 = {
      amount: 200,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 4, 15),
      sender: "other",
    };

    (verifyUser as jest.Mock).mockReturnValue(true);
    (Transactions.find as jest.Mock).mockResolvedValue([tx1, tx2, tx3]);

    const res = await transactionResolvers.Query.getMonthlySpendingRecap(null, {
      accountIds: ["acc1", "acc2"],
      userId: "123",
    });

    const month1Index = tx1.createdAt.getMonth();
    const month3Index = tx3.createdAt.getMonth();

    const month1Name = monthNames[month1Index];
    const month3Name = monthNames[month3Index];

    const expected = res.find((r) => r.month === month1Name);
    expect(expected?.amount).toBe(150);

    const nonSenderMonth = res.find((r) => r.month === month3Name);
    if (nonSenderMonth) expect(nonSenderMonth.amount).toBe(0); // tx3 ignored
  });
});

describe("get multiple transactions", () => {
  const mockTransactions = [
    { _id: "txn1", sender: {}, receiver: {} },
    { _id: "txn2", sender: {}, receiver: {} },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error without enough data", async () => {
    await expect(
      transactionResolvers.Query.getMultipleTransactions(null, {})
    ).rejects.toThrow("No ids provided.");
    await expect(
      transactionResolvers.Query.getMultipleTransactions(null, {
        accountIds: ["12", "123"],
      })
    ).rejects.toThrow("No userid provided.");
  });

  it("returns transactions", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);

    const mockQueryChain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
    };

    mockQueryChain.populate
      .mockReturnValueOnce(mockQueryChain)
      .mockReturnValueOnce(mockTransactions);

    (Transactions.find as jest.Mock).mockReturnValue(mockQueryChain);
    (Transactions.countDocuments as jest.Mock).mockResolvedValue(5);

    const res = await transactionResolvers.Query.getMultipleTransactions(null, {
      accountIds: ["12", "123"],
      limit: 3,
      userId: "123",
    });

    expect(res.transactions).toEqual(mockTransactions);
    expect(res.hasMore).toBe(true);
  });
});

describe("transactionResolvers.Query.getTransaction", () => {
  const mockTransaction = {
    _id: "txn123",
    amount: 100,
    sender: { _id: "123123123" },
    receiver: { _id: "45454545" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws an error if no id is provided", async () => {
    await expect(
      transactionResolvers.Query.getTransaction(null, { id: undefined })
    ).rejects.toThrow("No id provided.");
  });

  it("throws an error if unauthorized", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      transactionResolvers.Query.getTransaction(null, { id: "123" })
    ).rejects.toThrow("Not authorized.");
  });
});
