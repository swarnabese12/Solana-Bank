import React, { useState, useEffect } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./WalletContextProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FaCoins, FaCalendarAlt } from "react-icons/fa";
import { RiCoinsFill } from "react-icons/ri";
import { GrStripe } from "react-icons/gr";

interface RepayLoanProps {
  isOpen: boolean;
  onClose: () => void;
  userAccountPDA: PublicKey | null;
  supplyAccountPDA: PublicKey | null;
}

const RepayLoanComponent: React.FC<RepayLoanProps> = ({
  isOpen,
  onClose,
  userAccountPDA,
  supplyAccountPDA,
}) => {
  const { publicKey } = useWallet();
  const program = useProgram();

  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState<number | null>(null);
  const [interestPercent, setInterestPercent] = useState<number | null>(null);
  const [totalRepaymentDue, setTotalRepaymentDue] = useState<number | null>(
    null
  );
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoanCleared, setLoanCleared] = useState(false);

  useEffect(() => {
    let isMounted = true;
  
    const fetchLoanDetails = async () => {
      if (!isOpen || !publicKey || !userAccountPDA || !supplyAccountPDA || !program) return;
  
      try {
        const [loanAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("loan"), publicKey.toBuffer()],
          program.programId
        );
  
        console.log("Fetching loan details for:", loanAccountPDA.toBase58());
  
        const loanAccountInfo = await program.provider.connection.getAccountInfo(
          loanAccountPDA
        );
  
        if (!loanAccountInfo) {
          console.error("Loan account does not exist:", loanAccountPDA.toBase58());
          if (isMounted) {
            setLoanCleared(true);
            setTotalRepaymentDue(0);
          }
          toast.error("No loan account found.");
          return;
        }
  
        const loanAccount = await program.account.loanAccount.fetch(
          loanAccountPDA
        );
  
        if (isMounted) {
          if (loanAccount.repaid.toString() === "true") {
            setLoanCleared(true);
            setTotalRepaymentDue(0);
            return;
          }
  
          const loanAmountValue = loanAccount.loanAmount.toNumber();
          const interestRate = loanAccount.interestRate.toNumber();
          const totalDue = loanAmountValue + (loanAmountValue * interestRate) / 100;
  
          setLoanAmount(loanAmountValue);
          setInterestPercent(interestRate);
          setTotalRepaymentDue(totalDue);
  
          setStartTime(new Date(loanAccount.startTime.toNumber() * 1000));
          setEndTime(new Date(loanAccount.endTime.toNumber() * 1000));
        }
      } catch (error) {
        console.error("Failed to fetch loan details:", error);
        if (isMounted) toast.error("Error fetching loan details.");
      }
    };
  
    fetchLoanDetails();
  
    return () => {
      isMounted = false;
    };
  }, [isOpen]);
  

  const handleLoanRepayment = async () => {
    if (!publicKey || !userAccountPDA || !supplyAccountPDA) {
      toast.error("Required accounts are not available.");
      return;
    }

    try {
      setLoading(true);

      let [loanAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("loan"), publicKey.toBuffer()],
        program.programId
      );

      const repaymentAmountInSOL = parseFloat(repaymentAmount);
      const repaymentAmountInLamports = Math.round(
        repaymentAmountInSOL * 1_000_000_000
      );

      if (isNaN(repaymentAmountInLamports) || repaymentAmountInLamports <= 0 || (totalRepaymentDue && (repaymentAmountInLamports < totalRepaymentDue))) {
        toast.error("Invalid repayment amount 💰");
        return;
      }

      const tx = await program.methods
        .repayLoan(new anchor.BN(repaymentAmountInLamports))
        .accounts({
          user: publicKey,
          userAccount: userAccountPDA,
          loanAccount: loanAccountPDA,
          supplyAccount: supplyAccountPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      toast.success(`Loan repaid successfully. Transaction: ${tx}`);
      //onClose();
    } catch (error) {
      console.error("Error repaying loan:", error);
      toast.error("Failed to repay loan. Please try again.");
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
              Processing loan repayment, please wait...
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Repay Loan</h2>
          <button
            className="text-gray-400 hover:text-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {isLoanCleared ? (
          <div className="border-2 border-green-500 bg-gray-800 p-4 rounded-lg shadow-md mt-6">
            <p className="text-center text-green-400 text-lg font-bold">
              🎉 Your loan is fully repaid! No active loans at the moment.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="bg-gradient-to-r from-green-500 via-purple-600 to-gray-800 p-4 rounded-lg shadow-lg mb-4 text-white">
              {loanAmount !== null && totalRepaymentDue !== null ? (
                <div className="space-y-3">
                  <p className="text-sm flex items-center">
                    <span className="font-bold text-gray-100">
                      Loan Amount (Lamports):
                    </span>
                    <span className="ml-2">{loanAmount.toLocaleString()}</span>
                    <FaCoins className="text-white text-lg ml-2" />
                  </p>
                  <p className="text-sm flex items-center">
                    <span className="font-bold text-gray-100">
                      Loan Amount (SOL):
                    </span>
                    <span className="ml-2">
                      {(loanAmount / 1_000_000_000).toFixed(3)} SOL
                    </span>
                    <GrStripe className="text-white text-lg ml-2 rounded-lg" />
                  </p>
                  <p className="text-sm flex items-center">
                    <span className="font-bold text-gray-100">
                      Interest Rate:
                    </span>
                    <span className="ml-2">{interestPercent}%</span>
                    <RiCoinsFill className="text-white text-lg ml-2" />
                  </p>
                  <p className="text-sm flex items-center">
                    <span className="font-bold text-gray-100">
                      Total Due with Interest (Lamports):
                    </span>
                    <span className="ml-2">
                      {totalRepaymentDue.toLocaleString()}
                    </span>
                    <FaCoins className="text-white text-lg ml-2" />
                  </p>
                  <p className="text-sm flex items-center">
                    <span className="font-bold text-gray-100">
                      Total Due with Interest (SOL):
                    </span>
                    <span className="ml-2">
                      {(totalRepaymentDue / 1_000_000_000).toFixed(3)} SOL
                    </span>
                    <GrStripe className="text-white text-lg ml-2 rounded-lg" />
                  </p>

                  {startTime && endTime && (
                    <p className="text-sm mt-3 flex items-center">
                      <span className="font-semibold">Loan Term:</span>{" "}
                      <span className="text-[13px] ml-1">
                        {startTime.toLocaleString()} -{" "}
                        {endTime.toLocaleString()}
                      </span>
                      <FaCalendarAlt className="text-white text-lg ml-2" />
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm">
                  Fetching loan details, please wait...
                </p>
              )}
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-green-400 mb-1">
                Repayment Amount (SOL)
              </label>
              <input
                type="number"
                value={repaymentAmount}
                onChange={(e) => setRepaymentAmount(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter repayment amount in SOL"
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!isLoanCleared && (
            <>
              <button
                onClick={handleLoanRepayment}
                className="bg-green-500 hover:bg-purple-500 px-4 py-2 rounded text-white"
                disabled={loading}
              >
                Repay
              </button>
              <button
                onClick={onClose}
                className="ml-4 px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <ToastContainer autoClose={5000} />
      </div>
    </div>
  );
};

export default RepayLoanComponent;
