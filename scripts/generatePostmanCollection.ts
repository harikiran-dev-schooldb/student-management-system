import fs from "fs";
import path from "path";

const API_DIR = "src/app/api";
const BASE_URL = "https://schooldb.co.in";

type PostmanRequest = {
  name: string;
  request: {
    method: string;
    header: any[];
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
  };
};

function findRoutes(dir: string, routes: string[] = []) {
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
  return file
    .replace(/\\/g, "/")
    .replace("src/app", "")
    .replace("route.ts", "")
    .replace(/\[schoolId\]/g, "test")
    .replace(/\[id\]/g, "1")
    .replace(/\[jobId\]/g, "1")
    .replace(/^\/+/, "/");
}

function buildPostmanRequest(endpoint: string, method: string): PostmanRequest {
  const url = BASE_URL + endpoint;

  return {
    name: `${method} ${endpoint}`,
    request: {
      method,
      header: [
        {
          key: "Content-Type",
          value: "application/json",
        },
        {
          key: "Cookie",
          value: "__session={{CLERK_SESSION}}",
        },
      ],
      url: {
        raw: url,
        host: ["schooldb", "co", "in"],
        path: endpoint.split("/").filter(Boolean),
      },
    },
  };
}

function generateCollection() {
  const routes = findRoutes(API_DIR);

  const items: any[] = [];

  for (const file of routes) {
    const endpoint = convertToEndpoint(file);
    const methods = detectMethods(file);

    for (const method of methods) {
      items.push(buildPostmanRequest(endpoint, method));
    }
  }

  const collection = {
    info: {
      name: "SchoolDB API",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    variable: [
      {
        key: "CLERK_SESSION",
        value: "",
      },
    ],
    item: items,
  };

  fs.writeFileSync(
    "postman_collection.json",
    JSON.stringify(collection, null, 2)
  );

  console.log(`✅ Postman collection generated`);
  console.log(`📄 File: postman_collection.json`);
  console.log(`🔗 APIs: ${items.length}`);
}

generateCollection();