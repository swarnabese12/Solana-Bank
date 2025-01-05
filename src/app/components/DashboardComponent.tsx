"use client";
import { FC } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import solanaImage from "../../../public/images/solana-dots.jpg";
import { GiWallet } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md";
import { AiOutlineBank } from "react-icons/ai";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { TbCoinFilled, TbFileInvoice } from "react-icons/tb";
import { BiSolidOffer } from "react-icons/bi";
import TransactionHistoryComponent from "./TransactionHistory";
import {
  FaCoins,
  FaExchangeAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaClipboardList,
  FaFlagCheckered,
  FaChartBar,
} from "react-icons/fa";
import { AiOutlineTransaction } from "react-icons/ai";
import loanImage from "../../../public/images/loan2.jpg";

interface DashboardProps {
  loading: boolean;
  userBalance: number;
  initialized: boolean;
  totalTxns: number;
  totalDeposits: number;
  totalWithdraws: number;
  totalActiveLoans: number;
  loanAccountDetails: any;
  fetchUserData: () => void;
  userPDA: any;
}

const getTotalRepaymentAmount = (
  loanAmount: number,
  interestRate: number
): number => {
  let totalRepaymentDue = loanAmount + (loanAmount * interestRate) / 100;
  return totalRepaymentDue;
};

const Dashboard: FC<DashboardProps> = ({
  loading,
  userBalance,
  initialized,
  totalTxns,
  totalDeposits,
  totalWithdraws,
  totalActiveLoans,
  loanAccountDetails,
  fetchUserData,
  userPDA,
}) => {
  const [transactionHistoryModalOpen, setTransactionHistoryModalOpen] = useState(false);
  return (
    <div className="px-10 py-8 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-green-500 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 hover:rotate-2 hover:shadow-2xl hover:bg-green-900 transition duration-300 flex justify-between items-center p-6">
          <div className="bg-green-500 p-4 rounded-full shadow-lg flex items-center justify-center">
            <GiWallet className="text-white text-4xl" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-400">
              User Balance
            </h2>
            <p className="text-4xl font-bold text-green-500">
              {userBalance} SOL
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 hover:rotate-2 hover:shadow-2xl hover:bg-purple-900 transition duration-300 ease-in-out flex justify-between items-center p-6"
          onClick={() => setTransactionHistoryModalOpen(true)}>
          <div className="bg-purple-500 p-4 rounded-full shadow-lg flex items-center justify-center">
            <FaExchangeAlt className="text-white text-4xl" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-400">
              Total transactions
            </h2>
            <p className="text-4xl font-bold text-purple-500">{totalTxns}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 hover:rotate-2 hover:shadow-2xl hover:bg-blue-900 transition duration-300 flex justify-between items-center p-6">
          <div className="bg-blue-500 p-4 rounded-full shadow-lg flex items-center justify-center">
            <MdOutlineSavings className="text-white text-4xl" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-400">Deposits</h2>
            <p className="text-4xl font-bold text-blue-500">{totalDeposits}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 hover:rotate-2 hover:shadow-2xl hover:bg-yellow-900 transition duration-300 flex justify-between items-center p-6">
          <div className="bg-yellow-500 p-4 rounded-full shadow-lg flex items-center justify-center">
            <AiOutlineBank className="text-white text-4xl" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-400">Withdrawals</h2>
            <p className="text-4xl font-bold text-yellow-500">
              {totalWithdraws}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 hover:rotate-2 hover:shadow-2xl hover:bg-red-900 transition duration-300 flex justify-between items-center p-6">
          <div className="bg-red-500 p-4 rounded-full shadow-lg flex items-center justify-center">
            <FaCoins className="text-white text-4xl" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-400">
              Active Loans
            </h2>
            <p className="text-4xl font-bold text-red-500">
              {totalActiveLoans}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 justify-center lg:justify-between">
        {totalActiveLoans !== 0 && (
          <div className="relative bg-gradient-to-r from-green-500 via-purple-600 to-gray-800 rounded-lg shadow-md transform hover:scale-105 transition duration-300 flex flex-col p-6 space-y-4 max-w-2xl w-full lg:w-[48%]">
            <div className="absolute top-4 right-4">
              <Image
                src={solanaImage}
                alt="Solana Logo"
                className="rounded-full shadow-lg"
                width={100}
                height={100}
              />
            </div>

            <h2 className="text-2xl font-semibold text-white tracking-wide flex items-center">
              Active Loan
              <TbRosetteDiscountCheckFilled className="text-white-500 text-2xl ml-2" />
            </h2>

            <div className="space-y-1">
              <div className="flex items-center">
                <p className="text-gray-200 text-sm">
                  Total Loan Amount In Lamports
                </p>
                <TbCoinFilled className="text-white-500 text-lg ml-2" />
              </div>
              <p className="text-3xl font-bold text-white">
                {loanAccountDetails.loanAmount.toNumber()}
              </p>
            </div>

            <div>
              <div className="flex items-center">
                <p className="text-gray-200 text-sm">
                  Total Repayment Amount In Lamports
                </p>
                <TbCoinFilled className="text-white-500 text-lg ml-2" />
              </div>
              <p className="text-xl font-semibold text-white">
                {getTotalRepaymentAmount(
                  loanAccountDetails.loanAmount.toNumber(),
                  loanAccountDetails.interestRate.toNumber()
                )}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <p className="text-gray-200 text-sm">Interest Rate</p>
                <FaCoins className="text-white-500 text-lg ml-2" />
              </div>
              <p className="text-xl font-semibold text-white">
                {loanAccountDetails.interestRate.toNumber()}%
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center">
                <p className="text-gray-200 text-sm">Loan Term</p>
                <FaCalendarAlt className="text-white-500 text-lg ml-2" />
              </div>
              <p className="text-sm font-semibold text-white">
                {new Date(
                  loanAccountDetails.startTime.toNumber() * 1000
                ).toLocaleString()}{" "}
                -{" "}
                {new Date(
                  loanAccountDetails.endTime.toNumber() * 1000
                ).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 p-4 rounded-lg shadow-2xl transform hover:scale-105 transition duration-300 flex flex-col space-y-4 w-full lg:w-[48%] h-auto border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold tracking-wide text-white">
              Market Trends
            </h2>
            <span className="text-xs text-gray-400 flex items-center space-x-1">
              <span>Updated: 1h ago</span>
            </span>
          </div>

          <div>
            <h3 className="text-base font-semibold text-blue-400 flex items-center border-b border-gray-600 pb-1 mb-2">
              Interest Rates<FaCoins className="text-white-500 text-lg ml-2" />
            </h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span className="text-sm">Personal Loans</span>
                <span className="font-bold text-green-400 text-sm">5.0%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Home Loans</span>
                <span className="font-bold text-green-400 text-sm">6.2%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Car Loans</span>
                <span className="font-bold text-green-400 text-sm">8.1%</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-blue-400 flex items-center border-b border-gray-600 pb-1 mb-2">
              Bank Offers<BiSolidOffer className="text-white-500 text-lg ml-2" />
            </h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span className="text-sm">0% EMI on loans</span>
                <span className="font-bold text-purple-400 text-sm">New</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Reduced processing fees</span>
                <span className="font-bold text-yellow-400 text-sm">
                  Limited
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Cashback on deposits</span>
                <span className="font-bold text-red-400 text-sm">10%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={fetchUserData}
        className="bg-orange-500 text-white px-6 py-3 rounded shadow-md hover:bg-orange-600 disabled:opacity-50 mt-6"
        disabled={loading}
      >
        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Initialize"}
      </button>
      {transactionHistoryModalOpen && userPDA && (
        <TransactionHistoryComponent
          isOpen={transactionHistoryModalOpen}
          onClose={() => setTransactionHistoryModalOpen(false)}
          userAccountPDA={userPDA}
        />
      )}
    </div>
  );
};

export default Dashboard;
