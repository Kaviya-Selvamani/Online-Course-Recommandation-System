import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment.");
  }

  const conn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();

  try {
    const collections = await conn.db.listCollections().toArray();
    const names = collections
      .map((entry) => entry.name)
      .filter((name) => name && !name.startsWith("system."))
      .sort();

    if (!names.length) {
      console.log("No collections found.");
      return;
    }

    for (const name of names) {
      const count = await conn.collection(name).countDocuments();
      console.log(`${name}: ${count}`);
    }
  } finally {
    await conn.close();
  }
}

main().catch((error) => {
  console.error("DB summary failed:", error);
  process.exit(1);
});
