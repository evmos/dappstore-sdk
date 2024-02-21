# DAppStore SDK Client

The DAppStore SDK Client is a toolkit to help you develop Instant DApps Widgets directly for Evmos DAppstore.

## What are Instant DApps?

Instant DApps are DApps featured in Evmos DAppstore that can be interacted with directly from the DAppstore. Essentially, they are widgets embeded in an iframe that gives users the ability to seamlessly interact with a DApp created by other developers.

## Why use the DAppStore SDK Client?

The DAppStore SDK Client main function is to provide a simple way to interact with the Evmos DAppstore from inside your DApp. Iframes allows us to securely embed third party content into our page, but it also comes with some limitations. Iframes are sandboxed and do not have access to the parent window, which means it will not have access to the user's wallet connections, forcing the them to connect their wallet again, and the developer to implement a wallet connection flow.

That not only adds complexity, but also creates an inconsistent user experience. The DAppStore SDK Client solves this problem by providing a way to interact with the Evmos DAppstore directly from the iframe, by implementing an EIP-1193 compliant provider that communicates with the DAppStore wallet connection.

Because it's an EIP-1193 provider, it can be used with any library that supports it, like ethers.js, web3.js, viem, etc.

## Getting started

The quickest way to get started is to use the `dappstore` CLI to create a new project:

1. First, create a new project with the framework of your choice, Ex. `create-react-app`:

```sh
npx create-react-app my-instant-dapp
cd ./my-instant-dapp
```

2. Then, use the `dappstore` CLI to setup the DAppStore SDK Client:

```sh
# npm
npx dappstore init
# yarn
yarn dappstore init
# pnpm
pnpm dlx dappstore init
# bun
bunx dappstore init
```

3. This will install the necessary dependencies, create a `src/dappstore.ts` file that initializes the DAppStore SDK Client and provider, and add a script to your `package.json` to start the development server with the DAppStore SDK Client. After that you can start your project, and the DAppStore dev environment.

```sh
# Starts next
npm run dev
# Starts DAppStore dev environment
npm run dev:dappstore
```

4. Navigate to http://localhost:1337 to see your DApp running in the DAppStore dev environment.

## Manual setup

If you prefer to set up the DAppStore SDK Client manually, you can do so by following these steps:

1. Install the DAppStore SDK Client and the DAppStore CLI:

```sh
npm install @evmos/dappstore-sdk dappstore
```

2. Start the DAppStore dev environment:

```sh
npx dappstore dev --target 3000 # <- or the port your app is running on
```

3. Initialize the DAppStore SDK Client in your app:

```ts
import { createDAppStoreClient } from "@evmos/dappstore-sdk";

export const dappstore = createDAppStoreClient();

/**
 * EIP-1193 provider
 */
export const provider = dappstore.provider;
```

### Standalone usage:

```ts
import { createDAppStoreClient } from "@evmos/dappstore-sdk";

export const dappstore = createDAppStoreClient();

dappstore.provider
  .request({ method: "eth_requestAccounts" })
  .then((accounts) => {
    console.log(`Accounts: ${accounts}`); // -> Accounts: ["0x..."]
  });
```

### Send a transaction:

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

### With ethers.js:

```ts
import { ethers } from "ethers";
import { createDAppStoreClient } from "@evmos/dappstore-sdk";

export const dappstore = createDAppStoreClient();

const provider = new ethers.BrowserProvider(dappstore.ethereum);

const signer = await provider.getSigner();

const sendTransaction = async (to: `0x${string}`) => {
  return await signer.sendTransaction({
    to,
    value: ethers.utils.parseEther("0.1"),
  });
};
```

## Disclaimer

The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

## Licensing

Evmos Non-Commercial License 1.0 (ENCL-1.0). For more information see [LICENSE](../../LICENSE).

### SPDX Identifier

The following header including a license identifier in SPDX short form has been added in all ENCL-1.0 files:

```js
// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)
```

### License FAQ

Find below an overview of Permissions and Limitations of the Evmos Non-Commercial License 1.0. For more information, check out the full ENCL-1.0 FAQ [here](/LICENSE_FAQ.md).

| Permissions                                                                                                                                                                  | Prohibited                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| - Private Use, including distribution and modification<br />- Commercial use on designated blockchains<br />- Commercial use with Evmos permit (to be separately negotiated) | Commercial use, other than on designated blockchains, without Evmos permit |
