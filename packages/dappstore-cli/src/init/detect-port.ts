import { readPackageJson } from "./read-package-json.js";

export const detectRunningPort = async (dir: string = ".") => {
  const pkg = await readPackageJson(dir);

  const startScript = pkg.scripts?.start ?? "";
  const devScript = pkg.scripts?.dev ?? "";
  let explicitPort: null | number = parseInt(
    startScript.match(/(--port|-p) (\d+)/)?.[1] ?? ""
  );

  if (isNaN(explicitPort)) {
    explicitPort = null;
  }

  if (startScript.includes("next") || devScript.includes("next")) {
    return {
      framework: "next" as const,
      port: explicitPort ?? 3000,
    };
  }
  if (startScript.includes("vite") || devScript.includes("vite")) {
    return {
      framework: "vite" as const,
      port: explicitPort ?? 5173,
    };
  }

  if (
    startScript.includes("react-scripts") ||
    devScript.includes("react-scripts")
  ) {
    return {
      framework: "react-scripts" as const,
      port: explicitPort ?? 3000,
    };
  }

  return {
    framework: "unknown" as const,
    port: explicitPort ?? null,
  };
};
