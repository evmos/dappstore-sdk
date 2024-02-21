// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { build } from "@evmos/utils/src/build";

build({
  entryPoints: ["./src/index.ts"],

  platform: "node",
  format: "esm",
  bundle: true,
  outdir: "./dist",
  watch: process.argv.includes("--watch"),
});
