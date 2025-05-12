// @ts-nocheck
/* eslint-disable */
import { accountResolvers } from "@/app/api/graphql/resolvers/accountResolvers";
import { connectDB } from "@/mongodb/config";
import Accounts from "@/mongodb/models/Accounts";
import Users from "@/mongodb/models/Users";
import Cards from "@/mongodb/models/Cards";
import { verifyUser } from "@/lib/verifyUser";
import { generateCardNumber } from "../utils/utils";

jest.mock("@/mongodb/config", () => ({
  connectDB: jest.fn(),
}));
jest.mock("@/lib/verifyUser", () => ({
  verifyUser: jest.fn(),
}));
jest.mock("../utils/utils", () => ({
  generateCardNumber: jest.fn(() => "1234567890123456"),
}));
jest.mock("@/mongodb/models/Accounts");
jest.mock("@/mongodb/models/Users");
jest.mock("@/mongodb/models/Cards");

describe("subtractAmount", () => {
  const mockAccount = {
    _id: "account123",
    balance: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockAccount);
  });

  it("throws an error if id is missing", async () => {
    await expect(
      accountResolvers.Mutation.subtractAmount(null, {
        id: "",
        amount: 200,
      })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if amount is missing", async () => {
    await expect(
      accountResolvers.Mutation.subtractAmount(null, {
        id: "account123",
        amount: undefined as any,
      })
    ).rejects.toThrow("No amount provided");
  });

  it("throws an error if account not found", async () => {
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Mutation.subtractAmount(null, {
        id: "account123",
        amount: 200,
      })
    ).rejects.toThrow("Error setting amount account");
  });

  it("subtracts the amount from the balance successfully", async () => {
    const result = await accountResolvers.Mutation.subtractAmount(null, {
      id: "account123",
      amount: 200,
    });

    expect(Accounts.findByIdAndUpdate).toHaveBeenCalledWith("account123", {
      $inc: { balance: -200 },
    });
    expect(result).toEqual(mockAccount);
  });
});

describe("addAmount", () => {
  const mockAccount = {
    _id: "account123",
    balance: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockAccount);
  });

  it("throws an error if id is missing", async () => {
    await expect(
      accountResolvers.Mutation.addAmount(null, {
        id: "",
        amount: 200,
      })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if amount is missing", async () => {
    await expect(
      accountResolvers.Mutation.addAmount(null, {
        id: "account123",
        amount: undefined as any,
      })
    ).rejects.toThrow("No amount provided");
  });

  it("throws an error if account not found", async () => {
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Mutation.addAmount(null, {
        id: "account123",
        amount: 200,
      })
    ).rejects.toThrow("Error setting amount account");
  });

  it("adds the amount to the balance successfully", async () => {
    const result = await accountResolvers.Mutation.addAmount(null, {
      id: "account123",
      amount: 200,
    });

    expect(Accounts.findByIdAndUpdate).toHaveBeenCalledWith("account123", {
      $inc: { balance: 200 },
    });
    expect(result).toEqual(mockAccount);
  });
});

describe("setBalance", () => {
  const mockAccount = {
    _id: "account123",
    balance: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockAccount);
  });

  it("throws an error if id is missing", async () => {
    await expect(
      accountResolvers.Mutation.setBalance(null, {
        id: "",
        balance: 200,
      })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if balance is missing", async () => {
    await expect(
      accountResolvers.Mutation.setBalance(null, {
        id: "account123",
        balance: undefined as any,
      })
    ).rejects.toThrow("No balance provided");
  });

  it("throws an error if account not found", async () => {
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Mutation.setBalance(null, {
        id: "account123",
        balance: 200,
      })
    ).rejects.toThrow("Error setting balance account");
  });

  it("sets the balance successfully", async () => {
    const result = await accountResolvers.Mutation.setBalance(null, {
      id: "account123",
      balance: 200,
    });

    expect(Accounts.findByIdAndUpdate).toHaveBeenCalledWith("account123", {
      balance: 200,
    });
    expect(result).toEqual(mockAccount);
  });
});

describe("setAccountDisabled", () => {
  const mockAccount = {
    _id: "account123",
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockAccount);
  });

  it("throws an error if id or disabled state is missing", async () => {
    await expect(
      accountResolvers.Mutation.setAccountDisabled(null, {
        id: "",
        disabled: undefined,
        userId: "owner123",
      })
    ).rejects.toThrow("No id or disabled state provided");
  });

  it("throws an error if account not found", async () => {
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Mutation.setAccountDisabled(null, {
        id: "account123",
        disabled: true,
        userId: "owner123",
      })
    ).rejects.toThrow("Error disabling account");
  });

  it("disables account successfully", async () => {
    const result = await accountResolvers.Mutation.setAccountDisabled(null, {
      id: "account123",
      disabled: true,
      userId: "owner123",
    });

    expect(Accounts.findByIdAndUpdate).toHaveBeenCalledWith("account123", {
      disabled: true,
    });
    expect(result).toEqual(mockAccount);
  });

  it("enables account successfully", async () => {
    const result = await accountResolvers.Mutation.setAccountDisabled(null, {
      id: "account123",
      disabled: false,
      userId: "owner123",
    });

    expect(Accounts.findByIdAndUpdate).toHaveBeenCalledWith("account123", {
      disabled: false,
    });
    expect(result).toEqual(mockAccount);
  });
});

describe("deleteAccount", () => {
  const mockAccount = {
    _id: "account123",
    owner: "owner123",
    coOwner: "coOwner456",
    cardNumber: "card789",
  };

  const mockCard = {
    id: "card789",
    accounts: ["account123"],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (verifyUser as jest.Mock).mockReturnValue(true);
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    (Accounts.findById as jest.Mock).mockResolvedValue({
      ...mockAccount,
      owner: { _id: "owner123" },
      coOwner: { _id: "coOwner456" },
    });

    (Accounts.findByIdAndDelete as jest.Mock).mockResolvedValue(mockAccount);
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue(mockCard);
    (Cards.findByIdAndDelete as jest.Mock).mockResolvedValue(true);
    (Cards.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
  });

  it("throws error if id or userId is missing", async () => {
    await expect(
      accountResolvers.Mutation.deleteAccount(null, { id: "", userId: "" })
    ).rejects.toThrow("No id or user provided");
  });

  it("throws error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      accountResolvers.Mutation.deleteAccount(null, {
        id: "account123",
        userId: "owner123",
      })
    ).rejects.toThrow("User not verified");
  });

  it("throws error if account not found", async () => {
    (Accounts.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Mutation.deleteAccount(null, {
        id: "account123",
        userId: "owner123",
      })
    ).rejects.toThrow("Account not found.");
  });

  it("throws error if user is not the owner or co-owner", async () => {
    await expect(
      accountResolvers.Mutation.deleteAccount(null, {
        id: "account123",
        userId: "unauthorizedUser",
      })
    ).rejects.toThrow("User is not the owner of the account");
  });

  it("deletes account and updates linked user and card", async () => {
    const result = await accountResolvers.Mutation.deleteAccount(null, {
      id: "account123",
      userId: "owner123",
    });

    expect(Accounts.findByIdAndDelete).toHaveBeenCalledWith("account123");
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith("owner123", {
      $pull: { accounts: "account123" },
    });
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith("coOwner456", {
      $pull: { accounts: "account123" },
    });
    expect(Cards.findByIdAndDelete).toHaveBeenCalledWith("card789");
    expect(result).toEqual(mockAccount);
  });

  it("updates card if it has more than one account", async () => {
    (Cards.findById as jest.Mock).mockResolvedValue({
      id: "card789",
      accounts: ["account123", "account456"],
    });

    await accountResolvers.Mutation.deleteAccount(null, {
      id: "account123",
      userId: "owner123",
    });

    expect(Cards.findByIdAndUpdate).toHaveBeenCalledWith("card789", {
      $pull: { accounts: "account123" },
    });
  });
});

describe("createAccount", () => {
  const mockAccountInfo = {
    cardNumber: undefined,
    pin: 1234,
    owner: "owner123",
    coOwner: "coOwner@example.com",
    type: "joint",
  };

  const mockUser = { _id: "coOwnerId" };
  const mockSavedAccount = { _id: "account123", ...mockAccountInfo };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock chained model instance methods
    (Users.findOne as jest.Mock).mockResolvedValue(mockUser);
    (Accounts.prototype.save as jest.Mock).mockImplementation(function () {
      return { ...this, _id: "account123" };
    });
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
    (Cards.prototype.save as jest.Mock).mockResolvedValue(true);
    (Accounts.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
    (Cards.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
  });

  it("throws an error if accountInfo is missing", async () => {
    await expect(
      accountResolvers.Mutation.createAccount(null, {
        accountInfo: undefined as any,
      })
    ).rejects.toThrow("No account info provided");
  });

  it("throws an error if no user or pin is provided", async () => {
    const invalidInfo = {
      cardNumber: undefined,
      pin: undefined,
      owner: "",
      type: "single",
    };

    await expect(
      accountResolvers.Mutation.createAccount(null, {
        accountInfo: invalidInfo as any,
      })
    ).rejects.toThrow("No user or pin");
  });

  it("throws an error if joint account has no co-owner", async () => {
    const jointInfo = { ...mockAccountInfo, coOwner: undefined };

    await expect(
      accountResolvers.Mutation.createAccount(null, {
        accountInfo: jointInfo as any,
      })
    ).rejects.toThrow("Co-owner not specified");
  });

  it("throws an error if co-owner not found for joint account", async () => {
    (Users.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Mutation.createAccount(null, {
        accountInfo: mockAccountInfo,
      })
    ).rejects.toThrow("Co-owner not found");
  });

  it("creates account and links it to owner and co-owner", async () => {
    const result = await accountResolvers.Mutation.createAccount(null, {
      accountInfo: mockAccountInfo,
    });

    expect(result).toEqual(expect.objectContaining({ _id: "account123" }));
    expect(Users.findOne).toHaveBeenCalledWith({
      email: "coOwner@example.com",
    });
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith("owner123", {
      $push: { accounts: "account123" },
    });
  });

  it("links account to existing card if cardNumber is provided", async () => {
    const withCardInfo = { ...mockAccountInfo, cardNumber: "card123" };
    const result = await accountResolvers.Mutation.createAccount(null, {
      accountInfo: withCardInfo,
    });

    expect(result).toEqual(expect.objectContaining({ _id: "account123" }));
    expect(Cards.findByIdAndUpdate).toHaveBeenCalledWith("card123", {
      $push: { accounts: "account123" },
    });
  });
});

describe("getAccounts", () => {
  it("throws an error if userId is missing", async () => {
    await expect(
      accountResolvers.Query.getAccounts(null, { userId: "" })
    ).rejects.toThrow("No user id provided");
  });

  it("throws an error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      accountResolvers.Query.getAccounts(null, { userId: "user123" })
    ).rejects.toThrow("Action not verified");
  });

  it("throws an error if no accounts are found", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Accounts.find as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Query.getAccounts(null, { userId: "user123" })
    ).rejects.toThrow("No accounts found");
  });

  it("returns accounts if user is verified and data exists", async () => {
    const mockAccounts = [
      { _id: "a1", owner: "user123" },
      { _id: "a2", coOwner: "user123" },
    ];

    (verifyUser as jest.Mock).mockReturnValue(true);
    (Accounts.find as jest.Mock).mockResolvedValue(mockAccounts);

    const result = await accountResolvers.Query.getAccounts(null, {
      userId: "user123",
    });

    expect(result).toEqual(mockAccounts);
  });
});

describe("getAccount", () => {
  it("throws an error if id is missing", async () => {
    await expect(
      accountResolvers.Query.getAccount(null, { id: "" })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if account is not found", async () => {
    (Accounts.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      accountResolvers.Query.getAccount(null, { id: "acc123" })
    ).rejects.toThrow("No account found");
  });

  it("throws an error if user is not verified", async () => {
    (Accounts.findById as jest.Mock).mockResolvedValue({
      owner: "user123",
    });
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      accountResolvers.Query.getAccount(null, { id: "acc123" })
    ).rejects.toThrow("Action not verified");
  });

  it("returns the account if everything is valid", async () => {
    const mockAccount = {
      _id: "acc123",
      owner: "user123",
      name: "Main Account",
    };

    (Accounts.findById as jest.Mock).mockResolvedValue(mockAccount);
    (verifyUser as jest.Mock).mockReturnValue(true);

    const result = await accountResolvers.Query.getAccount(null, {
      id: "acc123",
    });

    expect(result).toEqual(mockAccount);
  });
});
