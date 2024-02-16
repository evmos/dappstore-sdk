import { createDAppStoreClient } from "@evmos/dappstore-sdk";

export const dappstore = createDAppStoreClient();

/**
 * EIP-1193 provider
 */
export const provider = dappstore.provider;
