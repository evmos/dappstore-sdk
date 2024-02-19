import { build } from "@evmos/utils/src/build";

build({
  entryPoints: ["./src/index.ts"],

  platform: "node",
  format: "esm",
  bundle: true,
  outdir: "./dist",
  watch: process.argv.includes("--watch"),
});
