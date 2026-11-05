import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment');

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then(
      () => {
        console.log("MongoDB connected successfully");
      },
      (error) => {
        connectionPromise = undefined;
        throw error;
      }
    );
  }

  await connectionPromise;
};

export default connectDB;