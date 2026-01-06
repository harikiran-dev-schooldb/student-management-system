import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.schooldb.app",
  appName: "SchoolSync",
  webDir: "out",
  server: {
    allowNavigation: ["schooldb.co.in"],
  },
};

export default config;
