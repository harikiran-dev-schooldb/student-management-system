import fs from "fs";
import path from "path";

const apiDir = "src/app/api";

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

const routes = findRoutes(apiDir);

console.log(routes);