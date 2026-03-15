import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) {
    process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
  }
}

const CONNECTION_URL = process.env.CONNECTION_URL;
if (!CONNECTION_URL) throw new Error("CONNECTION_URL not set");

// ── Schemas (mirrors src/mongodb/models) ──────────────────────────────────────

const TemplateSchema = new Schema({
  receiverName: { type: String, required: true },
  receiverAccount: { type: String, required: true },
  receiverEmail: { type: String, required: true },
});

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  ssn: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  accounts: [{ type: Schema.Types.ObjectId, ref: "Accounts", default: [] }],
  cards: [{ type: Schema.Types.ObjectId, ref: "Cards", default: [] }],
  templates: { type: [TemplateSchema], default: [] },
  budgets: {
    entertainment: { type: Number },
    food: { type: Number },
    travel: { type: Number },
    debt: { type: Number },
    general: { type: Number },
  },
});

const AccountsSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  coOwner: { type: Schema.Types.ObjectId, ref: "Users" },
  type: {
    type: String,
    enum: ["checking", "savings", "credit", "joint", "business"],
    required: true,
  },
  balance: { type: Number, default: 0 },
  interest: { type: Number },
  disabled: { type: Boolean, default: false },
  accountName: { type: String },
  accountNumber: { type: String, unique: true },
  cardNumber: { type: Schema.Types.ObjectId, ref: "Cards" },
  transactions: [{ type: Schema.Types.ObjectId, ref: "Transactions", default: [] }],
});

const CardsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Users", default: [] },
  type: { type: String, enum: ["credit", "debit"], required: true },
  expiry: { type: Date, required: true },
  pin: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  cardNumber: { type: String, required: true },
  accounts: [{ type: Schema.Types.ObjectId, ref: "Accounts", default: [] }],
});

const StaticUserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    accountId: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const TransactionsSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "Accounts", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "Accounts", required: true },
    senderStatic: StaticUserSchema,
    receiverStatic: StaticUserSchema,
    amount: { type: Number, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "declined"],
      default: "pending",
    },
    category: {
      type: String,
      enum: ["entertainment", "food", "travel", "debt", "general"],
      default: "general",
    },
  },
  { timestamps: true }
);

// ── Connect ───────────────────────────────────────────────────────────────────

await mongoose.connect(CONNECTION_URL, {
  dbName: "Coinnect",
  serverApi: { version: "1", strict: true, deprecationErrors: true },
});
console.log("Connected to MongoDB");

const Users = mongoose.model("Users", UserSchema);
const Accounts = mongoose.model("Accounts", AccountsSchema);
const Cards = mongoose.model("Cards", CardsSchema);
const Transactions = mongoose.model("Transactions", TransactionsSchema);

// ── Wipe everything ───────────────────────────────────────────────────────────

await Promise.all([
  Users.deleteMany({}),
  Accounts.deleteMany({}),
  Cards.deleteMany({}),
  Transactions.deleteMany({}),
]);
console.log("All collections cleared");

// ── Demo user ─────────────────────────────────────────────────────────────────

const hashedPassword = await bcrypt.hash("demo1234", 10);
const placeholderPassword = await bcrypt.hash("placeholder999", 10);

const demoUser = await Users.create({
  firstName: "Alex",
  lastName: "Morgan",
  address: "742 Evergreen Terrace",
  state: "California",
  postalCode: "90210",
  dateOfBirth: new Date("1992-06-15"),
  ssn: "000-00-0000",
  email: "demo@coinnect.app",
  password: hashedPassword,
  budgets: {
    entertainment: 300,
    food: 600,
    travel: 500,
    debt: 200,
    general: 400,
  },
});

// ── Template recipient users (needed so transfers to them work) ───────────────

const jordanUser = await Users.create({
  firstName: "Jordan",
  lastName: "Lee",
  address: "15 Oak Street",
  state: "New York",
  postalCode: "10001",
  dateOfBirth: new Date("1990-03-22"),
  ssn: "000-00-0001",
  email: "jordan.lee@example.com",
  password: placeholderPassword,
});

const landlordUser = await Users.create({
  firstName: "Oak",
  lastName: "Properties",
  address: "1 Commerce Plaza",
  state: "California",
  postalCode: "90001",
  dateOfBirth: new Date("1985-01-01"),
  ssn: "000-00-0002",
  email: "payments@oakproperties.com",
  password: placeholderPassword,
});

const momUser = await Users.create({
  firstName: "Linda",
  lastName: "Morgan",
  address: "18 Maple Ave",
  state: "Ohio",
  postalCode: "43215",
  dateOfBirth: new Date("1965-09-10"),
  ssn: "000-00-0003",
  email: "mom@gmail.com",
  password: placeholderPassword,
});

// ── Cards ─────────────────────────────────────────────────────────────────────

const debitCard = await Cards.create({
  user: demoUser._id,
  type: "debit",
  expiry: new Date("2027-08-01"),
  pin: 4821,
  cardNumber: "4111 1111 1111 1111",
  accounts: [],
});

const creditCard = await Cards.create({
  user: demoUser._id,
  type: "credit",
  expiry: new Date("2026-11-01"),
  pin: 7293,
  cardNumber: "5500 0000 0000 0004",
  accounts: [],
});

// ── Demo user's accounts ──────────────────────────────────────────────────────

const checkingAccount = await Accounts.create({
  owner: demoUser._id,
  type: "checking",
  balance: 4285.50,
  accountName: "Main Checking",
  accountNumber: "1000200030004001",
  cardNumber: debitCard._id,
  transactions: [],
});

const savingsAccount = await Accounts.create({
  owner: demoUser._id,
  type: "savings",
  balance: 12750.00,
  interest: 4.5,
  accountName: "High-Yield Savings",
  accountNumber: "1000200030004002",
  transactions: [],
});

const creditAccount = await Accounts.create({
  owner: demoUser._id,
  type: "credit",
  balance: -1340.00,
  interest: 19.99,
  accountName: "Rewards Credit",
  accountNumber: "1000200030004003",
  cardNumber: creditCard._id,
  transactions: [],
});

// Link cards <-> accounts
debitCard.accounts.push(checkingAccount._id);
await debitCard.save();
creditCard.accounts.push(creditAccount._id);
await creditCard.save();

// ── Template recipient accounts (owned by separate users) ─────────────────────

const jordanAccount = await Accounts.create({
  owner: jordanUser._id,
  type: "checking",
  balance: 2400,
  accountName: "Jordan's Checking",
  accountNumber: "9999888877776666",
  transactions: [],
});

const landlordAccount = await Accounts.create({
  owner: landlordUser._id,
  type: "business",
  balance: 50000,
  accountName: "Oak Properties Business",
  accountNumber: "3333444455556666",
  transactions: [],
});

const momAccount = await Accounts.create({
  owner: momUser._id,
  type: "checking",
  balance: 3100,
  accountName: "Linda's Checking",
  accountNumber: "1122334455667788",
  transactions: [],
});

// Update recipient users with their accounts
await Users.updateOne({ _id: jordanUser._id }, { $set: { accounts: [jordanAccount._id] } });
await Users.updateOne({ _id: landlordUser._id }, { $set: { accounts: [landlordAccount._id] } });
await Users.updateOne({ _id: momUser._id }, { $set: { accounts: [momAccount._id] } });

// ── Helper ────────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const demoStatic = {
  firstName: "Alex",
  lastName: "Morgan",
  accountId: checkingAccount._id.toString(),
  email: "demo@coinnect.app",
};

const creditStatic = {
  firstName: "Alex",
  lastName: "Morgan",
  accountId: creditAccount._id.toString(),
  email: "demo@coinnect.app",
};

const jordanStatic = {
  firstName: "Jordan",
  lastName: "Lee",
  accountId: jordanAccount._id.toString(),
  email: "jordan.lee@example.com",
};

// ── Transactions ──────────────────────────────────────────────────────────────

const txDefs = [
  // Checking → Savings: savings transfer
  {
    sender: checkingAccount._id,
    receiver: savingsAccount._id,
    senderStatic: demoStatic,
    receiverStatic: { ...demoStatic, accountId: savingsAccount._id.toString() },
    amount: 500,
    note: "Monthly savings transfer",
    status: "completed",
    category: "general",
    createdAt: daysAgo(3),
  },
  // Jordan → Checking: incoming salary
  {
    sender: jordanAccount._id,
    receiver: checkingAccount._id,
    senderStatic: jordanStatic,
    receiverStatic: demoStatic,
    amount: 3200,
    note: "Salary — March",
    status: "completed",
    category: "general",
    createdAt: daysAgo(7),
  },
  // Checking → Landlord: rent
  {
    sender: checkingAccount._id,
    receiver: landlordAccount._id,
    senderStatic: demoStatic,
    receiverStatic: {
      firstName: "Oak",
      lastName: "Properties",
      accountId: landlordAccount._id.toString(),
      email: "payments@oakproperties.com",
    },
    amount: 1450,
    note: "Rent payment",
    status: "completed",
    category: "general",
    createdAt: daysAgo(10),
  },
  // Checking → Jordan: groceries split
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 87.40,
    note: "Whole Foods run",
    status: "completed",
    category: "food",
    createdAt: daysAgo(12),
  },
  // Checking → Jordan: Netflix split
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 15.99,
    note: "Netflix subscription",
    status: "completed",
    category: "entertainment",
    createdAt: daysAgo(14),
  },
  // Checking → Jordan: flight booking
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 324.00,
    note: "Flight — NYC to LA",
    status: "completed",
    category: "travel",
    createdAt: daysAgo(20),
  },
  // Jordan → Checking: freelance payment
  {
    sender: jordanAccount._id,
    receiver: checkingAccount._id,
    senderStatic: jordanStatic,
    receiverStatic: demoStatic,
    amount: 850,
    note: "Freelance invoice #42",
    status: "completed",
    category: "general",
    createdAt: daysAgo(22),
  },
  // Checking → Jordan: dinner split
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 62.50,
    note: "Dinner at Nobu",
    status: "completed",
    category: "food",
    createdAt: daysAgo(25),
  },
  // Checking → Jordan: loan repayment
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 200,
    note: "Student loan payment",
    status: "completed",
    category: "debt",
    createdAt: daysAgo(28),
  },
  // Checking → Jordan: Spotify
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 9.99,
    note: "Spotify Premium",
    status: "completed",
    category: "entertainment",
    createdAt: daysAgo(30),
  },
  // Jordan → Checking: older salary
  {
    sender: jordanAccount._id,
    receiver: checkingAccount._id,
    senderStatic: jordanStatic,
    receiverStatic: demoStatic,
    amount: 3200,
    note: "Salary — February",
    status: "completed",
    category: "general",
    createdAt: daysAgo(37),
  },
  // Checking → Jordan: hotel
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 420,
    note: "Hotel — San Francisco",
    status: "completed",
    category: "travel",
    createdAt: daysAgo(42),
  },
  // Checking → Landlord: rent (previous month)
  {
    sender: checkingAccount._id,
    receiver: landlordAccount._id,
    senderStatic: demoStatic,
    receiverStatic: {
      firstName: "Oak",
      lastName: "Properties",
      accountId: landlordAccount._id.toString(),
      email: "payments@oakproperties.com",
    },
    amount: 1450,
    note: "Rent payment — February",
    status: "completed",
    category: "general",
    createdAt: daysAgo(40),
  },
  // Pending transaction
  {
    sender: checkingAccount._id,
    receiver: jordanAccount._id,
    senderStatic: demoStatic,
    receiverStatic: jordanStatic,
    amount: 250,
    note: "Transfer to Jordan",
    status: "pending",
    category: "general",
    createdAt: daysAgo(1),
  },

  // ── Credit card purchases (creditAccount → external) ──────────────────────

  // Credit → Jordan: online shopping
  {
    sender: creditAccount._id,
    receiver: jordanAccount._id,
    senderStatic: creditStatic,
    receiverStatic: jordanStatic,
    amount: 129.99,
    note: "Amazon order",
    status: "completed",
    category: "general",
    createdAt: daysAgo(5),
  },
  // Credit → Jordan: restaurant
  {
    sender: creditAccount._id,
    receiver: jordanAccount._id,
    senderStatic: creditStatic,
    receiverStatic: jordanStatic,
    amount: 74.50,
    note: "Dinner — Catch LA",
    status: "completed",
    category: "food",
    createdAt: daysAgo(9),
  },
  // Credit → Jordan: concert tickets
  {
    sender: creditAccount._id,
    receiver: jordanAccount._id,
    senderStatic: creditStatic,
    receiverStatic: jordanStatic,
    amount: 210.00,
    note: "Concert tickets",
    status: "completed",
    category: "entertainment",
    createdAt: daysAgo(15),
  },
  // Credit → Landlord: flight
  {
    sender: creditAccount._id,
    receiver: landlordAccount._id,
    senderStatic: creditStatic,
    receiverStatic: {
      firstName: "Oak",
      lastName: "Properties",
      accountId: landlordAccount._id.toString(),
      email: "payments@oakproperties.com",
    },
    amount: 487.00,
    note: "Flight — LA to Miami",
    status: "completed",
    category: "travel",
    createdAt: daysAgo(18),
  },
  // Credit → Jordan: groceries
  {
    sender: creditAccount._id,
    receiver: jordanAccount._id,
    senderStatic: creditStatic,
    receiverStatic: jordanStatic,
    amount: 93.20,
    note: "Trader Joe's run",
    status: "completed",
    category: "food",
    createdAt: daysAgo(23),
  },
  // Credit → Jordan: gym membership
  {
    sender: creditAccount._id,
    receiver: jordanAccount._id,
    senderStatic: creditStatic,
    receiverStatic: jordanStatic,
    amount: 49.99,
    note: "Equinox membership",
    status: "completed",
    category: "general",
    createdAt: daysAgo(32),
  },
  // Checking → Credit: credit card payment
  {
    sender: checkingAccount._id,
    receiver: creditAccount._id,
    senderStatic: demoStatic,
    receiverStatic: creditStatic,
    amount: 600,
    note: "Credit card payment",
    status: "completed",
    category: "debt",
    createdAt: daysAgo(35),
  },

  // ── Savings interest deposit (Jordan → Savings) ───────────────────────────

  {
    sender: jordanAccount._id,
    receiver: savingsAccount._id,
    senderStatic: jordanStatic,
    receiverStatic: { ...demoStatic, accountId: savingsAccount._id.toString() },
    amount: 47.81,
    note: "Monthly interest",
    status: "completed",
    category: "general",
    createdAt: daysAgo(6),
  },
  {
    sender: jordanAccount._id,
    receiver: savingsAccount._id,
    senderStatic: jordanStatic,
    receiverStatic: { ...demoStatic, accountId: savingsAccount._id.toString() },
    amount: 45.20,
    note: "Monthly interest",
    status: "completed",
    category: "general",
    createdAt: daysAgo(36),
  },
];

const createdTxs = await Transactions.insertMany(txDefs);
console.log(`Created ${createdTxs.length} transactions`);

// Attach transaction IDs to accounts
const checkingTxIds = createdTxs
  .filter(
    (t) =>
      t.sender.toString() === checkingAccount._id.toString() ||
      t.receiver.toString() === checkingAccount._id.toString()
  )
  .map((t) => t._id);

const savingsTxIds = createdTxs
  .filter(
    (t) =>
      t.sender.toString() === savingsAccount._id.toString() ||
      t.receiver.toString() === savingsAccount._id.toString()
  )
  .map((t) => t._id);

const creditTxIds = createdTxs
  .filter(
    (t) =>
      t.sender.toString() === creditAccount._id.toString() ||
      t.receiver.toString() === creditAccount._id.toString()
  )
  .map((t) => t._id);

await Accounts.updateOne(
  { _id: checkingAccount._id },
  { $set: { transactions: checkingTxIds } }
);
await Accounts.updateOne(
  { _id: savingsAccount._id },
  { $set: { transactions: savingsTxIds } }
);
await Accounts.updateOne(
  { _id: creditAccount._id },
  { $set: { transactions: creditTxIds } }
);

// ── Templates — use actual MongoDB ObjectIds as receiverAccount ───────────────

const templates = [
  {
    receiverName: "Jordan Lee",
    receiverAccount: jordanAccount._id.toString(),
    receiverEmail: "jordan.lee@example.com",
  },
  {
    receiverName: "Landlord - Oak Properties",
    receiverAccount: landlordAccount._id.toString(),
    receiverEmail: "payments@oakproperties.com",
  },
  {
    receiverName: "Mom",
    receiverAccount: momAccount._id.toString(),
    receiverEmail: "mom@gmail.com",
  },
];

// Update demo user with account/card/template refs
await Users.updateOne(
  { _id: demoUser._id },
  {
    $set: {
      accounts: [checkingAccount._id, savingsAccount._id, creditAccount._id],
      cards: [debitCard._id, creditCard._id],
      templates,
    },
  }
);

console.log("\nDemo user seeded:");
console.log("  Email:    demo@coinnect.app");
console.log("  Password: demo1234");
console.log("  Accounts: Main Checking, High-Yield Savings, Rewards Credit");
console.log("  Cards:    Debit (Visa), Credit (Mastercard)");
console.log("\nTemplate recipients created:");
console.log(`  Jordan Lee      → account ID: ${jordanAccount._id}`);
console.log(`  Oak Properties  → account ID: ${landlordAccount._id}`);
console.log(`  Mom (Linda)     → account ID: ${momAccount._id}`);

await mongoose.disconnect();
console.log("\nDone.");
