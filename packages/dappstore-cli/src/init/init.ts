// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { program } from "@commander-js/extra-typings";
import inquirer from "inquirer";
import { PackageManager, getPkgManager } from "./get-package-manager.js";
import { installDependencies } from "./install-dependencies.js";
import { readPackageJson, writePackageJson } from "./read-package-json.js";
import chalk from "chalk";
import { detectRunningPort } from "./detect-port.js";
import { stat } from "fs/promises";
import { writeTemplate } from "./write-template.js";

program
  .command("init")
  .description("Initialize DAppStore widget in your project")

  .option("--skip-install", "Skip installing dependencies")

  .action(async ({ skipInstall }) => {
    const detectedPackageManager = getPkgManager();
    let pkgJson: Awaited<ReturnType<typeof readPackageJson>>;
    try {
      pkgJson = await readPackageJson();
    } catch (e) {
      console.log(
        "\n",
        chalk.bgRed("package.json not found"),
        "\n\n",
        "Make sure you run this command in the root of your project,",
        "\n",
        `or you initialize a new project with ${chalk.yellow(
          `'${detectedPackageManager} init'`
        )} first.`,
        "\n"
      );
      process.exit(1);
    }

    const defaultPort = await detectRunningPort();
    const { packageManager, port } = await inquirer.prompt<{
      packageManager: PackageManager;
      port: number;
    }>([
      {
        type: "list",
        name: "packageManager",
        message: `Which package manager do you want to use?`,

        choices: ["npm", "pnpm", "bun", "yarn"].map((pm) => ({
          name: pm === detectedPackageManager ? `${pm} (detected)` : pm,
          value: pm,
        })),
        default: detectedPackageManager,
      },
      {
        type: "number",
        name: "port",

        message: `What port or url of your development server will run on?`,
        default: defaultPort.port ?? 3000,
      },
    ]);
    if (!skipInstall) {
      await installDependencies(packageManager, [
        "@evmos/dappstore-sdk",
        "dappstore",
      ]);
    }
    const packageJson = await readPackageJson();
    packageJson.scripts = {
      ...packageJson.scripts,
      "dev:dappstore": `dappstore dev --target ${port}`,
    };
    await writePackageJson(".", packageJson);
    let templateDest = "./dappstore-client.ts";
    try {
      const srcDir = await stat("src");
      if (srcDir.isDirectory()) {
        templateDest = "./src/dappstore-client.ts";
      }
    } catch (e) {
      // noop
    }

    await writeTemplate(templateDest);

    console.log(
      "\n",
      chalk.green(`🚀 DAppStore Widget Setup is completed`),
      "\n",
      `To start the development, start your development server, and then run:`,
      "\n\n",

      chalk.yellow(`\t${packageManager} run dev:dappstore`)
    );
  });
