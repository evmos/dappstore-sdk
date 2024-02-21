// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { program } from "@commander-js/extra-typings";
import { serve } from "@evmos/dev-wrapper/serve/serve.js";
import chalk from "chalk";

program
  .command("dev")
  .description("Start a development server")
  .option("-p, --port <port>", "Development server port", "1337")
  .option(
    "-t, --target <port>",
    "The port or url of your widget server",
    "3000"
  )

  .action(async ({ port, target }) => {
    const targetUrl = target.startsWith("http")
      ? target
      : `http://localhost:${target}`;
    const app = serve({
      target: targetUrl,
    });
    app.listen(port, () => {
      console.log(
        "\n\n",
        `${chalk.hex("#FF8C5C")(`☄️ Evmos DAppStore Widget`)} environment running on http://localhost:${port}`,
        "\n\n",
        chalk.dim(
          `Note: Expects your widget server to be running on ${targetUrl}`
        )
      );
    });
  });
