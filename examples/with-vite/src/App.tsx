import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { trpcClient } from "@evmos/dappstore-sdk-router/client";
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <button
        onClick={() => {
          trpcClient.add.mutate({
            text: "test",
            // id: "test",
          });
        }}
      >
        Test
      </button>
    </div>
  );
}

export default App;
