import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const OLD_URI = process.env.OLD_MONGO_URI;
const NEW_URI = process.env.MONGO_URI;
const MODE = process.env.MIGRATE_MODE || "merge"; // merge | overwrite

const COLLECTIONS = [
  "users",
  "courses",
  "enrollments",
  "feedbacks",
  "activitylogs",
  "recommendations",
];

async function migrate() {
  if (!OLD_URI || !NEW_URI) {
    throw new Error("Set OLD_MONGO_URI and MONGO_URI in your environment.");
  }

  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();

  try {
    for (const name of COLLECTIONS) {
      const docs = await oldConn.collection(name).find({}).toArray();
      if (!docs.length) {
        console.log(`Skipping ${name} (0 docs)`);
        continue;
      }

      if (MODE === "overwrite") {
        await newConn.collection(name).deleteMany({});
      }

      await newConn.collection(name).insertMany(docs, { ordered: false });
      console.log(`Migrated ${docs.length} docs into ${name}`);
    }
  } finally {
    await oldConn.close();
    await newConn.close();
  }
}

migrate()
  .then(() => {
    console.log("Migration complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
