import fs from "fs";
import path from "path";

const BASE = "https://schooldb.co.in";
const API_DIR = "src/app/api";

const CONCURRENCY = 5;
const TIMEOUT = 10000;

/* Clerk cookie from browser after login */
const CLERK_SESSION =
  "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18ycDV0dHVxV2pRVFJrNU02OFJZTmFlaE5TWjMiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3d3dy5zY2hvb2xkYi5jby5pbiIsImV4cCI6MTc3MjkwNjgwOSwiZnZhIjpbODcxOSwtMV0sImlhdCI6MTc3MjkwNjc0OSwiaXNzIjoiaHR0cHM6Ly92b2NhbC1kb2UtNDcuY2xlcmsuYWNjb3VudHMuZGV2IiwianRpIjoiMjg3ZDM5YzNmYjYyZDllODU5ODMiLCJuYmYiOjE3NzI5MDY3MzksInJvbGUiOiJhZG1pbiIsInNpZCI6InNlc3NfM0FMdERWa0RzRDgyZVF5c21laDJuS2pialBTIiwic3RzIjoiYWN0aXZlIiwic3ViIjoidXNlcl8zNGhEUVVNdUhvUHR2YVdNV3NybllhQVl6dHUifQ.dW9AMOnta6CUueFgsjtJd9JrmCL27jggv-qndVpVEs-xqekePOpm8d7CRtDp2CDncNpUIO_nKHPZSxGttySo0xiaAcj7zTknwONgctGcxRJjiTfE-32HSEt8mkaPjcjMA4gPBq0iMOpwogsHKq5XZwwe_A0e0RotdubNgi30wTCDsDIKMI2L5o85pnrjkf3sMMYJUkalBBq4O_mbC3LVeEyLSGpPCQBI1JSo-s_W5hEvCL5ngSdcq0nzvqzbLoniuzNVcYhznT_63UFVFYboMXk4qSi4NYU6munBO6UoYMiN2puNqwF1ImIG3PYmwuPEFI2ySrBIiAqUTUX75aCFKQ";

const AUTH_HEADERS = {
  Cookie: `__session=${CLERK_SESSION}`,
  "Content-Type": "application/json",
};

type RouteTest = {
  endpoint: string;
  methods: string[];
};

type Stats = {
  total: number;
  ok: number;
  auth: number;
  method: number;
  server: number;
  network: number;
};

const stats: Stats = {
  total: 0,
  ok: 0,
  auth: 0,
  method: 0,
  server: 0,
  network: 0,
};

function findRoutes(dir: string, routes: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      findRoutes(full, routes);
      continue;
    }

    if (file === "route.ts") routes.push(full);
  }

  return routes;
}

function detectMethods(filePath: string): string[] {
  const code = fs.readFileSync(filePath, "utf8");
  const methods: string[] = [];

  if (code.includes("export async function GET")) methods.push("GET");
  if (code.includes("export async function POST")) methods.push("POST");
  if (code.includes("export async function PUT")) methods.push("PUT");
  if (code.includes("export async function DELETE")) methods.push("DELETE");

  return methods.length ? methods : ["GET"];
}

function convertToEndpoint(file: string): string {
  return file
    .replace(/\\/g, "/")
    .replace("src/app", "")
    .replace("route.ts", "")
    .replace(/\[schoolId\]/g, "test")
    .replace(/\[id\]/g, "1")
    .replace(/\[jobId\]/g, "1")
    .replace(/^\/+/, "/");
}

function classify(status: number) {
  if (status >= 200 && status < 300) return "OK";
  if (status === 401) return "AUTH";
  if (status === 405) return "METHOD";
  if (status >= 500) return "SERVER";
  return "OTHER";
}

async function requestWithTimeout(url: string, method: string) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(url, {
      method,
      headers: AUTH_HEADERS,
      signal: controller.signal,
    });

    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function testRoute(test: RouteTest) {
  const method = test.methods[0];
  const url = BASE + test.endpoint;

  stats.total++;

  const start = Date.now();

  try {
    const res = await requestWithTimeout(url, method);

    const time = Date.now() - start;
    const type = classify(res.status);

    if (type === "OK") stats.ok++;
    else if (type === "AUTH") stats.auth++;
    else if (type === "METHOD") stats.method++;
    else if (type === "SERVER") stats.server++;

    console.log(
      `${type.padEnd(7)} ${method.padEnd(6)} ${test.endpoint} -> ${
        res.status
      } (${time}ms)`
    );
  } catch {
    stats.network++;
    console.log(
      `NETWORK ${method.padEnd(6)} ${test.endpoint} -> request failed`
    );
  }
}

async function runTests() {
  const routes = findRoutes(API_DIR);

  const tests: RouteTest[] = routes.map((file) => ({
    endpoint: convertToEndpoint(file),
    methods: detectMethods(file),
  }));

  console.log(`\n🚀 Testing ${tests.length} APIs (Clerk Authenticated)\n`);

  const queue = [...tests];

  const workers = Array.from({ length: CONCURRENCY }).map(async () => {
    while (queue.length) {
      const next = queue.shift();
      if (next) await testRoute(next);
    }
  });

  await Promise.all(workers);

  console.log("\n📊 API TEST SUMMARY");
  console.log("----------------------");
  console.log(BASE);
  console.log(`Total APIs : ${stats.total}`);
  console.log(`OK         : ${stats.ok}`);
  console.log(`Auth Req   : ${stats.auth}`);
  console.log(`Method Err : ${stats.method}`);
  console.log(`Server Err : ${stats.server}`);
  console.log(`Network    : ${stats.network}`);
}

runTests();

/* ======================================================
   npm run test:all-apis
====================================================== */