import {
  AnyRouter,
  TRPCError,
  callProcedure,
  getErrorShape,
  getTRPCErrorFromUnknown,
  transformTRPCResponse,
} from "@trpc/server";
import {
  TRPCClientOutgoingMessage,
  TRPCRequestMessage,
  TRPCResponseMessage,
  parseTRPCMessage,
} from "@trpc/server/rpc";
import { isString } from "lodash-es";
import { z } from "zod";
import { isObservable } from "@trpc/server/observable";

export const createPostMessageHost = <TRouter extends AnyRouter>({
  router,
  target,
}: {
  router: TRouter;
  target: Window;
}) => {
  const { transformer } = router._def._config;

  function respond(targetId: string, untransformedJSON: TRPCResponseMessage) {
    target.postMessage(
      {
        source: "dappstore-sdk-router",
        target: targetId,
        messages: [
          transformTRPCResponse(router._def._config, untransformedJSON),
        ],
      },
      "*"
    );
  }
  async function handleSubsription(
    targetId: string,
    msg: TRPCClientOutgoingMessage
  ) {
    const { id, jsonrpc } = msg;
    if (msg.method === "subscription.stop") {
      // TODO: "handle stop";

      respond(targetId, {
        id,
        jsonrpc,
        result: {
          type: "stopped",
        },
      });
      return;
    }

    const { path, input } = msg.params;
    const type = msg.method;

    try {
      const result = await callProcedure({
        procedures: router._def.procedures,
        path,
        getRawInput: async () => input,
        ctx: {},
        type,
      });
      if (!isObservable(result)) {
        throw new TRPCError({
          message: `Subscription ${path} did not return an observable`,
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const observable = result;
      // TODO: Do we ever need to manually unsubscribe here?
      const subscription = observable.subscribe({
        next(data) {
          respond(targetId, {
            id,
            jsonrpc,
            result: {
              type: "data",
              data,
            },
          });
        },
        error(err) {
          const error = getTRPCErrorFromUnknown(err);

          respond(targetId, {
            id,
            jsonrpc,
            error: getErrorShape({
              config: router._def._config,
              error,
              type,
              path,
              input,
              ctx: {},
            }),
          });
        },
        complete() {
          respond(targetId, {
            id,
            jsonrpc,
            result: {
              type: "stopped",
            },
          });
        },
      });

      respond(targetId, {
        id,
        jsonrpc,
        result: {
          type: "started",
        },
      });
    } catch (cause) {
      const error = getTRPCErrorFromUnknown(cause);

      respond(targetId, {
        id,
        jsonrpc,
        error: getErrorShape({
          config: router._def._config,
          error,
          type,
          path,
          input,
          ctx: {},
        }),
      });
    }
  }
  async function handleMessage(
    targetId: string,
    msg: TRPCClientOutgoingMessage
  ) {
    // const { id, jsonrpc } = msg;
    if (msg.id === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "`id` is required",
      });
    }

    if (msg.method === "subscription" || msg.method === "subscription.stop") {
      return handleSubsription(targetId, msg);
    }
    handleRequest(targetId, msg);
  }
  async function handleRequest(targetId: string, msg: TRPCRequestMessage) {
    const { id, jsonrpc } = msg;

    const { path, input } = msg.params;
    const type = msg.method;

    try {
      // await ctxPromise;
      const result = await callProcedure({
        procedures: router._def.procedures,
        path,
        getRawInput: async () => input,
        ctx: {},
        type,
      });

      respond(targetId, {
        id,
        jsonrpc,
        result: {
          type: "data",
          data: result,
        },
      });
      return;
    } catch (cause) {
      const error = getTRPCErrorFromUnknown(cause);
      // opts.onError?.({ error, path, type, ctx, req, input });
      respond(targetId, {
        id,
        jsonrpc,
        error: getErrorShape({
          config: router._def._config,
          error,
          type,
          path,
          input,
          ctx: {},
        }),
      });
    }
  }

  const listener = async (event: MessageEvent) => {
    if (
      event.data?.source === "react-devtools-content-script" ||
      event.data?.target === "metamask-inpage"
    )
      return;
    if (event.source !== target) {
      return;
    }
    const targetId = event.data?.clientId;

    if (!isString(targetId)) {
      return;
    }

    try {
      const parsed = z
        .object({
          target: z.literal("dappstore-sdk-router"),
          clientId: z.string(),
          messages: z.array(z.unknown()),
        })
        .safeParse(event.data);

      if (!parsed.success) return;

      const message = parsed.data.messages;

      const promises = message
        .map((raw) => parseTRPCMessage(raw, transformer))
        .map((message) => handleMessage(targetId, message));
      await Promise.all(promises);
    } catch (cause) {
      const error = new TRPCError({
        code: "PARSE_ERROR",
        cause,
      });

      respond(targetId, {
        id: null,
        error: getErrorShape({
          config: router._def._config,
          error,
          type: "unknown",
          path: undefined,
          input: undefined,
          ctx: undefined,
        }),
      });
    }
  };

  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("message", listener, false);

  return () => {
    window.removeEventListener("message", listener);
  };
};
