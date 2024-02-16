import { program } from "@commander-js/extra-typings";
import { serve } from "@evmos/dev-wrapper/serve/serve.js";

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
    const app = serve({
      target,
    });
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`);
    });
  });
