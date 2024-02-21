import { createHost } from "./host";
import { Log } from "./logger";
import { trpcClient } from "./trpc/client";

import {
  EIP1193Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  ProviderMessage,
} from "./types/EIP1193Provider";
import { Hex, EIP1193Provider as StronglyTypedEIP1193Provider } from "viem";
const loggerNamespace = "DAppStoreSDK CLIENT";
const loggerProviderNamespace = "DAppStoreSDK CLIENT PROVIDER";
class SDKProvider implements StronglyTypedEIP1193Provider {
  logger = Log(loggerProviderNamespace);
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
      this.logger.info("Subscribing to event", event);
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
    this.logger.info("Removing listener", event);

    return this;
  }
  request: StronglyTypedEIP1193Provider["request"] = (args) => {
    if (typeof window === "undefined") {
      throw new Error("Cannot call request outside of browser");
    }
    this.logger.info("Sending message", args);
    const response = trpcClient.provider.request.mutate(args as never) as never;
    this.logger.info("Received response", response);

    return response;
  };
}

type ClientOptions = {
  autoInit?: boolean;
  debug?: boolean;
};
class Client {
  // @internal
  _host: null | ReturnType<typeof createHost> = null;
  // @internal
  _listeners: Record<string, Set<Function>> = {};
  // @internal
  _provider: SDKProvider = new SDKProvider();
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
  logger = Log(loggerNamespace, this.debug);

  // @internal
  _debug: boolean = false;
  set debug(value: boolean) {
    this._debug = value;
    this.logger = Log(loggerNamespace, value);
    this.provider.logger = Log(loggerProviderNamespace, value);
  }
  get debug() {
    return this._debug;
  }
  constructor({ autoInit = true, debug = false }: ClientOptions = {}) {
    this.debug = debug;

    if (autoInit) this.initialized = this.init();
  }

  async init() {
    this.logger.info("Initializing DAppStore SDK");
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
          this.emitAccountsChange(data);
        },
      }
    );

    const unsubChain = trpcClient.provider.on.chainChanged.subscribe(
      undefined,
      {
        onData: (data) => {
          this._chainId = data;
          this.emitChainChange(data);
        },
      }
    );
    return () => {
      unsubAccounts.unsubscribe();
      unsubChain.unsubscribe();
    };
  }
  onAccountsChange(cb: (accounts: `0x${string}`[]) => void) {
    if (!this._listeners.accountsChanged) {
      this.logger.info("Subscribing to accounts change");
      this._listeners.accountsChanged = new Set();
    }
    this._listeners.accountsChanged.add(cb);
    return () => {
      this._listeners.accountsChanged?.delete(cb);
    };
  }
  private emitAccountsChange(accounts: string[]) {
    if (this._listeners.accountsChanged) {
      this.logger.info("accountsChanged event emitted", accounts);
      this._listeners.accountsChanged.forEach((listener) => {
        listener(accounts);
      });
    }
  }

  onChainChange(cb: (chainId: `0x${string}`) => void) {
    if (!this._listeners.chainChanged) {
      this.logger.info("Subscribing to chain change");
      this._listeners.chainChanged = new Set();
    }
    this._listeners.chainChanged.add(cb);
    return () => {
      this._listeners.chainChanged?.delete(cb);
    };
  }

  private emitChainChange(chainId: `0x${string}`) {
    if (this._listeners.chainChanged) {
      this.logger.info("chainChanged event emitted", chainId);
      this._listeners.chainChanged.forEach((listener) => {
        listener(chainId);
      });
    }
  }
  async ack() {
    const args = {
      version: process.env.npm_package_version as string,
      debug: this.debug,
    };
    this.logger.info("Sending ack", args);

    const ackResponse = await trpcClient.ack.query(args);
    this.logger.info("Received ack", ackResponse);
    this._state = "ready";
    this._accounts = ackResponse.state.accounts;
    this._chainId = ackResponse.state.chainId;
    this.emitAccountsChange(this._accounts);
    this.emitChainChange(this._chainId);
  }
}

export const createDAppStoreClient = (config: ClientOptions = {}) => {
  const client = new Client(config);

  return client;
};

export type DAppStoreClient = Client;
