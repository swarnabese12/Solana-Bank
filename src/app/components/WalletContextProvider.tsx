"use client";

import { FC, ReactNode, useMemo } from "react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";

import idl from "../../../idl.json";
import {
  PROGRAM_ID
} from "../../../constants";

import dynamic from "next/dynamic";
import {
  AnchorWallet,
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as web3 from "@solana/web3.js";
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";
require("@solana/wallet-adapter-react-ui/styles.css");

export const WalletButtonImport = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const endpoint = web3.clusterApiUrl("devnet");
  const wallets = useMemo(() => {
    return [
      new walletAdapterWallets.PhantomWalletAdapter(),
      new walletAdapterWallets.SolflareWalletAdapter(),
      new walletAdapterWallets.AlphaWalletAdapter(),
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();
  return new AnchorProvider(connection, wallet as AnchorWallet, {});
}

export function useProgram() {
  const provider = useAnchorProvider();
  return new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);
}
