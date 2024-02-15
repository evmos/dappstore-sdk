import "./index.css";
import { useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
// import { createClient } from "@evmos/dappstore-sdk";
const EVMOS_ERC20_ADDRESS = "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517";
// const client = createClient();
export default function Widget() {
  const { address, isConnected } = useAccount();

  const {
    data: ercTokenBalance,
    error,
    isFetching,
  } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: EVMOS_ERC20_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: EVMOS_ERC20_ADDRESS,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
  });

  // useEffect(() => {
  //   // console.log(client);
  //   client.request("ping");
  //   return client.subscribe();
  // }, []);
  const shortenedAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : null;

  return (
    <div className="wg-text-white wg-text-center wg-flex wg-flex-col wg-justify-center wg-grow">
      <h1>Hello, {isConnected ? shortenedAddress : "World!"}</h1>
      {isFetching && <p>Loading balance</p>}
      {ercTokenBalance && (
        <p>
          Your Evmos Balance is:{" "}
          {formatUnits(ercTokenBalance[0], ercTokenBalance[1])}
        </p>
      )}
      {error && <p>Error: {error.name}</p>}
    </div>
  );
}
