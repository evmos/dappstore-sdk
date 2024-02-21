// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { http, createConfig } from "wagmi";
import { evmos } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { Chain, Hex } from "viem";

// const url = "http://localhost:3000";
const evmosmainnet: Chain = {
  ...evmos,
  name: "Evmos",
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11" as Hex,
    },
  },
  rpcUrls: {
    default: { http: ["https://evmos.lava.build"] },
    public: { http: ["https://evmos.lava.build"] },
  },
};
const evmostestnet: Chain = {
  ...evmos,
  name: "Evmos Testnet",
  id: 9000,

  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11" as Hex,
    },
  },
  rpcUrls: {
    default: {
      http: [`https://evmos-testnet.lava.build`],
    },
    public: {
      http: [`https://evmos-testnet.lava.build`],
    },
  },
};
export const config = createConfig({
  chains: [evmosmainnet, evmostestnet],
  transports: {
    [evmosmainnet.id]: http(),
    [evmostestnet.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
});
