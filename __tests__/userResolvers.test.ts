//@ts-nocheck
import { userResolver } from "@/app/api/graphql/resolvers/userResolvers";
import Users from "@/mongodb/models/Users";
import { cookies } from "next/headers";
import { connectDB } from "@/mongodb/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";
import { verifyUser } from "@/lib/verifyUser";

jest.mock("@/mongodb/models/Users");
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    delete: jest.fn(),
  })),
}));
jest.mock("@/mongodb/config", () => ({
  connectDB: jest.fn(),
}));
jest.mock("@/lib/sendEmail", () => ({
  sendEmail: jest.fn(),
}));
jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("@/lib/verifyUser", () => ({ verifyUser: jest.fn() }));

describe("setBudget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully sets a budget", async () => {
    const mockArgs = {
      budgetInfo: {
        budget: "food",
        value: 500,
        userId: "user123",
      },
    };

    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const result = await userResolver.Mutation.setBudget(null, mockArgs);

    expect(connectDB).toHaveBeenCalled();
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith(
      "user123",
      { $set: { "budgets.food": 500 } },
      { new: true }
    );
    expect(result).toBe(true);
  });

  it("successfully unsets a budget if value is 0", async () => {
    const mockArgs = {
      budgetInfo: {
        budget: "entertainment",
        value: 0,
        userId: "user456",
      },
    };

    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const result = await userResolver.Mutation.setBudget(null, mockArgs);

    expect(connectDB).toHaveBeenCalled();
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith(
      "user456",
      { $unset: { "budgets.entertainment": "" } },
      { new: true }
    );
    expect(result).toBe(true);
  });

  it("throws error if no budget or userId is provided", async () => {
    const mockArgs = {
      budgetInfo: {
        budget: "",
        value: 300,
        userId: "",
      },
    };

    await expect(
      userResolver.Mutation.setBudget(null, mockArgs)
    ).rejects.toThrow("No budget provided");

    expect(connectDB).not.toHaveBeenCalled();
    expect(Users.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("throws error if value is negative", async () => {
    const mockArgs = {
      budgetInfo: {
        budget: "groceries",
        value: -100,
        userId: "user789",
      },
    };

    await expect(
      userResolver.Mutation.setBudget(null, mockArgs)
    ).rejects.toThrow("Budget cannot be less than 0");

    expect(connectDB).toHaveBeenCalled();
    expect(Users.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("throws error if budget update fails", async () => {
    const mockArgs = {
      budgetInfo: {
        budget: "travel",
        value: 200,
        userId: "user999",
      },
    };

    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      userResolver.Mutation.setBudget(null, mockArgs)
    ).rejects.toThrow("Setting budget failed.");

    expect(connectDB).toHaveBeenCalled();
    expect(Users.findByIdAndUpdate).toHaveBeenCalled();
  });
});

describe("deleteTemplate", () => {
  it("successfully deletes a template", async () => {
    const mockArgs = {
      userId: "user123",
      templateId: "template456",
    };

    const mockTemplate = {
      _id: "template456",
      receiverName: "Jane",
      receiverEmail: "jane@example.com",
      receiverAccount: "987654321",
    };

    const mockUser = {
      templates: [
        mockTemplate,
        {
          _id: "template789",
          receiverName: "Someone Else",
          receiverEmail: "someone@example.com",
          receiverAccount: "111222333",
        },
      ],
    };

    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findById as jest.Mock).mockResolvedValue(mockUser);
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const res = await userResolver.Mutation.deleteTemplate(null, mockArgs);

    expect(connectDB).toHaveBeenCalled();
    expect(verifyUser).toHaveBeenCalledWith("user123");
    expect(Users.findById).toHaveBeenCalledWith("user123");
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith("user123", {
      $pull: { templates: { _id: "template456" } },
    });
    expect(res).toEqual(mockTemplate);
  });
});

describe("editTemplate", () => {
  it("successfully edits a template", async () => {
    const mockArgs = {
      templateInfo: {
        userId: "user123",
        templateId: "template456",
        receiverName: "Jane",
        receiverEmail: "jane@example.com",
        receiverAccount: "987654321",
      },
    };

    const updatedTemplate = {
      _id: "template456",
      receiverName: "Jane",
      receiverEmail: "jane@example.com",
      receiverAccount: "987654321",
    };

    const mockUpdatedUser = {
      templates: [updatedTemplate],
    };

    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const res = await userResolver.Mutation.editTemplate(null, mockArgs);

    expect(connectDB).toHaveBeenCalled();
    expect(verifyUser).toHaveBeenCalledWith("user123");
    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "user123", "templates._id": "template456" },
      {
        $set: {
          "templates.$.receiverName": "Jane",
          "templates.$.receiverEmail": "jane@example.com",
          "templates.$.receiverAccount": "987654321",
        },
      },
      { new: true }
    );
    expect(res).toEqual(updatedTemplate);
  });
});

describe("createTemplate", () => {
  const mockArgs = {
    templateInfo: {
      userId: "user123",
      receiverName: "John",
      receiverEmail: "john@example.com",
      receiverAccount: "123456789",
    },
  };

  const mockUser = {
    templates: [
      { receiverAccount: "000111" },
      { receiverAccount: "123456789" }, // The one we're testing for
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws if no template info is provided", async () => {
    await expect(
      userResolver.Mutation.createTemplate(null, { templateInfo: null })
    ).rejects.toThrow("No template info");
  });

  it("throws if required fields are missing", async () => {
    await expect(
      userResolver.Mutation.createTemplate(null, {
        templateInfo: {
          userId: "",
          receiverEmail: "",
          receiverName: "",
          receiverAccount: "",
        },
      })
    ).rejects.toThrow("Not enough data");
  });

  it("throws if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      userResolver.Mutation.createTemplate(null, mockArgs)
    ).rejects.toThrow("Not authorized");
  });

  it("throws if template already exists", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findOne as jest.Mock).mockResolvedValue(true);

    await expect(
      userResolver.Mutation.createTemplate(null, mockArgs)
    ).rejects.toThrow("Template with this account number already exists.");
  });

  it("throws if user update fails", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findOne as jest.Mock).mockResolvedValue(null);
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      userResolver.Mutation.createTemplate(null, mockArgs)
    ).rejects.toThrow("Error creating template");
  });

  it("successfully creates a template", async () => {
    const updatedUser = {
      templates: [
        { receiverAccount: "111" },
        { receiverAccount: "222" },
        { receiverAccount: "123456789" }, // The new one added
      ],
    };

    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findOne as jest.Mock).mockResolvedValue(null);
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

    const res = await userResolver.Mutation.createTemplate(null, mockArgs);

    expect(connectDB).toHaveBeenCalled();
    expect(Users.findOne).toHaveBeenCalledWith({
      _id: "user123",
      templates: { $elemMatch: { receiverAccount: "123456789" } },
    });
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith(
      "user123",
      {
        $push: {
          templates: expect.objectContaining({
            receiverName: "John",
            receiverEmail: "john@example.com",
            receiverAccount: "123456789",
          }),
        },
      },
      { new: true }
    );
    expect(res).toEqual(updatedUser.templates[2]);
  });
});

// const mockArgs = {
//     templateInfo: {
//       userId: "user123",
//       receiverName: "John",
//       receiverEmail: "john@example.com",
//       receiverAccount: "123456789",
//     },
//   };

//   const mockUser = {
//     templates: [
//       { receiverAccount: "000111" },
//       { receiverAccount: "123456789" }, // The one we're testing for
//     ],
//   };

describe("deleteUser", () => {
  const userId = "user123";
  const deletedUser = {
    _id: userId,
    email: "deleted@example.com",
    firstName: "Deleted",
    lastName: "User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws an error if no id is provided", async () => {
    await expect(
      userResolver.Mutation.deleteUser(null, { id: {} })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      userResolver.Mutation.deleteUser(null, { id: { id: userId } })
    ).rejects.toThrow("Not authorized");
  });

  it("throws an error if user is not found", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(
      userResolver.Mutation.deleteUser(null, { id: { id: userId } })
    ).rejects.toThrow("No user found with this id");
  });

  it("successfully deletes the user", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedUser);

    const res = await userResolver.Mutation.deleteUser(null, {
      id: { id: userId },
    });

    expect(connectDB).toHaveBeenCalled();
    expect(verifyUser).toHaveBeenCalledWith(userId);
    expect(Users.findByIdAndDelete).toHaveBeenCalledWith(userId);
    expect(res).toEqual(deletedUser);
  });
});

describe("updateUser", () => {
  const mockUserInput = {
    email: "newemail@example.com",
    ssn: "123-45-6789",
    password: "newpassword",
    firstName: "Updated",
    lastName: "User",
  };

  const updatedUser = {
    _id: "user123",
    email: "newemail@example.com",
    firstName: "Updated",
    lastName: "User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws an error if no id is provided", async () => {
    await expect(
      userResolver.Mutation.updateUser(null, {
        id: "",
        userInfo: mockUserInput,
      })
    ).rejects.toThrow("No id provided");
  });

  it("throws an error if no userInfo is provided", async () => {
    await expect(
      userResolver.Mutation.updateUser(null, {
        id: "user123",
        userInfo: undefined,
      } as any)
    ).rejects.toThrow("No user info provided");
  });

  it("throws an error if user is not verified", async () => {
    (verifyUser as jest.Mock).mockReturnValue(false);

    await expect(
      userResolver.Mutation.updateUser(null, {
        id: "user123",
        userInfo: mockUserInput,
      })
    ).rejects.toThrow("Not authorized");
  });

  it("throws an error if email already exists", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findOne as jest.Mock).mockResolvedValue(true);

    await expect(
      userResolver.Mutation.updateUser(null, {
        id: "user123",
        userInfo: mockUserInput,
      })
    ).rejects.toThrow("User with that email is already registered.");
  });

  it("throws an error if user not found after update", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      userResolver.Mutation.updateUser(null, {
        id: "user123",
        userInfo: mockUserInput,
      })
    ).rejects.toThrow("No user found with this id");
  });

  it("successfully updates the user", async () => {
    (verifyUser as jest.Mock).mockReturnValue(true);
    (Users.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

    const result = await userResolver.Mutation.updateUser(null, {
      id: "user123",
      userInfo: mockUserInput,
    });

    expect(result).toEqual(updatedUser);
    expect(Users.findOne).toHaveBeenCalledWith({
      email: mockUserInput.email,
    });
    expect(Users.findByIdAndUpdate).toHaveBeenCalledWith(
      "user123",
      expect.objectContaining({
        email: mockUserInput.email,
        ssn: "hashed",
        password: "hashed",
      }),
      { new: true }
    );
  });
});

describe("signOut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when session exists", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ name: "session", value: "token" }),
      delete: jest.fn(),
    });

    const result = await userResolver.Mutation.signOut();

    expect(result).toBe(true);
    expect(cookies().delete).toHaveBeenCalledWith("session");
  });

  it("returns undefined when no session exists", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
      delete: jest.fn(),
    });

    const result = await userResolver.Mutation.signOut();

    expect(result).toBeUndefined();
    expect(cookies().delete).not.toHaveBeenCalled();
  });
});

describe("login functionalities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    _id: "123abc",
    name: "Jane Doe",
    email: "jane@example.com",
  };

  it("throws an error without data", async () => {
    await expect(
      userResolver.Mutation.signIn(null, {
        userCredentials: { email: "test", password: undefined },
      })
    ).rejects.toThrow("No password");
    await expect(
      userResolver.Mutation.signIn(null, {
        userCredentials: { password: "test", email: undefined },
      })
    ).rejects.toThrow("No email");
  });
  it("throws an error without data", async () => {
    (Users.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(undefined),
      }),
    });
    await expect(
      userResolver.Mutation.signIn(null, {
        userCredentials: { password: "test", email: "test" },
      })
    ).rejects.toThrow("No user found with this email.");
  });
  it("throws an error for incorrect password", async () => {
    (Users.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      userResolver.Mutation.signIn(null, {
        userCredentials: { password: "test", email: "test" },
      })
    ).rejects.toThrow("Password is incorrect.");
  });
  it("logs in", async () => {
    (Users.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockResolvedValue("jwt.token");

    (cookies as jest.Mock).mockReturnValue({
      set: jest.fn().mockResolvedValue("cookie.resolved"),
    });

    const res = await userResolver.Mutation.signIn(null, {
      userCredentials: { password: "Test", email: mockUser.email },
    });

    expect(res).toHaveProperty("email", mockUser.email);
  });
});

describe("Create user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    _id: "123abc",
    name: "Jane Doe",
    email: "jane@example.com",
  };

  const mockUserInput = {
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    state: "CA",
    postalCode: "90001",
    dateOfBirth: "1990-01-01",
    ssn: "123-45-6789",
    email: "john@example.com",
    password: "securePassword123",
  };
  it("Throws an error without id", async () => {
    await expect(
      userResolver.Mutation.createUser(null, { userInput: undefined })
    ).rejects.toThrow("Not enough data.");
  });
  it("Throws an error when user exists", async () => {
    (Users.findOne as jest.Mock).mockReturnValue(true);

    await expect(
      userResolver.Mutation.createUser(null, { userInput: mockUserInput })
    ).rejects.toThrow("User with this email already exists.");
  });
  it("successfully creates a user", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_value");
    (Users.findOne as jest.Mock).mockResolvedValue(null);
    sendEmail.mockResolvedValue(undefined);

    const saveMock = jest.fn().mockResolvedValue(true);

    (Users as jest.Mock).mockImplementation(() => ({
      ...mockUserInput,
      save: saveMock,
    }));

    (jwt.sign as jest.Mock).mockReturnValue("mocked_token");

    const result = await userResolver.Mutation.createUser(null, {
      userInput: mockUserInput,
    });

    expect(connectDB).toHaveBeenCalled();
    expect(Users.findOne).toHaveBeenCalledWith({ email: mockUserInput.email });
    expect(bcrypt.hash).toHaveBeenCalledTimes(2); // for password and ssn
    expect(saveMock).toHaveBeenCalled();
    expect(result).toHaveProperty("email", mockUserInput.email);
  });
});

describe("userResolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Gets the user", async () => {
    const mockUser = {
      _id: "123abc",
      name: "Jane Doe",
      email: "jane@example.com",
    };

    Users.findById.mockResolvedValue(mockUser);

    const res = await userResolver.Query.getUser(null, { id: mockUser._id });

    expect(Users.findById).toHaveBeenCalledWith("123abc");
    expect(res).toEqual(mockUser);
  });
  it("Throws an error without id", async () => {
    await expect(
      userResolver.Query.getUser(null, { id: undefined })
    ).rejects.toThrow("No id provided.");
  });
});

describe("userResolver - me", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    _id: "user-id-123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    cards: [],
    accounts: [],
    populate: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user if session cookie is valid", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "mock.jwt.token" }),
    });

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user-id-123" });

    (Users.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue(mockUser),
    });

    const result = await userResolver.Query.me();
    expect(result).toEqual(mockUser);
    expect(cookies).toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalledWith(
      "mock.jwt.token",
      process.env.JWT_SECRET
    );
    expect(Users.findById).toHaveBeenCalledWith("user-id-123");
  });

  it("should return undefined if no session cookie", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    const result = await userResolver.Query.me();
    expect(result).toBeUndefined();
  });

  it("should return undefined if jwt is invalid", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "invalid.token" }),
    });

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    const result = await userResolver.Query.me();
    expect(result).toBeUndefined();
  });

  it("should return undefined if user is not found", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: "valid.token" }),
    });

    (jwt.verify as jest.Mock).mockReturnValue({ id: "not-found-id" });

    (Users.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue(null),
    });

    const result = await userResolver.Query.me();
    expect(result).toBeUndefined();
  });
});
