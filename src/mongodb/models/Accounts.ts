import mongoose, { Schema } from "mongoose";

const AccountsSchmea = new Schema({
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

  cardNumber: {
    type: Schema.Types.ObjectId,
    ref: "Cards",
  },
  transactions: [
    { type: Schema.Types.ObjectId, ref: "Transactions", default: [] },
  ],
});

export default mongoose.models.Accounts ||
  mongoose.model("Accounts", AccountsSchmea);
