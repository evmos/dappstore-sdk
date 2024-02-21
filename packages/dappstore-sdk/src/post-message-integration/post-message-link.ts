import { Operation, TRPCClientError, TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { CombinedDataTransformer, inferRouterContext } from "@trpc/server";
/**
 * TRPC doesn't recommend importing unstable-core-do-not-import,
 * but unfortunately, they also don't offer an official API for creating custom links.
 * we need to be mindful on updates, but I imagine typescript checks would report any major change.
 */
import {
  type TRPCClientIncomingRequest,
  type TRPCResponseMessage,
  type AnyRouter,
  type DataTransformerOptions,
  type TRPCClientOutgoingMessage,
  type TRPCRequestMessage,
  transformResult,
} from "@trpc/server/unstable-core-do-not-import";
import { getTransformer } from "@trpc/client/unstable-internals";

import { v4 } from "uuid";
import { debounce } from "lodash-es";
import { z } from "zod";

type PostMessageOptions = {
  transformer?: DataTransformerOptions;
};
class PostMessageClient {
  id = v4();

  outgoing: TRPCClientOutgoingMessage[] = [];
  pendingRequests: Map<
    TRPCRequestMessage["id"],
    (data: TRPCResponseMessage) => void
  > = new Map();

  constructor() {}
  request = (
    op: Operation,
    resolve: (data: TRPCResponseMessage) => void,
    observer: {
      complete: () => void;
    }
  ) => {
    const { type, input, path, id } = op;

    const envelope: TRPCRequestMessage = {
      id: v4(),
      method: type,
      params: {
        input,
        path,
      },
    };
    this.pendingRequests.set(envelope.id, resolve);
    this.outgoing.push(envelope);

    this.dispatch();

    return () => {
      this.outgoing = this.outgoing.filter((msg) => msg.id !== envelope.id);
      observer.complete();
      if (op.type === "subscription") {
        this.outgoing.push({
          id,
          method: "subscription.stop",
        });
        this.dispatch();
      }
    };
  };

  dispatch = debounce(
    () => {
      if (typeof window === "undefined") return;
      window.parent.postMessage(
        {
          target: "dappstore-sdk-router",
          clientId: this.id,
          messages: this.outgoing,
        },
        "*"
      );

      this.outgoing = [];
    },
    100,
    {
      maxWait: 300,
    }
  );

  handleIncomingRequest = (request: TRPCClientIncomingRequest) => {
    // TODO: handle incoming request
    throw new Error("Not implemented");
  };
  handleIncomingResponse = (response: TRPCResponseMessage) => {
    const resolve = this.pendingRequests.get(response.id);
    if (!resolve) {
      return;
    }

    resolve(response);
  };
  subscribe = () => {
    const listener = (event: MessageEvent) => {
      const parsed = z
        .object({
          source: z.literal("dappstore-sdk-router"),
          target: z.string(),
          messages: z.array(z.unknown()),
        })
        .safeParse(event.data);

      if (!parsed.success || parsed.data.target !== this.id) {
        return;
      }

      parsed.data.messages.forEach((message: any) => {
        if ("method" in message) {
          this.handleIncomingRequest(message);
        } else {
          this.handleIncomingResponse(message);
        }
      });
    };
    if (typeof window === "undefined") return () => {};

    window.addEventListener("message", listener, false);
    return () => {
      window.removeEventListener("message", listener);
    };
  };
}

export const postMessageLink = <TRouter extends AnyRouter>(
  opts: PostMessageOptions
): TRPCLink<TRouter> => {
  const transformer = getTransformer(opts.transformer);
  const client = new PostMessageClient();
  client.subscribe();
  return () => {
    return ({ op }) => {
      const { type, path, id, context } = op;

      const input = transformer.input.serialize(op.input);

      return observable((observer) => {
        const unsubscribe = client.request(
          {
            type,
            path,
            input,
            id,
            context,
          },
          (data) => {
            const transformed = transformResult<TRouter, unknown>(
              data,
              transformer.output
            );

            if (!transformed.ok) {
              observer.error(TRPCClientError.from(transformed.error));
              return;
            }
            observer.next(transformed);
            if (op.type === "subscription") return;
            observer.complete();
            unsubscribe();
          },
          observer
        );
        return unsubscribe;
      });
    };
  };
};
