import mongoose, { Schema } from "mongoose";

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

// Use mongoose.models to prevent overwriting the model if it already exists
export default mongoose.models.Users || mongoose.model("Users", UserSchema);
