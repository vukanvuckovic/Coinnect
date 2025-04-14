import mongoose, { Schema } from "mongoose";

const StaticUserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    accountId: { type: String, required: true },
    email: { type: String, required: true },
  },
  {
    _id: false,
  }
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
  {
    timestamps: true,
  }
);

export default mongoose.models.Transactions ||
  mongoose.model("Transactions", TransactionsSchema);
