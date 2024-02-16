// @ts-nocheck
import Bun from "bun";
import { dependencies, peerDependencies } from "./package.json";
import { watch } from "node:fs";
export const build = async () => {
  const result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    target: "node",
    format: "esm",
    external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
    outdir: "./dist",
  });

  if (result.success === false) {
    result.logs.forEach((log) => console.error(log));
    return;
  }
  console.log("Build successful");
};
await build();

if (process.argv.includes("--watch")) {
  const srcWatcher = watch(
    `${import.meta.dir}/src`,
    { recursive: true },
    async (event, filename) => {
      console.log(`Detected ${event} in ${filename} (src)`);
      await build();
    }
  );
  process.on("SIGINT", () => {
    srcWatcher.close();
    process.exit(0);
  });
}
