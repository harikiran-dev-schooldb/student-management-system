import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error("Missing Clerk Secret Key");
  process.exit(1);
}

const BASE_URL = "https://api.clerk.dev/v1";
const LIMIT = 100;

// 🔐 WHITELIST
const KEEP_EXTERNAL_IDS = ["7801049830", "7337002305"];

const KEEP_USER_IDS = [
  "user_3B9DGSgLsbgiz4DlCDqh6o74mJL",
  "user_3BBkjsRdMDHlRkc90GNeA69mu82",
];

// 🧪 DRY RUN MODE (set false to actually delete)
const DRY_RUN = false;

async function fetchAllUsers() {
  let users = [];
  let offset = 0;

  while (true) {
    const res = await fetch(
      `${BASE_URL}/users?limit=${LIMIT}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) break;

    users.push(...data);
    offset += LIMIT;
  }

  return users;
}

async function deleteUsers() {
  const users = await fetchAllUsers();

  console.log(`Total users: ${users.length}`);

  for (const user of users) {
    const externalId = user.external_id;

    const shouldKeep =
      KEEP_EXTERNAL_IDS.includes(externalId) ||
      KEEP_USER_IDS.includes(user.id) ||
      user.public_metadata?.role === "admin" ||
      user.public_metadata?.schoolId === "testing";

    if (shouldKeep) {
      console.log(`⏭ KEEP: ${user.id} (${externalId})`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`⚠️ WILL DELETE: ${user.id} (${externalId})`);
      continue;
    }

    const res = await fetch(`${BASE_URL}/users/${user.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (res.ok) {
      console.log(`✅ Deleted: ${user.id}`);
    } else {
      console.error(`❌ Failed: ${user.id}`);
    }
  }

  console.log("Done");
}

deleteUsers();