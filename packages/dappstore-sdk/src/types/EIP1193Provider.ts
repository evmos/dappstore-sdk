// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}
export interface ProviderConnectInfo {
  readonly chainId: string;
}
export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}
export interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}
export type ProviderChainChangedListener = (chainId: string) => void;
export type ProviderAccountsChangedListener = (accounts: string[]) => void;
export type ProviderConnectListener = (
  connectInfo: ProviderConnectInfo
) => void;
export type ProviderDisconnectListener = (error: ProviderRpcError) => void;
export type ProviderMessageListener = (message: ProviderMessage) => void;
export interface EIP1193Provider {
  on(
    event: "accountsChanged",
    listener: ProviderAccountsChangedListener
  ): EIP1193Provider;
  on(
    event: "chainChanged",
    listener: ProviderChainChangedListener
  ): EIP1193Provider;
  on(event: "connect", listener: ProviderConnectListener): EIP1193Provider;
  on(
    event: "disconnect",
    listener: ProviderDisconnectListener
  ): EIP1193Provider;
  on(event: "message", listener: ProviderMessageListener): EIP1193Provider;

  removeListener(
    event: string,
    callback: (data: unknown) => void
  ): EIP1193Provider;
  request(args: RequestArguments): Promise<unknown>;
}
