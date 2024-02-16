const TEMPLATE = `
import { createDAppStoreClient } from "@evmos/dappstore-sdk";

export const dappstore = createDAppStoreClient();

/**
 * EIP-1193 provider
 */
export const provider = dappstore.provider;
`;
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const readTemplate = () => {
  // try {
  //   return await readFile(
  //     path.join(__dirname, `./templates/dappstore-client.ts`),
  //     "utf-8"
  //   );
  // } catch (e) {
  //   console.error("Template not found");
  //   process.exit(1);
  // }

  // TODO: I was actually reading this file with a Bun macro but it's not working on github CI
  // let's try again in the future
  return TEMPLATE;
};
