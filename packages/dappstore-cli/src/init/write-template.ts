import { writeFile } from "fs/promises";
import { readTemplate } from "./get-template";
export const writeTemplate = async (destination: string) => {
  const templatePath = await readTemplate();

  await writeFile(destination, templatePath, "utf-8");
};
