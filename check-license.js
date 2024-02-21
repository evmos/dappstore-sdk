// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)
/* eslint-disable no-console */

import { globby } from "globby";
import { readFileSync, writeFileSync } from "fs";
const LICENSE = [
  "// Copyright Tharsis Labs Ltd.(Evmos)",
  "// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)",
].join("\n");

const shouldFix = process.argv.includes("--fix");

console.log("Checking for missing licenses...\n");

const files = await globby(
  [
    "./**/*.{ts,tsx,js}",
    "!**/node_modules/**",
    "!./examples/**",
    // ignore this file so it doesn't move the `#!/usr/bin/env node` line that needs to be at the top
    "!packages/dappstore-cli/src/index.ts",
  ],
  {
    gitignore: true,
  }
);
let passed = true;
for (const file of files) {
  let content = readFileSync(file, "utf8");
  let licensePosition = content.indexOf(LICENSE);

  // if license, skip
  if (licensePosition === 0) continue;

  if (licensePosition > 0) {
    if (!shouldFix) {
      console.log(`License not at top of ${file}`);
      passed = false;
      continue;
    }
    // if license exists, but not at the top, remove it so we add it back in the next step
    content =
      content.substring(0, licensePosition - 1) +
      content.substring(licensePosition + LICENSE.length);
    licensePosition = -1;
  }

  if (licensePosition === -1) {
    if (!shouldFix) {
      console.log(`Missing license in ${file}`);
      passed = false;
      continue;
    }
  }
  // if no license, add it
  console.log(`Adding license to ${file}`);
  writeFileSync(file, `${LICENSE}\n\n${content}`);
}

console.log(`${files.length} files checked.`);

if (passed || shouldFix) {
  console.log("All good!");
} else {
  console.log("Failed! Run `bun license:fix` to fix.");
  process.exit(1);
}
