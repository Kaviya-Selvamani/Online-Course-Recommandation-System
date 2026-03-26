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
const CONFIGURED_COLLECTIONS = (process.env.MIGRATE_COLLECTIONS || "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

function getBackupDir() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve(process.cwd(), "backups", `migration-${stamp}`);
}

async function getCollectionNames(connection) {
  if (CONFIGURED_COLLECTIONS.length) {
    return CONFIGURED_COLLECTIONS;
  }

  const collections = await connection.db.listCollections().toArray();
  return collections
    .map((entry) => entry.name)
    .filter((name) => name && !name.startsWith("system."));
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

async function mergeDocuments(targetCollection, docs) {
  const operations = docs.map((doc) => {
    if (doc && doc._id) {
      return {
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true,
        },
      };
    }

    return {
      insertOne: {
        document: doc,
      },
    };
  });

  if (!operations.length) {
    return { upsertedCount: 0, modifiedCount: 0, insertedCount: 0 };
  }

  return targetCollection.bulkWrite(operations, { ordered: false });
}

async function migrate() {
  if (!OLD_URI || !NEW_URI) {
    throw new Error("Set OLD_MONGO_URI and MONGO_URI in your environment.");
  }

  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();

  try {
    const collections = await getCollectionNames(oldConn);
    if (!collections.length) {
      throw new Error("No collections found in the old database.");
    }

    if (MODE === "overwrite") {
      console.log("Creating safety backup before overwrite...");
      await backupCollections(oldConn, collections);
    }

    console.log(`Collections to migrate: ${collections.join(", ")}`);

    for (const name of collections) {
      const docs = await oldConn.collection(name).find({}).toArray();
      if (!docs.length) {
        console.log(`Skipping ${name} (0 docs)`);
        continue;
      }

      const targetCollection = newConn.collection(name);

      if (MODE === "overwrite") {
        await targetCollection.deleteMany({});
        await targetCollection.insertMany(docs, { ordered: false });
        console.log(`Migrated ${docs.length} docs into ${name} (overwrite)`);
        continue;
      }

      const result = await mergeDocuments(targetCollection, docs);
      const insertedCount = result.insertedCount || 0;
      const upsertedCount = result.upsertedCount || 0;
      const modifiedCount = result.modifiedCount || 0;
      console.log(
        `Migrated ${docs.length} docs into ${name} (merge: inserted ${insertedCount}, upserted ${upsertedCount}, updated ${modifiedCount})`
      );
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
