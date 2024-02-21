import React, { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConnect, useChainId, useSwitchChain } from "wagmi";
import { useDisconnect } from "wagmi";
import { useAccount, useConnections } from "wagmi";
import { type EIP1193Provider } from "viem";
import { EvmosLogo } from "./EvmosLogo.js";
import { config } from "./config.js";

import { createHost } from "@evmos/dappstore-sdk/internal/host";

import cx from "clsx";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-surface">
      <div className="flex items-center space-x-4">
        <EvmosLogo />
      </div>
      <div className="flex gap-x-2">
        <Networks />

        <WalletOptions />
      </div>
    </header>
  );
};
function WalletOptions() {
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const shortenedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";
  if (isConnected) {
    return (
      <button
        className="ml-4 text-[#FF8C5C] h-11 rounded-full text-sm px-4  font-medium"
        onClick={() => disconnect()}
      >
        {shortenedAddress}
      </button>
    );
  }

  return connectors.map((connector) => (
    <button
      disabled={isPending}
      className={
        "bg-primary ml-4 h-11 rounded-full text-sm px-4 text-[#FFDBCE] font-medium disabled:opacity-50"
      }
      key={connector.uid}
      onClick={() => connect({ connector })}
    >
      Connect with {connector.name}
    </button>
  ));
}

function Networks() {
  // const { address, isConnecting } = useAccount();
  // const {} = useConfig();
  const chainId = useChainId();
  const { chains, switchChain, isPending } = useSwitchChain();

  return (
    <div className="flex gap-x-2">
      {chains.map((chain) => (
        <button
          className={cx(
            "text-[#FF8C5C]  h-11 rounded-full text-sm px-4  font-medium",
            {
              "bg-[#692736]": chainId === chain.id,
            }
          )}
          disabled={isPending || chainId === chain.id}
          key={chain.id}
          onClick={() => switchChain({ chainId: chain.id })}
        >
          {chain.name}
        </button>
      ))}
      <a
        className="text-[#D8C2BB]  h-11 rounded-full text-sm px-4  font-medium flex  items-center gap-2"
        href="https://faucet.evmos.dev/"
        target="_blank"
        rel="noreferrer"
      >
        Testnet Faucet
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
        >
          <path
            fill="#B4A9A5"
            fillRule="evenodd"
            d="M9.5 2.25h-.121c-1.279 0-2.058 0-2.721.159a5.75 5.75 0 0 0-4.25 4.249C2.25 7.32 2.25 8.1 2.25 9.378V13.035c0 1.371 0 2.447.07 3.311.073.88.221 1.607.557 2.265a5.75 5.75 0 0 0 2.513 2.513c.658.336 1.385.485 2.265.556.864.071 1.94.071 3.311.071h3.655c1.279 0 2.059 0 2.721-.159a5.75 5.75 0 0 0 4.25-4.249c.158-.662.158-1.442.158-2.72V14a.75.75 0 0 0-1.5 0v.5c0 1.438-.005 2.025-.117 2.492a4.25 4.25 0 0 1-3.14 3.14c-.468.113-1.055.118-2.493.118H11c-1.412 0-2.427 0-3.223-.066-.787-.064-1.295-.188-1.706-.397a4.25 4.25 0 0 1-1.858-1.857c-.21-.412-.333-.92-.397-1.707-.065-.796-.066-1.81-.066-3.223V9.5c0-1.438.005-2.025.117-2.492a4.25 4.25 0 0 1 3.14-3.14c.468-.113 1.055-.118 2.493-.118h.5a.75.75 0 0 0 0-1.5h-.5Zm4.75.75c0 .414.336.75.75.75h4.19l-7.72 7.72a.75.75 0 1 0 1.06 1.06l7.72-7.72V9a.75.75 0 0 0 1.5 0V3a.75.75 0 0 0-.75-.75h-6a.75.75 0 0 0-.75.75Z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </div>
  );
}

const WidgetArea = () => {
  const connections = useConnections();
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [url] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    if (!("__ENV__" in window)) {
      return "";
    }
    return (window.__ENV__ as Record<string, string>).TARGET || "";
  });
  useEffect(() => {
    const connection = connections[0];
    if (!connection) {
      setProvider(null);
      return;
    }
    if (!("getProvider" in connection.connector)) {
      setProvider(null);
      return;
    }
    connection.connector.getProvider().then((p) => {
      setProvider(p as EIP1193Provider);
    });
  }, [connections]);

  useEffect(() => {
    if (!provider || !ref.current) {
      return;
    }
    return createHost({
      provider,
      target: ref.current.contentWindow as Window,
    });
  }, [ref, provider]);

  if (!provider) {
    return <div>Connect to a wallet</div>;
  }

  return <iframe ref={ref} src={url} className="h-[560px]" />;
};

export const App = () => {
  const [queryClient] = React.useState(new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Header />

        <div className="grow flex justify-center items-start pt-32 ">
          <div className="max-w-[420px] w-full mx-auto min-h-[240px] bg-[#1C1816] p-4 rounded-lg widget-area flex flex-col">
            <WidgetArea />
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
