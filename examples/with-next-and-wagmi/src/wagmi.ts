import { createDAppStoreClient } from "@evmos/DAppStore-sdk";
import { createWalletClient, custom } from "viem";
export const DAppStoreClient = createDAppStoreClient();
export const provider = DAppStoreClient.provider;
export const client = createWalletClient({
  transport: custom(provider),
});
