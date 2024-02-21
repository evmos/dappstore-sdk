// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { writeFile } from "fs/promises";
import { readTemplate } from "./get-template";
export const writeTemplate = async (destination: string) => {
  const templatePath = await readTemplate();

  await writeFile(destination, templatePath, "utf-8");
};
