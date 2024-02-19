import Bun, { BuildConfig } from "bun";
import path from "path";
import * as esbuild from "esbuild";

export const build = async ({
  watch,
  ...config
}: esbuild.BuildOptions & { watch?: boolean }) => {
  const pkg = (await Bun.file(
    path.join(process.cwd(), "package.json")
  ).json()) as {
    version?: string;
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const context = await esbuild.context({
    ...config,

    external: [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      ...(config.external ?? []),
    ],
    logLevel: "info",

    define: {
      ["process.env.npm_package_version"]: JSON.stringify(pkg.version),
      ...(config.define ?? {}),
    },
  });
  if (watch) {
    await context.watch({});

    console.log("Watching for changes");
  } else {
    const result = await context.rebuild();

    await context.dispose();
  }
};
