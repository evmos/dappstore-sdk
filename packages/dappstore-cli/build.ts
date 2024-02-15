// @ts-nocheck
import Bun from "bun";
import { dependencies, peerDependencies } from "./package.json";
import { version } from "./package.json";
import { watch } from "node:fs";
export const build = async () =>
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    target: "node",
    format: "esm",
    external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
    outdir: "./dist",
  });
const test = await build();

if (process.argv.includes("--watch")) {
  const srcWatcher = watch(
    `${import.meta.dir}/src`,
    { recursive: true },
    async (event, filename) => {
      await build();

      console.log(`Detected ${event} in ${filename} (src)`);
    }
  );
  process.on("SIGINT", () => {
    srcWatcher.close();
    process.exit(0);
  });
}
