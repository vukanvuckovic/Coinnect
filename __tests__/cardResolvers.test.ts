//@ts-nocheck
import { cardResolvers } from "@/app/api/graphql/resolvers/cardResolvers";
import { connectDB } from "@/mongodb/config";
import { verifyUser } from "@/lib/verifyUser";
import Cards from "@/mongodb/models/Cards";
import Accounts from "@/mongodb/models/Accounts";
import Users from "@/mongodb/models/Users";

jest.mock("@/mongodb/config", () => ({
  connectDB: jest.fn(),
}));
jest.mock("@/lib/verifyUser", () => ({
  verifyUser: jest.fn(),
}));
jest.mock("@/mongodb/models/Cards");
jest.mock("@/mongodb/models/Accounts");
jest.mock("@/mongodb/models/Users");

describe("changePin", () => {
  it("throws an error if id is missing", async () => {
    await expect(
      cardResolvers.Mutation.changePin(null, {
        id: "",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if pin is missing", async () => {
    await expect(
      cardResolvers.Mutation.changePin(null, {
        id: "card123",
        pin: 0,
        userId: "user123",
      })
    ).rejects.toThrow("No pin provided");
  });

  it("throws an error if userId is missing", async () => {
    await expect(
      cardResolvers.Mutation.changePin(null, {
        id: "card123",
        pin: 1234,
        userId: "",
      })
    ).rejects.toThrow("No userId provided");
  });

  it("throws an error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      cardResolvers.Mutation.changePin(null, {
        id: "card123",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("Not authorized to perform this action.");
  });

  it("throws an error if card is not found during lookup", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      cardResolvers.Mutation.changePin(null, {
        id: "card123",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("No card found");
  });

  it("throws an error if user is not the card owner", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      user: { _id: "differentUser" },
    });

    await expect(
      cardResolvers.Mutation.changePin(null, {
        id: "card123",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("User is not the owner of the card");
  });

  it("throws an error if card is not found during update", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      user: { _id: "user123" },
    });
    (Cards.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      cardResolvers.Mutation.changePin(null, {
        id: "card123",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("No card found");
  });

  it("updates the pin and returns the updated card", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      user: { _id: "user123" },
    });
    const mockCard = { _id: "card123", pin: 1234 };
    (Cards.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockCard);

    const result = await cardResolvers.Mutation.changePin(null, {
      id: "card123",
      pin: 1234,
      userId: "user123",
    });

    expect(result).toEqual(mockCard);
  });
});

describe("verifyPin", () => {
  it("throws an error if id is missing", async () => {
    await expect(
      cardResolvers.Mutation.verifyPin(null, {
        id: "",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if pin is missing", async () => {
    await expect(
      cardResolvers.Mutation.verifyPin(null, {
        id: "card123",
        pin: 0,
        userId: "user123",
      })
    ).rejects.toThrow("No pin provided");
  });

  it("throws an error if userId is missing", async () => {
    await expect(
      cardResolvers.Mutation.verifyPin(null, {
        id: "card123",
        pin: 1234,
        userId: "",
      })
    ).rejects.toThrow("No userId provided");
  });

  it("throws an error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      cardResolvers.Mutation.verifyPin(null, {
        id: "card123",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("Not authorized to perform this action.");
  });

  it("throws an error if card is not found", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      cardResolvers.Mutation.verifyPin(null, {
        id: "card123",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("No card found");
  });

  it("throws an error if user is not the card owner", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      user: { _id: "differentUser" },
    });

    await expect(
      cardResolvers.Mutation.verifyPin(null, {
        id: "card123",
        pin: 1234,
        userId: "user123",
      })
    ).rejects.toThrow("User is not the owner of the card");
  });

  it("returns true if pin is correct", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      user: { _id: "user123" },
      pin: 1234,
    });

    const result = await cardResolvers.Mutation.verifyPin(null, {
      id: "card123",
      pin: 1234,
      userId: "user123",
    });

    expect(result).toBe(true);
  });

  it("returns false if pin is incorrect", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      user: { _id: "user123" },
      pin: 9999,
    });

    const result = await cardResolvers.Mutation.verifyPin(null, {
      id: "card123",
      pin: 1234,
      userId: "user123",
    });

    expect(result).toBe(false);
  });
});

describe("setCardDisabled", () => {
  it("throws an error for missing data", async () => {
    await expect(
      cardResolvers.Mutation.setCardDisabled(null, {
        id: "",
        userId: "",
        disabled: undefined,
      })
    ).rejects.toThrow("Not enough data provided");
  });

  it("throws an error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      cardResolvers.Mutation.setCardDisabled(null, {
        id: "someId",
        userId: "user123",
        disabled: true,
      })
    ).rejects.toThrow("Not authorized to perform this action.");
  });

  it("throws an error if card is not found", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      cardResolvers.Mutation.setCardDisabled(null, {
        id: "card123",
        userId: "user123",
        disabled: true,
      })
    ).rejects.toThrow("No card found");
  });

  it("disables a card successfully", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    const mockCard = { _id: "card123", disabled: true };
    (Cards.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockCard);

    const result = await cardResolvers.Mutation.setCardDisabled(null, {
      id: "card123",
      userId: "user123",
      disabled: true,
    });

    expect(result).toEqual(mockCard);
  });
});

describe("delete card", () => {
  it("throws an error for not enough data", async () => {
    await expect(cardResolvers.Mutation.deleteCard(null, {})).rejects.toThrow(
      "No id or user provided"
    );
  });
  it("deletes a card", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      user: {
        _id: "1235",
      },
    });
    (Cards.findByIdAndDelete as jest.Mock).mockResolvedValue({
      accounts: ["111", "222"],
      type: "credit",
    });
    (Accounts.findByIdAndDelete as jest.Mock).mockResolvedValue(true);
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

    const res = await cardResolvers.Mutation.deleteCard(null, {
      id: "123",
      userId: "1235",
    });
    expect(res).toHaveProperty("type", "credit");
  });
});

describe("get cards", () => {
  it("throws an error without user id", async () => {
    await expect(cardResolvers.Query.getCards(null, {})).rejects.toThrow(
      "No user id provided"
    );
  });
  it("returns cards", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);

    (Cards.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([
        {
          _id: "123",
          user: "123",
          type: "credit",
          userInfo: { name: "Vukan" },
        },
      ]),
    });

    const res = await cardResolvers.Query.getCards(null, {
      userId: "123",
    });

    expect(res[0]).toHaveProperty("type", "credit");
  });
});

describe("get card", () => {
  it("throws an error without data", async () => {
    await expect(cardResolvers.Query.getCard(null, {})).rejects.toThrow(
      "No id or user provided"
    );
  });
  it("throws an error when unverified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      cardResolvers.Query.getCard(null, { id: "123", userId: "123" })
    ).rejects.toThrow("Not authorized to perform this action.");
  });
  it("throws an error if user is not the owner of the card", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);

    (Cards.findById as jest.Mock).mockResolvedValue({
      _id: "123",
      user: "123",
      type: "credit",
    });

    await expect(
      cardResolvers.Query.getCard(null, { id: "123", userId: "124" })
    ).rejects.toThrow("The user is not the owner of the card");
  });
  it("returns a card", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Cards.findById as jest.Mock).mockResolvedValue({
      _id: "123",
      user: "123",
      type: "credit",
    });
    const res = await cardResolvers.Query.getCard(null, {
      id: "123",
      userId: "123",
    });
    expect(res).toHaveProperty("type", "credit");
  });
});
