"use client";
import { FC, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useProgram } from "./WalletContextProvider";
import Image from "next/image";
import solanaImage from "../../../public/images/solana4.jpg";
import { FaCheckCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DepositProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  supplyAccountPDA: PublicKey | null;
  userAccountPDA: PublicKey | null;
}

const DepositComponent: FC<DepositProps> = ({
  isOpen,
  onClose,
  walletAddress,
  supplyAccountPDA,
  userAccountPDA,
}) => {
  let program: any = useProgram();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    if (isNaN(amountInLamports) || amountInLamports <= 0) {
      alert("Please enter a valid deposit amount");
      return;
    }

    setLoading(true);
    try {
      if (!supplyAccountPDA || !userAccountPDA) {
        alert("Missing supply or user account PDA.");
        return;
      }

      const walletPublicKey = new PublicKey(walletAddress);

      let supplyAccountPDAPublicKey = new PublicKey(
        supplyAccountPDA.toString()
      );
      let userAccountPDAPublicKey = new PublicKey(userAccountPDA.toString());

      console.log(
        "supplyAccountPDA in before deposit",
        supplyAccountPDAPublicKey.toString()
      );
      console.log(
        "userAccountPDA in before deposit",
        userAccountPDAPublicKey.toString()
      );

      const supplyDataBalance1 = await program.account.supplyAccount.fetch(
        supplyAccountPDAPublicKey
      );
      const userDatabalance1 = await program.account.userAccount.fetch(
        userAccountPDAPublicKey
      );

      console.log(
        "supplyAccountPDA Balance Before Deposit:",
        supplyDataBalance1.totalBalance.toString()
      );
      console.log(
        "userAccountPDA Balance Before Deposit:",
        userDatabalance1.balance.toString()
      );
      await program.methods
        .deposit(new anchor.BN(amountInLamports))
        .accounts({
          supplyAccount: supplyAccountPDAPublicKey,
          userAccount: userAccountPDAPublicKey,
          user: walletPublicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const supplyDataBalance = await program.account.supplyAccount.fetch(
        supplyAccountPDAPublicKey
      );
      const userDatabalance = await program.account.userAccount.fetch(
        userAccountPDAPublicKey
      );

      console.log(
        "supplyAccountPDA Balance After Deposit:",
        supplyDataBalance.totalBalance.toString()
      );
      console.log(
        "userAccountPDA Balance  After Deposit:",
        userDatabalance.balance.toString()
      );
      toast.success("SOL Deposited Successfully!", {
        autoClose: 3000,
        style: {
          backgroundColor: '#333',
          color: 'white',
          borderRadius: '8px',
        },
      });
    } catch (error) {
      console.error("Deposit failed:", error);
      toast.error("Deposit Failed!");
    } finally {
      setLoading(false);
      setAmount("");
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div
        className={`relative bg-gradient-to-r from-gray-700 to-gray-800 p-8 rounded-lg w-120 max-w-full shadow-lg ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {loading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-10">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-yellow-400 text-4xl mb-4"
            />
            <p className="text-gray-200 text-lg font-bold">
              Deposit in progress, please wait
            </p>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 hover:from-purple-400 hover:to-purple-600 transition duration-200 ease-in-out">
            Deposit
          </h2>

          <div className="w-16 h-16">
            <Image
              src={solanaImage}
              alt="Solana Logo"
              className="rounded-full object-cover"
              width={64}
              height={64}
            />
          </div>
        </div>
        <div className="text-gray-300 mb-6">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 text-xl mr-2" />
            <span>Connected Wallet: {walletAddress}</span>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in SOL"
            className="w-full p-3 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-green-400 transition duration-200 ease-in-out"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            className="bg-gray-800 border-4 border-green-400 text-white rounded-lg p-2 px-4 hover:bg-gray-700 hover:border-purple-500 transition duration-200 ease-in-out flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-green-400 text-lg"
              />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
        <ToastContainer autoClose={3000} />
      </div>
    </div>
  );
};

export default DepositComponent;
