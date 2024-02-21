"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { dappstore } from "@/dappstore-client";

const useAccount = () => {
  const [account, setAccount] = useState<string[]>([]);
  useEffect(() => {
    return dappstore.onAccountsChange((accounts) => setAccount(accounts));
  }, []);
  return account;
};

const useChainId = () => {
  const [chainId, setChainId] = useState<string>();
  useEffect(() => {
    return dappstore.onChainChange((id) => setChainId(id));
  }, []);
  return chainId;
};

export default function Home() {
  const accounts = useAccount();
  const chainId = useChainId();
  return (
    <main className={styles.main}>
      <h2>Accounts</h2>
      {accounts.map((acc) => `${acc.slice(0, 4)}..${acc.slice(-6)}`)}
      <h2>ChainId</h2>
      {chainId}
    </main>
  );
}
