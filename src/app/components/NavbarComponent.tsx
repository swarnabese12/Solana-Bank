"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./WalletContextProvider";
import DepositComponent from "./DepositComponent";
import WithdrawComponent from "./WithdrawComponent";
import RequestLoanComponent from "./RequestLoanComponent";
import TransactionHistoryComponent from "./TransactionHistory";
import RepayLoanComponent from "./RepayLoanComponent";
import { WalletButtonImport } from "./WalletContextProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContainerDynamic = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

const notify = () =>
  toast.success("Dashboard clicked successfully!", {
    autoClose: 3000,
    style: {
      backgroundColor: "#333",
      color: "white",
      borderRadius: "8px",
    },
  });

const NavbarComponent = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const program = useProgram();

  const [supplyAccountPDA, setSupplyAccountPDA] = useState<PublicKey | null>(
    null
  );
  const [userAccountPDA, setUserAccountPDA] = useState<PublicKey | null>(null);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transactionHistoryModalOpen, setTransactionHistoryModalOpen] =
    useState(false);
  const [requestLoanModalOpen, setRequestLoanModalOpen] = useState(false);
  const [repayLoanModalOpen, setRepayLoanModalOpen] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    const derivedSupplyAccountPDA = new PublicKey(
      "HcZtoivqZwM72yaztFVyecDPTVaygjJnAmSMc44aWRJB"
    );

    const derivedUserAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), publicKey.toBuffer()],
      program.programId
    )[0];

    if (
      !supplyAccountPDA ||
      supplyAccountPDA.toBase58() !== derivedSupplyAccountPDA.toBase58()
    ) {
      setSupplyAccountPDA(derivedSupplyAccountPDA);
    }

    if (
      !userAccountPDA ||
      userAccountPDA.toBase58() !== derivedUserAccountPDA.toBase58()
    ) {
      setUserAccountPDA(derivedUserAccountPDA);
    }
  }, [publicKey]);

  return (
    <nav className="bg-gray-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="bg-gradient-to-r from-teal-400 via-green-400 to-purple-500 text-transparent bg-clip-text text-2xl font-bold flex items-center mr-8 ml-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="url(#solana-gradient)"
            className="w-8 h-8 mr-2"
          >
            <defs>
              <linearGradient
                id="solana-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#00FFA3", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#5F3C99", stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3.75L19.5 8.25V15.75L12 20.25L4.5 15.75V8.25L12 3.75Z"
            />
          </svg>
          SOLBank
        </div>

        <ul className="flex space-x-6 text-gray-300 font-medium">
          <li>
            <button
              className="hover:text-teal-400 transition-colors duration-300"
              onClick={notify}
            >
              Dashboard
            </button>
            <ToastContainerDynamic autoClose={3000} />
          </li>
          <li>
            <button
              className="hover:text-teal-400 transition-colors duration-300"
              onClick={() => setTransactionHistoryModalOpen(true)}
            >
              Transactions
            </button>
          </li>
          <li>
            <button
              className="hover:text-teal-400 transition-colors duration-300"
              onClick={() => setDepositModalOpen(true)}
            >
              Deposit
            </button>
          </li>
          <li>
            <button
              className="hover:text-teal-400 transition-colors duration-300"
              onClick={() => setWithdrawModalOpen(true)}
            >
              Withdraw
            </button>
          </li>
          <li>
            <button
              className="hover:text-teal-400 transition-colors duration-300"
              onClick={() => setRequestLoanModalOpen(true)}
            >
              Request Loan
            </button>
          </li>
          <li>
            <button
              className="hover:text-teal-400 transition-colors duration-300"
              onClick={() => setRepayLoanModalOpen(true)}
            >
              Repay Loan
            </button>
          </li>
        </ul>

        <div className="flex items-center space-x-4 ml-8 mr-6">
          <WalletButtonImport />
        </div>
      </div>

      {connected && publicKey && (
        <>
          <DepositComponent
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            walletAddress={publicKey.toString()}
            supplyAccountPDA={supplyAccountPDA}
            userAccountPDA={userAccountPDA}
          />

          <WithdrawComponent
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            walletAddress={publicKey.toString()}
            supplyAccountPDA={supplyAccountPDA}
            userAccountPDA={userAccountPDA}
          />

          <TransactionHistoryComponent
            isOpen={transactionHistoryModalOpen}
            onClose={() => setTransactionHistoryModalOpen(false)}
            userAccountPDA={userAccountPDA}
          />

          <RequestLoanComponent
            isOpen={requestLoanModalOpen}
            onClose={() => setRequestLoanModalOpen(false)}
            userAccountPDA={userAccountPDA}
            supplyAccountPDA={supplyAccountPDA}
          />

          <RepayLoanComponent
            isOpen={repayLoanModalOpen}
            onClose={() => setRepayLoanModalOpen(false)}
            userAccountPDA={userAccountPDA}
            supplyAccountPDA={supplyAccountPDA}
          />
        </>
      )}
    </nav>
  );
};

export default NavbarComponent;
