const fs = require("fs");

const school = process.argv[2];

if (!school) {
  console.log("❌ Please provide schoolId");
  process.exit(1);
}

const appId = `com.schooldb.${school}`;
const appName = `${school.toUpperCase()} School`;

console.log("🚀 Building for:", school);

// 1️⃣ Update capacitor.config.ts
let capConfig = fs.readFileSync("capacitor.config.ts", "utf-8");

capConfig = capConfig
  .replace(/appId: '.*?'/, `appId: '${appId}'`)
  .replace(/appName: '.*?'/, `appName: '${appName}'`)
  .replace(/url: '.*?'/, `url: 'https://schooldb.co.in/${school}'`);

fs.writeFileSync("capacitor.config.ts", capConfig);

// 2️⃣ Update Android build.gradle
let gradle = fs.readFileSync(
  "android/app/build.gradle",
  "utf-8"
);

gradle = gradle
  .replace(/applicationId ".*?"/, `applicationId "${appId}"`)
  .replace(/namespace ".*?"/, `namespace "${appId}"`);

fs.writeFileSync("android/app/build.gradle", gradle);

// 3️⃣ Update strings.xml
let strings = fs.readFileSync(
  "android/app/src/main/res/values/strings.xml",
  "utf-8"
);

strings = strings
  .replace(/com\.schooldb\.\w+/g, appId);

fs.writeFileSync(
  "android/app/src/main/res/values/strings.xml",
  strings
);

console.log("✅ Config updated for", school);