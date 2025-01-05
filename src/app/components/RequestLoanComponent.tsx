import React, { useState } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./WalletContextProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FaCoins, FaCalendarAlt } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa";

interface RequestLoanProps {
  isOpen: boolean;
  onClose: () => void;
  userAccountPDA: PublicKey | null;
  supplyAccountPDA: PublicKey | null;
}

const RequestLoanComponent: React.FC<RequestLoanProps> = ({
  isOpen,
  onClose,
  userAccountPDA,
  supplyAccountPDA,
}) => {
  const { publicKey } = useWallet();
  const program = useProgram();

  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActiveLoanExisted, setActiveLoanExisted] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const initializeLoanAccount = async (loanAccountPDA: PublicKey) => {
    try {
      if (!publicKey) {
        toast.error("Wallet not connected.");
        throw new Error("Wallet not connected.");
      }
      const tx = await program.methods
        .initializeLoanAccount()
        .accounts({
          user: publicKey,
          loanAccount: loanAccountPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log(`Loan account initialized. Transaction: ${tx}`);
    } catch (error) {
      console.error("Error initializing loan account:", error);
      toast.error("Failed to initialize loan account.");
      throw error;
    }
  };

  const handleLoanRequest = async () => {
    if (!publicKey || !userAccountPDA || !supplyAccountPDA) {
      toast.error("Required accounts are not available.");
      return;
    }

    try {
      setLoading(true);
      let [loanAccountPDA, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("loan"), publicKey.toBuffer()],
        program.programId
      );

      console.log("Loan PDA", loanAccountPDA.toString());

      let loanAccountBefore = await program.account.loanAccount.fetch(
        loanAccountPDA
      );

      let userAccount = await program.account.userAccount.fetch(userAccountPDA);

      console.log(
        "userAccount Has Loan -->",
        userAccount.hasLoanAccount.toString()
      );

      console.log("Repaid Loan is---->", loanAccountBefore.repaid.toString());
      console.log(
        "Loan Account State Before:",
        JSON.stringify({
          loanAmount: loanAccountBefore.loanAmount.toString(),
          interestRate: loanAccountBefore.interestRate.toString(),
          startTime: loanAccountBefore.startTime.toString(),
          endTime: loanAccountBefore.endTime.toString(),
          repaid: loanAccountBefore.repaid,
        })
      );

      if (loanAccountBefore.repaid.toString() == "false") {
        console.log("Not repaid");
        console.log(
          "Has Loan Account for this user=",
          userAccount.hasLoanAccount
        );
        toast.error("Active loan exists 😞");
        setActiveLoanExisted(true);
        return;
      }

      if (userAccount.hasLoanAccount == false) {
        await initializeLoanAccount(loanAccountPDA);
      }

      const amountInSOL = parseFloat(loanAmount);
      const amountInLamports = Math.round(amountInSOL * 1_000_000_000);
      const termInMonths = parseInt(loanTerm, 10);
      const termInSeconds = termInMonths * 30 * 24 * 60 * 60;
      const interestRate = 5;

      if (isNaN(amountInLamports) || amountInLamports <= 0) {
        toast.error("Invalid loan amount.");
        return;
      }
      if (isNaN(termInMonths) || termInMonths <= 0) {
        toast.error("Invalid loan term.");
        return;
      }

      const tx = await program.methods
        .requestLoan(
          new anchor.BN(amountInLamports),
          new anchor.BN(interestRate),
          new anchor.BN(termInSeconds)
        )
        .accounts({
          user: publicKey,
          userAccount: userAccountPDA,
          loanAccount: loanAccountPDA,
          supplyAccount: supplyAccountPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      toast.success(`Loan requested successfully. Transaction: ${tx}`);
      setTransactionSuccess(true);
    } catch (error) {
      console.error("Error requesting loan:", error);
      toast.error("Failed to request loan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg w-1/3 text-white relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-10">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-yellow-400 text-4xl mb-4"
            />
            <p className="text-gray-200 text-lg font-bold">
              Processing loan request, please wait...
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-green-500">
              Request Loan
            </h2>
          </div>

          <button
            className="text-gray-400 hover:text-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {isActiveLoanExisted || transactionSuccess ? (
          <div className="border-2 border-green-500 bg-gray-800 p-4 rounded-lg shadow-md mt-6">
            <p className="text-center text-green-400 text-lg font-bold">
              {isActiveLoanExisted
                ? "⚠️ You have an active loan. Please repay it before requesting a new loan."
                : "Loan request is approved successfully, and the transaction was successful. Please check your wallet balance.🎉🎉🎉"}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 flex items-center">
                Loan Amount
                <FaDollarSign className="text-green-500 text-lg ml-2" />
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter loan amount"
                disabled={loading}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 flex items-center mb-2">
                Interest Rate (%)
                <FaCoins className="text-green-500 text-lg ml-2" />
              </label>
              <input
                type="number"
                value="5"
                readOnly
                className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 flex items-center mb-2">
                Loan Term (in Months)
                <FaCalendarAlt className="text-green-500 text-lg ml-2" />
              </label>
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter loan term in months"
                disabled={loading}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleLoanRequest}
                className="bg-green-500 hover:bg-green-700 px-4 py-2 rounded text-white"
                disabled={loading}
              >
                Confirm
              </button>
              <button
                onClick={onClose}
                className="ml-4 px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        <ToastContainer autoClose={3000} />
      </div>
    </div>
  );
};

export default RequestLoanComponent;
