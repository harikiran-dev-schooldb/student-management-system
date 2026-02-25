// lib/access-control.ts

import { routeAccessMap } from "./settings";


export function isRouteAllowed(path: string, role: string): boolean {
  for (const pattern in routeAccessMap) {
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(path)) {
      return routeAccessMap[pattern].includes(role);
    }
  }
  return false; // default deny
}