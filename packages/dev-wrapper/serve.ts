// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { fileURLToPath } from "url";
import express from "express";
import path from "path";
import { readFileSync } from "fs";
const __dirname = fileURLToPath(new URL("./", import.meta.url));

export const serve = ({ target }: { target: string }) => {
  const app = express();
  const envScript = `<script>__ENV__ = ${JSON.stringify({ TARGET: target })}</script>`;
  const index = readFileSync(
    path.join(__dirname, "../app/index.html"),
    "utf-8"
  ).replace("{{ENV_SCRIPT}}", envScript);

  app.get("/", (req, res) => {
    if (req.originalUrl === "/") {
      res.end(index);
    }
  });
  app.use(express.static(path.join(__dirname, "../app")));

  return app;
};
