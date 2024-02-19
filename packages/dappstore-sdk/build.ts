import { build } from "@evmos/utils/src/build";

build({
  entryPoints: ["./src/index.ts", "./src/host.ts"],
  platform: "browser",
  format: "esm",
  bundle: true,
  outdir: "./dist",
  watch: process.argv.includes("--watch"),
});
