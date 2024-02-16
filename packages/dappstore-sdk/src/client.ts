import { createHost } from "./host";
import { trpcClient } from "./trpc/client";

import {
  EIP1193Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  ProviderMessage,
} from "./types/EIP1193Provider";
import { Hex, EIP1193Provider as StronglyTypedEIP1193Provider } from "viem";
class SDKProvider implements StronglyTypedEIP1193Provider {
  unsubscribers: Record<string, Map<Function, Function>> = {};
  on(
    event: "accountsChanged",
    listener: (accounts: string[]) => void
  ): SDKProvider;
  on(event: "chainChanged", listener: (chainId: string) => void): SDKProvider;
  on(
    event: "connect",
    listener: (connectInfo: ProviderConnectInfo) => void
  ): SDKProvider;
  on(
    event: "disconnect",
    listener: (error: ProviderRpcError) => void
  ): SDKProvider;
  on(
    event: "message",
    listener: (message: ProviderMessage) => void
  ): SDKProvider;
  on(event: string, listener: (...args: any[]) => void): SDKProvider {
    if (
      event === "accountsChanged" ||
      event === "chainChanged" ||
      event === "connect"
      // event === "disconnect" ||
      // event === "message"
    ) {
      const { unsubscribe } = trpcClient.provider.on[event].subscribe(
        undefined,
        {
          onData(data) {
            listener(data);
          },
        }
      );
      const unsubMap = this.unsubscribers[event] || new Map();
      unsubMap.set(listener, unsubscribe);
      this.unsubscribers[event] = unsubMap;
    }

    return this;
  }

  removeListener(
    event: string,
    callback: (...args: any[]) => void
  ): EIP1193Provider {
    this.unsubscribers[event]?.get(callback)?.();
    this.unsubscribers[event]?.delete(callback);
    return this;
  }
  request: StronglyTypedEIP1193Provider["request"] = (args) => {
    if (typeof window === "undefined") {
      throw new Error("Cannot call request outside of browser");
    }
    return trpcClient.provider.request.mutate(args as never) as never;
  };
}

class Client {
  // @internal
  _host: null | ReturnType<typeof createHost> = null;
  // @internal
  _listeners: Record<string, Set<Function>> = {};
  // @internal
  _provider = new SDKProvider();
  // @internal
  _ready = false;
  // @internal
  _chainId: Hex | null = null;
  // @internal
  _accounts: Hex[] = [];
  // @internal
  _state: "uninitialized" | "ready" | "error" = "uninitialized";

  initialized: Promise<() => void> = Promise.resolve(() => {});
  get ready() {
    return this._ready;
  }
  get accounts() {
    return this._accounts;
  }
  get chainId() {
    return this._chainId;
  }

  get provider() {
    return this._provider;
  }
  // @internal
  get _isInsideIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  constructor(autoInit = true) {
    if (autoInit) this.initialized = this.init();
  }
  async init() {
    if (this._isInsideIframe === false) {
      throw new Error(
        "Cannot use DAppStore SDK outside of the DAppStore iframe"
      );
    }
    await this.ack();
    const unsubAccounts = trpcClient.provider.on.accountsChanged.subscribe(
      undefined,
      {
        onData: (data) => {
          this._accounts = data;
          if (this._listeners.accountsChanged) {
            this._listeners.accountsChanged.forEach((listener) => {
              listener(data);
            });
          }
        },
      }
    );

    const unsubChain = trpcClient.provider.on.chainChanged.subscribe(
      undefined,
      {
        onData: (data) => {
          this._chainId = data;
          if (this._listeners.chainChanged) {
            this._listeners.chainChanged.forEach((listener) => {
              listener(data);
            });
          }
        },
      }
    );
    return () => {
      unsubAccounts.unsubscribe();
      unsubChain.unsubscribe();
    };
  }
  onAccountsChange(cb: (accounts: string[]) => void) {
    if (!this._listeners.accountsChanged) {
      this._listeners.accountsChanged = new Set();
    }
    this._listeners.accountsChanged.add(cb);
    return () => {
      this._listeners.accountsChanged?.delete(cb);
    };
  }

  onChainChange(cb: (chainId: string) => void) {
    if (!this._listeners.chainChanged) {
      this._listeners.chainChanged = new Set();
    }
    this._listeners.chainChanged.add(cb);
    return () => {
      this._listeners.chainChanged?.delete(cb);
    };
  }
  async ack() {
    const { state } = await trpcClient.ack.query({
      version: process.env.npm_package_version as string,
    });
    this._state = "ready";
    this._accounts = state.accounts;
    this._chainId = state.chainId;
  }
}

export const createDAppStoreClient = ({ autoInit = true } = {}) => {
  const client = new Client(autoInit);

  return client;
};

export type DAppStoreClient = Client;
