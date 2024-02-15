import { createDAppstoreClient } from "@evmos/dappstore-sdk";
import { createWalletClient, custom } from "viem";
export const dAppstoreClient = createDAppstoreClient();
export const provider = dAppstoreClient.provider;
export const client = createWalletClient({
  transport: custom(provider),
});
