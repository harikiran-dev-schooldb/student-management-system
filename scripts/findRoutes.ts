import fs from "fs";
import path from "path";

const apiDir = "src/app/api";
const baseUrl = "{{base_url}}";

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

function convertToApiPath(filePath: string) {
  return filePath
    .replace(/src[\\/]+app[\\/]+api/, "")
    .replace(/route\.ts$/, "")
    .replace(/\\/g, "/")
    .replace(/\[(.*?)\]/g, "{{$1}}");
}

function detectMethods(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  const methods: string[] = [];

  if (content.includes("export async function GET")) methods.push("GET");
  if (content.includes("export async function POST")) methods.push("POST");
  if (content.includes("export async function PUT")) methods.push("PUT");
  if (content.includes("export async function PATCH")) methods.push("PATCH");
  if (content.includes("export async function DELETE")) methods.push("DELETE");

  return methods.length ? methods : ["GET"];
}

function generateName(apiPath: string, method: string) {
  const parts = apiPath.split("/").filter(Boolean);

  const resource = parts[parts.length - 1]
    .replace("{{schoolId}}", "")
    .replace("{{id}}", "")
    .replace(/-/g, " ");

  const formatted =
    resource.charAt(0).toUpperCase() + resource.slice(1);

  const methodMap: Record<string, string> = {
    GET: "Get",
    POST: "Create",
    PUT: "Update",
    PATCH: "Update",
    DELETE: "Delete",
  };

  return `${methodMap[method]} ${formatted}`;
}

function getFolderName(apiPath: string) {
  const parts = apiPath.split("/").filter(Boolean);

  if (parts.includes("public")) return "Public";
  if (parts.includes("students")) return "Students";
  if (parts.includes("teachers")) return "Teachers";
  if (parts.includes("classes")) return "Classes";
  if (parts.includes("attendance")) return "Attendance";
  if (parts.includes("fees")) return "Fees";
  if (parts.includes("subjects")) return "Subjects";
  if (parts.includes("exams")) return "Exams";
  if (parts.includes("results")) return "Results";
  if (parts.includes("messages")) return "Messages";
  if (parts.includes("users")) return "Users";

  return "Other";
}

const routes = findRoutes(apiDir);

const folders: Record<string, any[]> = {};

routes.forEach((routeFile) => {
  const apiPath = convertToApiPath(routeFile);
  const methods = detectMethods(routeFile);
  const folder = getFolderName(apiPath);

  if (!folders[folder]) folders[folder] = [];

  methods.forEach((method) => {
    const request: any = {
      name: generateName(apiPath, method),
      request: {
        method,
        header: [
          {
            key: "Authorization",
            value: "Bearer {{token}}",
            type: "text",
          },
        ],
        url: {
          raw: `${baseUrl}/api${apiPath}`,
          host: ["{{base_url}}"],
          path: ["api", ...apiPath.split("/").filter(Boolean)],
        },
      },
    };

    if (method === "POST" || method === "PUT" || method === "PATCH") {
      request.request.body = {
        mode: "raw",
        raw: JSON.stringify(
          {
            example: "value",
          },
          null,
          2
        ),
      };
    }

    folders[folder].push(request);
  });
});

const collection = {
  info: {
    name: "SchoolDB API",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: Object.keys(folders).map((folder) => ({
    name: folder,
    item: folders[folder],
  })),
};

fs.writeFileSync(
  "postman-collection.json",
  JSON.stringify(collection, null, 2)
);

console.log("✅ Professional API collection generated!");