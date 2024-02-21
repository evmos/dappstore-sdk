// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { memoize } from "lodash-es";
const readJson = async <T>(path: string): Promise<T> => {
  const content = await readFile(path, "utf-8");
  return JSON.parse(content);
};

export const readPackageJson = memoize(async (dir: string = ".") => {
  const pkgPath = join(process.cwd(), dir, "package.json");

  return await readJson<{
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  }>(pkgPath);
});

export const writePackageJson = async (
  dir: string = ".",
  pkg: {
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  }
) => {
  readPackageJson.cache.clear?.();
  const pkgPath = join(process.cwd(), dir, "package.json");

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
};
