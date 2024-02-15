import { createTRPCClient } from "@trpc/client";
import type { CreateTRPCClient } from "@trpc/client";

import type { HostRouter } from "./host.js";

import { postMessageLink } from "../post-message-integration/post-message-link.js";
export const trpcClient: CreateTRPCClient<HostRouter> =
  createTRPCClient<HostRouter>({
    links: [postMessageLink({})],
  });
