import { connectDB } from "@/mongodb/config";
import Users from "@/mongodb/models/Users";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Accounts from "@/mongodb/models/Accounts";
import Cards from "@/mongodb/models/Cards";
import Transactions from "@/mongodb/models/Transactions";
import { sendEmail } from "@/lib/sendEmail";
import { verifyUser } from "@/lib/verifyUser";
import { generateCardNumber } from "../../../../../utils/utils";

export const userResolver = {
  Query: {
    getUser: async (_: any, args: { id: string }) => {
      try {
        if (!args.id) throw new Error("No id provided.");

        await connectDB();

        const user = await Users.findById(args.id);

        if (!user) throw new Error("No user found.");

        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    me: async () => {
      try {
        const cookie = (await cookies()).get("session");

        if (!cookie) {
          console.log("No session");
          return;
        }

        console.log("Me cookie", cookie);

        let decoded: any;

        try {
          decoded = jwt.verify(cookie.value, process.env.JWT_SECRET!);
        } catch (error: any) {
          console.log("Error - ", error.message);
          return;
        }

        if (!decoded.id) {
          console.log("Decoding jwt failed");
          return;
        }

        const userId = decoded.id.toString();

        await connectDB();

        const user = await Users.findById(userId).populate([
          {
            path: "cards",
            populate: {
              path: "user",
            },
          },
          {
            path: "accounts",
          },
        ]);

        if (!user) {
          console.log("No user found");
          return;
        }

        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    seedDatabase: async () => {
      try {
        await connectDB();

        // User 1
        const user1 = new Users({
          firstName: "Pera",
          lastName: "Peric",
          address: "Vranje",
          state: "Vranje",
          postalCode: "17501",
          dateOfBirth: new Date("1990-01-01"),
          ssn: "1234",
          email: "pera@gmail.com",
          password: "password123",
        });
        await user1.save();

        const account1 = new Accounts({
          owner: user1._id,
          type: "savings",
          balance: 0,
        });
        await account1.save();

        const card1 = new Cards({
          user: user1._id,
          type: "debit",
          pin: "1234",
          cardNumber: "1111111111111111",
          accounts: [account1._id],
          expiry: new Date(
            new Date().setFullYear(new Date().getFullYear() + 3)
          ),
        });
        await card1.save();

        await Accounts.findByIdAndUpdate(account1._id, {
          cardNumber: card1._id,
        });

        // User 2
        const user2 = new Users({
          firstName: "Mika",
          lastName: "Mikic",
          address: "Nis",
          state: "Nis",
          postalCode: "18000",
          dateOfBirth: new Date("1992-05-20"),
          ssn: "5678",
          email: "mika@gmail.com",
          password: "password456",
        });
        await user2.save();

        const account2 = new Accounts({
          owner: user2._id,
          type: "checking",
          balance: 0,
        });
        await account2.save();

        const card2 = new Cards({
          user: user2._id,
          type: "credit",
          pin: "4321",
          cardNumber: "2222222222222222",
          accounts: [account2._id],
          expiry: new Date(
            new Date().setFullYear(new Date().getFullYear() + 3)
          ),
        });
        await card2.save();

        await Accounts.findByIdAndUpdate(account2._id, {
          cardNumber: card2._id,
        });

        const transaction1 = new Transactions({
          sender: account1._id,
          receiver: account2._id,
          amount: 10,
        });

        await transaction1.save();

        const transaction2 = new Transactions({
          sender: account2._id,
          receiver: account1._id,
          amount: 10,
        });

        await transaction2.save();

        console.log("Seeding done!");
        return true;
      } catch (error) {
        console.error("Seeding error:", error);
      }
    },
    createUser: async (
      _: any,
      args: {
        userInput: UserInput;
      }
    ) => {
      try {
        if (!args.userInput) throw new Error("Not enough data.");

        const {
          firstName,
          lastName,
          address,
          state,
          postalCode,
          dateOfBirth,
          ssn,
          email,
          password,
        } = args.userInput;

        if (
          !firstName ||
          !lastName ||
          !address ||
          !state ||
          !postalCode ||
          !dateOfBirth ||
          !ssn ||
          !email ||
          !password
        )
          throw new Error("Not enough data.");

        await connectDB();

        const userExists = await Users.findOne({ email });

        if (userExists) throw new Error("User with this email already exists.");

        const user = new Users({
          ...args.userInput,
          ssn: await bcrypt.hash(ssn, 10),
          password: await bcrypt.hash(password, 10),
          dateOfBirth: new Date(args.userInput.dateOfBirth),
          budgets: {
            entertainment: 100,
          },
          templates: [
            {
              receiverName: "Vukan Vuckovic",
              receiverAccount: "680a3b40b3dfd8c2b5a3e2d1",
              receiverEmail: "vukanvuckovic05@gmail.com",
            },
          ],
        });

        await user.save();
        if (!user) throw new Error("User creation failed.");

        const account = new Accounts({
          owner: user._id,
          type: "savings",
          balance: 100,
        });

        await account.save();
        if (!account) throw new Error("Bank account creation failed.");

        const card = new Cards({
          user: user._id,
          type: "debit",
          expiry: new Date().setFullYear(new Date().getFullYear() + 3),
          pin: 1234,
          cardNumber: generateCardNumber(),
          accounts: [account._id],
        });

        await card.save();
        if (!card) throw new Error("Bank card creation failed.");

        await Users.findByIdAndUpdate(user._id, {
          accounts: [account._id],
          cards: [card._id],
        });
        await Accounts.findByIdAndUpdate(account._id, {
          cardNumber: card._id,
        });

        sendEmail(email, "user created", "welcome");

        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    signIn: async (
      _: any,
      args: { userCredentials: { email: string; password: string } }
    ) => {
      try {
        const { email, password } = args.userCredentials;

        if (!email) throw new Error("No email");
        if (!password) throw new Error("No password");

        await connectDB();

        const user = await Users.findOne({ email })
          .populate("accounts")
          .populate({
            path: "cards",
            populate: {
              path: "user",
            },
          });

        if (!user) throw new Error("No user found with this email.");

        const verified = await bcrypt.compare(password, user.password);
        // const verified = password == user.password;

        if (!verified) throw new Error("Password is incorrect.");

        const userJwt = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
          expiresIn: "7d",
        });

        (await cookies()).set("session", userJwt, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 day
        });

        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    signOut: async () => {
      try {
        const cookie = (await cookies()).get("session");

        if (!cookie) {
          console.log("No session");
          return;
        }

        (await cookies()).delete("session");

        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    updateUser: async (_: any, args: { userInfo: UserInput; id: string }) => {
      try {
        const { id, userInfo } = args;

        if (!id) throw new Error("No id provided");
        if (!userInfo) throw new Error("No user info provided");

        await connectDB();

        const verified = await verifyUser(id);
        if (!verified) throw new Error("Not authorized");

        const emailExists = await Users.findOne({
          email: userInfo.email,
        });

        if (emailExists)
          throw new Error("User with that email is already registered.");

        const user = await Users.findByIdAndUpdate(
          id,
          {
            ...userInfo,
            ssn:
              userInfo.ssn === ""
                ? undefined
                : await bcrypt.hash(userInfo.ssn, 10),
            password:
              userInfo.password === ""
                ? undefined
                : await bcrypt.hash(userInfo.password, 10),
          },
          { new: true }
        );

        if (!user) throw new Error("No user found with this id");

        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    deleteUser: async (_: any, args: any) => {
      try {
        const { id } = args.id;
        if (!id) throw new Error("No id provided");

        const verified = await verifyUser(id);
        if (!verified) throw new Error("Not authorized");

        await connectDB();

        const user = await Users.findByIdAndDelete(id);

        if (!user) throw new Error("No user found with this id");

        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    createTemplate: async (
      _: any,
      args: {
        templateInfo: {
          userId: string;
          receiverName: string;
          receiverEmail: string;
          receiverAccount: string;
        };
      }
    ) => {
      try {
        if (!args.templateInfo) throw new Error("No template info");

        const { receiverName, receiverEmail, receiverAccount, userId } =
          args.templateInfo;

        if (!receiverAccount || !receiverEmail || !receiverName || !userId)
          throw new Error("Not enough data");

        const verified = await verifyUser(userId);
        if (!verified) throw new Error("Not authorized");

        await connectDB();

        const template = {
          receiverName,
          receiverEmail,
          receiverAccount,
        };

        const templateExists = await Users.findOne({
          _id: userId,
          templates: {
            $elemMatch: { receiverAccount },
          },
        });

        if (templateExists)
          throw new Error("Template with this account number already exists.");

        const updatedUser = await Users.findByIdAndUpdate(
          userId,
          { $push: { templates: template } },
          { new: true }
        );

        if (!updatedUser) throw new Error("Error creating template");

        const newTemplate =
          updatedUser.templates[updatedUser.templates.length - 1];

        return newTemplate;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    editTemplate: async (
      _: any,
      args: {
        templateInfo: {
          userId: string;
          receiverName: string;
          receiverEmail: string;
          receiverAccount: string;
          templateId: string;
        };
      }
    ) => {
      try {
        if (!args.templateInfo) throw new Error("No template info");

        const {
          receiverName,
          receiverEmail,
          receiverAccount,
          templateId,
          userId,
        } = args.templateInfo;

        if (
          (!receiverAccount && !receiverEmail && !receiverName) ||
          !templateId ||
          !userId
        ) {
          throw new Error("Not enough data");
        }

        const verified = await verifyUser(userId);
        if (!verified) throw new Error("Not authorized");

        await connectDB();

        const updatedUser = await Users.findOneAndUpdate(
          { _id: userId, "templates._id": templateId },
          {
            $set: {
              "templates.$.receiverName": receiverName,
              "templates.$.receiverEmail": receiverEmail,
              "templates.$.receiverAccount": receiverAccount,
            },
          },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("Template not found or user does not exist");
        }

        const updatedTemplate = updatedUser.templates.find(
          (t: any) => t._id.toString() === templateId
        );

        if (!updatedTemplate) {
          throw new Error("Updated template not found");
        }

        return updatedTemplate;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    deleteTemplate: async (
      _: any,
      args: { templateId: string; userId: string }
    ) => {
      try {
        const { templateId, userId } = args;

        if (!templateId || !userId) throw new Error("No userId or templateId");

        const verified = await verifyUser(userId);
        if (!verified) throw new Error("Not authorized");

        await connectDB();

        const user = await Users.findById(userId);
        if (!user) throw new Error("User not found");

        const templateToDelete = user.templates.find(
          (template: any) => template._id.toString() === templateId
        );

        if (!templateToDelete) throw new Error("Template not found");

        await Users.findByIdAndUpdate(userId, {
          $pull: { templates: { _id: templateId } },
        });

        return templateToDelete;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    setBudget: async (_: any, args: { budgetInfo: any }) => {
      try {
        const { budget, value, userId } = args.budgetInfo;
        if (!budget || !userId) throw new Error("No budget provided");

        await connectDB();

        if (value < 0) throw new Error("Budget cannot be less than 0");

        const updateQuery =
          value <= 0 || !value
            ? { $unset: { [`budgets.${budget}`]: "" } }
            : { $set: { [`budgets.${budget}`]: value } };

        const updatedUser = await Users.findByIdAndUpdate(userId, updateQuery, {
          new: true,
        });

        if (!updatedUser) throw new Error("Setting budget failed.");

        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};
