import mongoose, { Schema } from "mongoose";

const CardsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Users", default: [] },
  // owner: { type: Schema.Types.ObjectId, ref: "Users", default: [] },
  // coOwner: { type: Schema.Types.ObjectId, ref: "Users", default: [] },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  pin: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  cardNumber: { type: String, required: true },
  accounts: [{ type: Schema.Types.ObjectId, ref: "Accounts", default: [] }],
});

export default mongoose.models.Cards || mongoose.model("Cards", CardsSchema);
