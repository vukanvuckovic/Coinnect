import mongoose from "mongoose";

const MONGODB_URI = process.env.CONNECTION_URL!;

if (!MONGODB_URI) {
  throw new Error("Please define the CONNECTION_URL in .env.local");
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "Coinnect",
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
