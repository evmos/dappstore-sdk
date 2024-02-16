import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const readTemplate = async () => {
  try {
    console.log(process.cwd());
    return await readFile(
      path.join(__dirname, `./templates/dappstore-client.ts`),
      "utf-8"
    );
  } catch (e) {
    console.error("Template not found");
    process.exit(1);
  }
};
