"use client";
import Image from "next/image";
import { createDAppstoreClient } from "@evmos/dappstore-sdk";

const client = createDAppstoreClient();
function App() {
  // const [host, setState] = useState(0);

  return (
    <div className="card">
      <button
        onClick={async () => {
          console.log("hey");

          const test = await client.provider.request({
            method: "eth_chainId",
          });
          console.log(test);
          // trpcClient.add({
          //   text: "test",
          //   id: "test",
          // });
          // trpcClient.;
        }}
      >
        Test
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <App />
      </div>
    </main>
  );
}
