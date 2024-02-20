# DAppStore SDK client

## Standalone usage:

```ts
import { createDAppStoreClient } from "@evmos/dappstore-sdk";

// Waits for the client to establish a connection to the DAppStore
await dappstore.initialized;

console.log(
  `DAppStore client initialized.`,
  `Chain ID: ${dappstore.chainId}, Accounts: ${dappstore.accounts}`
); // -> DAppStore client initialized. Chain ID: evmos:1, Accounts: ["0x..."]
```

## Subscribe to account and chain id changes:

```ts
// Shorthand for dappstore.provider.on("accountsChanged", (accounts) => { ... })
dappstore.onAccountsChange((accounts) => {
  console.log(`Accounts changed: ${accounts}`); // -> Accounts changed: ["0x..."]
});
*
// Shorthand for dappstore.provider.on("chainChanged", (chainId) => { ... })
dappstore.onChainChange((chainId) => {
  console.log(`Chain changed: ${chainId}`); // -> Chain changed: evmos:1
});

// Or interact directly with the provider
dappstore.provider.request({ method: "eth_requestAccounts" }).then((accounts) => {
 console.log(`Accounts: ${accounts}`); // -> Accounts: ["0x..."]
});
```

## Usage with React:

```tsx
const dappstore = createDAppStoreClient();
import { useEffect, useState } from "react";

const useAccounts = () => {
  const [accounts, setAccounts] = useState<`0x${string}`[]>(dappstore.accounts);
  useEffect(() => {
    return dappstore.onAccountsChange(setAccounts); // <- returns cleanup function
  }, []);
  return accounts;
};

const useChainId = () => {
  const [chainId, setChainId] = useState(dappstore.chainId);
  useEffect(() => {
    return dappstore.onChainChange(setChainId);
  }, []);
  return chainId;
};

const App = () => {
  const accounts = useAccounts();
  return <div>Accounts: {accounts.join(", ")}</div>;
};
```

## Send a transaction:

```ts
const sendTransaction = async (to: `0x${string}`) => {
  const [from] = dappstore.accounts;
  if (!from) {
    throw new Error("No account connected");
  }

  return await dappstore.provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to,
        value: "0x1", // We recommend using a library like ethers.js or viem to handle amounts
      },
    ],
  });
};
```
