import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { seedAll } from "./seedAll.js";

dotenv.config();

const OLD_URI = process.env.OLD_MONGO_URI;
const NEW_URI = process.env.MONGO_URI;
const MODE = process.env.MIGRATE_MODE || "merge"; // merge | overwrite
const AUTO_SEED = process.env.MIGRATE_SEED === "true";

const COLLECTIONS = [
  "users",
  "courses",
  "enrollments",
  "feedbacks",
  "activitylogs",
  "recommendations",
];

function getBackupDir() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve(process.cwd(), "backups", `migration-${stamp}`);
}

async function backupCollections(oldConn, collections) {
  const dir = getBackupDir();
  await fs.mkdir(dir, { recursive: true });
  for (const name of collections) {
    const docs = await oldConn.collection(name).find({}).toArray();
    const file = path.join(dir, `${name}.json`);
    await fs.writeFile(file, JSON.stringify(docs, null, 2));
    console.log(`Backup written: ${file} (${docs.length} docs)`);
  }
}

async function migrate() {
  if (!OLD_URI || !NEW_URI) {
    throw new Error("Set OLD_MONGO_URI and MONGO_URI in your environment.");
  }

  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();

  try {
    if (MODE === "overwrite") {
      console.log("Creating safety backup before overwrite...");
      await backupCollections(oldConn, COLLECTIONS);
    }

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

  if (AUTO_SEED) {
    console.log("Auto-seeding after migration...");
    await seedAll({ clear: false });
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
