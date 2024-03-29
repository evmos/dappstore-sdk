// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

const noop = () => {};
export const Log = (ns: string, enabled = false) => {
  const { log, error, warn, info } = enabled
    ? console
    : { log: noop, error: noop, warn: noop, info: noop };
  ns = `[${ns}]`;
  return {
    log: (...args: unknown[]) => log(ns, ...args),
    error: (...args: unknown[]) => error(ns, ...args),
    info: (...args: unknown[]) => info(ns, ...args),
    warn: (...args: unknown[]) => warn(ns, ...args),
  };
};
