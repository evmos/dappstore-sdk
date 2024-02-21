// Copyright Tharsis Labs Ltd.(Evmos)
// SPDX-License-Identifier:ENCL-1.0(https://github.com/evmos/dappstore-sdk/blob/main/LICENSE)

import { createPostMessageHost } from "./post-message-integration/create-post-message-host";
import { createHostRouter } from "./trpc/host";

type Config = {
  target: Window;
  provider: unknown;
};
export const createHost = ({ provider, target }: Config) => {
  const trpcHost = createPostMessageHost({
    target,
    router: createHostRouter(provider),
    ctx: {
      debug: false,
    },
  });

  return trpcHost;
};
