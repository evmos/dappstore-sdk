import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { EIP1193Provider, Hex, ProviderConnectInfo } from "viem";

type Context = {
  debug: boolean;
};
const t = initTRPC.context<Context>().create({
  allowOutsideOfServer: true,
});

export const createHostRouter = (provider: unknown) => {
  const _provider: EIP1193Provider = provider as EIP1193Provider;
  const providerRouter = t.router({
    on: t.router({
      accountsChanged: t.procedure.subscription((a) => {
        return observable<Hex[]>((emit) => {
          _provider.on("accountsChanged", (accounts) => {
            emit.next(accounts);
          });
        });
      }),

      chainChanged: t.procedure.subscription((a) => {
        return observable<Hex>((emit) => {
          _provider.on("chainChanged", (chainId) => {
            emit.next(chainId as Hex);
          });
        });
      }),
      connect: t.procedure.subscription((a) => {
        return observable<ProviderConnectInfo>((emit) => {
          _provider.on("connect", (...args) => {
            emit.next(...args);
          });
        });
      }),
    }),

    request: t.procedure
      .input(
        z
          .object({
            method: z.string(),
            params: z.array(z.unknown()).or(z.object({})).optional(),
          })
          .readonly()
      )
      .mutation((opts) => {
        return _provider.request(opts.input as never);
      }),
  });

  return t.router({
    ack: t.procedure
      .input(
        z.object({
          version: z.string(),
        })
      )
      .query(async ({}) => {
        const accounts = await _provider.request({
          method: "eth_requestAccounts",
        });
        const chainId = await _provider.request({ method: "eth_chainId" });

        const response = {
          version: process.env.npm_package_version as string,
          state: {
            accounts,
            chainId,
          },
        };

        return response;
      }),

    provider: providerRouter,
  });
};

export type HostRouter = ReturnType<typeof createHostRouter>;
