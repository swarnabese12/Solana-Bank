"use client";
import { useEffect, useState } from "react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "../app/components/WalletContextProvider";
import * as anchor from "@project-serum/anchor";
import Head from "next/head";
import Dashboard from "./components/DashboardComponent";
import Navbar from "./components/NavbarComponent";

export default function Home() {
  const { publicKey }: any = useWallet();
  const program = useProgram();

  const [loading, setLoading] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [totalTransactions, setTotalTxns] = useState<number>(0);
  const [totalDeposits, setTotalDeposits] = useState<number>(0);
  const [totalWithdraws, setTotalWithdraws] = useState<number>(0);
  const [totalActiveLoans, setTotalActiveLoans] = useState<number>(0);
  const [loanAccountDetails, setLoanAccountInfo] = useState<object>({});
  const [initialized, setInitialized] = useState<boolean>(false);
  const [userAccount, setUserAccount] = useState<PublicKey | null>(null);
  let supplyAccount = new PublicKey(
    "HcZtoivqZwM72yaztFVyecDPTVaygjJnAmSMc44aWRJB"
  );

  useEffect(() => {
    fetchUserAndSupplyData();
  }, [publicKey]);

  const fetchUserAndSupplyData = async () => {
    if (!publicKey || !program) return;

    try {
      setLoading(true);

      const [userAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        program.programId
      );

      console.log("userAccount-->", userAccount.toString());

      setUserAccount(userAccount);

      const supplyData: any = await program.account.supplyAccount
        .fetch(supplyAccount)
        .catch(() => null);
      const userData: any = await program.account.userAccount
        .fetch(userAccount)
        .catch(() => null);

      if (userData.hasLoanAccount) {
        console.log("Has Loan Accountttt");
        const [loanAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("loan"), publicKey.toBuffer()],
          program.programId
        );
        let loanAccountInfo: any = await program.account.loanAccount.fetch(
          loanAccount
        );
        console.log(
          "Fetching loan loanAccountInfo at first-->",
          loanAccountInfo.loanAmount.toNumber(),
          loanAccountInfo.interestRate.toNumber()
        );
        setLoanAccountInfo(loanAccountInfo);
      }

      if (supplyData) {
        console.log("supplyAccount PubKey:", supplyAccount.toString());
        console.log("supplyData Balance:", supplyData.totalBalance.toString());
      } else {
        console.log("supplyAccount not found or not initialized.");
      }

      if (userData) {
        console.log("userAccount PubKey:", userAccount.toString());
        console.log("userData Balance:", userData.balance.toString());
      } else {
        console.log("userAccount not found or not initialized.");
      }

      if (supplyData && userData) {
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let allTransactions: any = userData.transactionHistory || [];
        allTransactions.forEach((tx: any) => {
          if (tx?.txnType) {
            const txnTypeKey = Object.keys(tx.txnType)[0]?.toUpperCase();
            if (txnTypeKey === "DEPOSIT") {
              totalDeposits++;
            } else if (txnTypeKey === "WITHDRAW") {
              totalWithdrawals++;
            }
          }
        });
        let totalActiveLoans = userData.hasLoanAccount ? 1 : 0;
        console.log(
          "userData.hasLoanAccount--->",
          userData.hasLoanAccount.toString()
        );
        console.log("Total allTransactions:", allTransactions?.length);
        console.log("Total Deposits:", totalDeposits);
        console.log("Total Withdrawals:", totalWithdrawals);
        setTotalTxns(allTransactions?.length);
        setTotalDeposits(totalDeposits);
        setTotalWithdraws(totalWithdrawals);
        setTotalActiveLoans(totalActiveLoans);
        setUserBalance(userData.balance.toNumber() / LAMPORTS_PER_SOL);
        setInitialized(true);
        setLoading(false);
      } else {
        await initializeSupplyAndUserAccount(supplyAccount, userAccount);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const initializeSupplyAndUserAccount = async (
    supplyAccount: PublicKey,
    userAccount: PublicKey
  ) => {
    try {
      const amount = 100 * LAMPORTS_PER_SOL;

      await program.methods
        .initializeSupply(new anchor.BN(amount))
        .accounts({
          supplyAccount,
          userAccount,
          authority: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const supplyData = await program.account.supplyAccount.fetch(
        supplyAccount
      );
      const userData = await program.account.userAccount.fetch(userAccount);

      setUserBalance(userData.balance.toNumber() / LAMPORTS_PER_SOL);
      setInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error("Error during initialization:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>SolBank - Banking System</title>
        <meta
          name="description"
          content="A Solana-based traditional banking system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="container mx-auto py-2 px-2 bg-gray-800">
        <Dashboard
          loading={loading}
          userBalance={userBalance}
          initialized={initialized}
          totalTxns={totalTransactions}
          totalDeposits={totalDeposits}
          totalWithdraws={totalWithdraws}
          totalActiveLoans={totalActiveLoans}
          loanAccountDetails={loanAccountDetails}
          fetchUserData={fetchUserAndSupplyData}
          userPDA={userAccount}
        />
      </main>
    </div>
  );
}
