// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import spawn from "cross-spawn";
import { PackageManager } from "./get-package-manager.js";
import { readPackageJson } from "./read-package-json.js";

/**
 * Spawn a package manager installation based on user preference.
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export async function installDependencies(
  /** Indicate which package manager to use. */
  packageManager: PackageManager,
  dependencies: string[] = []
): Promise<void> {
  readPackageJson.cache.clear?.();
  const args: string[] = ["install"];

  args.push(...dependencies);

  /**
   * Return a Promise that resolves once the installation is finished.
   */
  return new Promise((resolve, reject) => {
    /**
     * Spawn the installation process.
     */
    const child = spawn(packageManager, args, {
      stdio: "inherit",
      env: {
        ...process.env,
        ADBLOCK: "1",
        // we set NODE_ENV to development as pnpm skips dev
        // dependencies when production
        NODE_ENV: "development",
        DISABLE_OPENCOLLECTIVE: "1",
      },
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `${packageManager} ${args.join(" ")}` });
        return;
      }
      resolve();
    });
  });
}
