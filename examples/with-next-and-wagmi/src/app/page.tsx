"use client";

import { client, DAppStoreClient, provider } from "@/wagmi";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";
const createAccountStore = () => {
  let accounts: string[] = [];
  const listeners = new Set<(accounts: string[]) => void>();
  provider.request({ method: "eth_requestAccounts" }).then((_accounts) => {
    accounts = _accounts;
    console.log("eth_accounts", _accounts);
    listeners.forEach((listener) => listener(_accounts));
  });

  provider.on("accountsChanged", (_accounts) => {
    console.log("accountsChanged", _accounts);
    accounts = _accounts;
    listeners.forEach((listener) => listener(_accounts));
  });
  return {
    getAccounts: () => accounts,
    subscribe: (callback: (accounts: string[]) => void) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
  };
};
const accountStore = createAccountStore();
// const useAccount = () => {
//   const [accounts, setAccounts] = useState<string[]>([]);
//   useEffect(() => {
//     provider.request({ method: "eth_accounts" }).then((accounts) => {
//       setAccounts(accounts);
//     });
//     const listener = (accounts: string[]) => {
//       setAccounts(accounts);
//     };
//     provider.on("accountsChanged", listener);

//     return () => {
//       provider.removeListener("accountsChanged", listener);
//     };
//   }, []);
//   return accounts;
// };

const useChainId = () => {
  const [chainId, setChainId] = useState<string | null>(null);
  useEffect(() => {
    provider.request({ method: "eth_chainId" }).then((chainId) => {
      setChainId(chainId);
    });

    const listener = (chainId: string) => {
      setChainId(chainId);
    };
    provider.on("chainChanged", listener);

    return () => {
      provider.removeListener("chainChanged", listener);
    };
  }, []);
  return chainId;
};

function App() {
  const accounts = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.getAccounts,
    accountStore.getAccounts
  );
  const chainId = useChainId();

  return (
    <>
      <div>
        <h2>Account</h2>
        <div>
          Address:{" "}
          {accounts
            ?.map((address) => `${address.slice(0, 4)}...${address.slice(-8)}`)
            .join(", ")}
          <br />
          Chain ID: {chainId}
        </div>
      </div>
    </>
  );
}

export default App;
