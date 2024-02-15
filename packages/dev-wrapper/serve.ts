import { fileURLToPath } from "url";
import express from "express";
import path from "path";
import { readFileSync } from "fs";
const __dirname = fileURLToPath(new URL("./", import.meta.url));

export const serve = ({ target }: { target: string }) => {
  const targetUrl = target.startsWith("http")
    ? target
    : `http://localhost:${target}`;

  const app = express();
  const envScript = `<script>__ENV__ = ${JSON.stringify({ TARGET: targetUrl })}</script>`;
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
