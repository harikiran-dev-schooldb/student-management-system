import fs from "fs";
import path from "path";

const BASE = "http://localhost:3000";
const API_DIR = "src/app/api";

type RouteTest = {
  endpoint: string;
  methods: string[];
};

const stats = {
  total: 0,
  ok: 0,
  auth: 0,
  method: 0,
  error: 0,
};

function findRoutes(dir: string, routes: string[] = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      findRoutes(full, routes);
    }

    if (file === "route.ts") {
      routes.push(full);
    }
  }

  return routes;
}

function detectMethods(filePath: string) {
  const code = fs.readFileSync(filePath, "utf8");

  const methods: string[] = [];

  if (code.includes("export async function GET")) methods.push("GET");
  if (code.includes("export async function POST")) methods.push("POST");
  if (code.includes("export async function PUT")) methods.push("PUT");
  if (code.includes("export async function DELETE")) methods.push("DELETE");

  return methods.length ? methods : ["GET"];
}

function convertToEndpoint(file: string) {
  return (
    file
      .replace(/\\/g, "/")
      .replace("src/app", "")
      .replace("route.ts", "")
      .replace(/\[schoolId\]/g, "test")
      .replace(/\[id\]/g, "1")
      .replace(/\[jobId\]/g, "1")
      .replace(/^\/+/, "/")
  );
}

function classify(status: number) {
  if (status === 200) return "OK";
  if (status === 401) return "AUTH";
  if (status === 405) return "METHOD";
  if (status >= 500) return "ERROR";
  return "OTHER";
}

async function runTests() {
  const routes = findRoutes(API_DIR);

  const tests: RouteTest[] = routes.map((file) => ({
    endpoint: convertToEndpoint(file),
    methods: detectMethods(file),
  }));

  console.log(`\n🚀 Testing ${tests.length} APIs in parallel\n`);

  const promises = tests.map(async (t) => {
    const method = t.methods[0]; // only first method

    stats.total++;

    try {
      const res = await fetch(BASE + t.endpoint, { method });

      const type = classify(res.status);

      if (type === "OK") stats.ok++;
      else if (type === "AUTH") stats.auth++;
      else if (type === "METHOD") stats.method++;
      else if (type === "ERROR") stats.error++;

      console.log(
        `${type.padEnd(7)} ${method.padEnd(6)} ${t.endpoint} -> ${res.status}`
      );
    } catch {
      stats.error++;
      console.log(`ERROR   ${method.padEnd(6)} ${t.endpoint} -> request failed`);
    }
  });

  await Promise.all(promises);

  console.log("\n📊 API TEST SUMMARY");
  console.log("----------------------");
  console.log(`Total APIs : ${stats.total}`);
  console.log(`OK         : ${stats.ok}`);
  console.log(`Auth Req   : ${stats.auth}`);
  console.log(`Method Err : ${stats.method}`);
  console.log(`Server Err : ${stats.error}`);
}

runTests();

/* ======================================================
   npm run test:all-apis
====================================================== */