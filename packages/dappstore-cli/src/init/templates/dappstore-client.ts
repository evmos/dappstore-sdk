// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

export const TEMPLATE = `import { createDAppStoreClient } from "@evmos/dappstore-sdk";

export const dappstore = createDAppStoreClient();

/**
 * EIP-1193 provider
 */
export const provider = dappstore.provider;
`;
