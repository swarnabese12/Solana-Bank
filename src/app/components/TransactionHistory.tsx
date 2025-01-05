"use client";
import React, { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "./WalletContextProvider";
import * as anchor from "@project-serum/anchor";
import {
  FaArrowDown,
  FaArrowUp,
  FaClock,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import solanaIcon from "../../../public/images/solana-pngg.png";
import Image from "next/image";
import ReactPaginate from "react-paginate";

interface TransactionHistoryComponentProps {
  isOpen: boolean;
  onClose: () => void;
  userAccountPDA: PublicKey | null;
}

const TransactionHistoryComponent: React.FC<
  TransactionHistoryComponentProps
> = ({ isOpen, onClose, userAccountPDA }) => {
  const program = useProgram();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!userAccountPDA) return;

      setLoading(true);
      try {
        let userAccount = await program.account.userAccount.fetch(
          userAccountPDA
        );
        let fetchedTransactions = userAccount.transactionHistory || [];
        console.log("fetchedTransactions----->", fetchedTransactions);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [userAccountPDA]);

  const filteredTransactions = transactions.filter((tx: any) => {
    if (filter === "All") return true;
    const txnType = Object.keys(tx.txnType)[0].toUpperCase();
    return txnType === filter.toUpperCase();
  });

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const endOffset = (currentPage + 1) * transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    currentPage * transactionsPerPage,
    endOffset
  );

  const pageCount = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text">
            Transaction History
          </h2>

          <div className="flex items-center space-x-2">
            <div
              className="flex items-center space-x-2 bg-gray-700 text-white px-2 py-2 rounded-md border-2 border-transparent bg-clip-border"
              style={{
                borderImage: "linear-gradient(to right, #7e22ce, #4ade80) 1",
              }}
            >
              <FaFilter className="text-green-400 text-sm" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700 text-white font-medium text-[14px] outline-none border-none"
              >
                <option value="All">All</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdraw">Withdraw</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="bg-green-500 text-white p-1 hover:bg-green-600 transition-all"
              title="Close Transactions"
            >
              <FaTimes size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">
            Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-white">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-4 text-white">S.No</th>
                  <th className="px-4 py-4 w-32 text-white">Type</th>
                  <th className="px-4 py-4 w-72 text-white">Amount (SOL)</th>
                  <th className="px-4 py-4 text-white">Timestamp</th>
                  <th className="px-4 py-4 text-white">
                    Transaction Signature
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((tx: any, index) => (
                    <tr key={index} className="hover:bg-gray-500">
                      <th className="px-4 py-2">
                        {currentPage * transactionsPerPage + index + 1}
                      </th>
                      <td className="px-4 py-2">
                        {Object.keys(tx.txnType)[0].toUpperCase() ===
                        "DEPOSIT" ? (
                          <span>
                            Deposit{" "}
                            <FaArrowDown className="text-green-500 inline-block" />
                          </span>
                        ) : Object.keys(tx.txnType)[0].toUpperCase() ===
                          "WITHDRAW" ? (
                          <span>
                            Withdraw{" "}
                            <FaArrowUp className="text-red-500 inline-block" />
                          </span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-2 flex items-center space-x-2">
                        <Image
                          src={solanaIcon}
                          alt="Solana Logo"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        <span>
                          {new anchor.BN(tx.amount).toNumber() / 1e9 + " SOL (" + tx.amount.toNumber() + ' Lamports)'}
                        </span>
                      </td>

                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <FaClock className="text-gray-400" size={16} />
                          <span className="text-sm">
                            {new Date(
                              new anchor.BN(tx.timestamp).toNumber() * 1000
                            ).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-2">{tx.signature || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
            containerClassName="flex justify-center space-x-2 mt-6"
            activeClassName="bg-gradient-to-r from-green-400 to-purple-600 text-white px-4 py-2 rounded-md"
            pageClassName="bg-gray-800 text-gray-200 hover:bg-gradient-to-r from-green-400 to-purple-600 hover:text-white px-4 py-2 rounded-md cursor-pointer"
            previousClassName="bg-gray-800 text-gray-200 hover:bg-gradient-to-r from-green-400 to-purple-600 hover:text-white px-4 py-2 rounded-md cursor-pointer"
            nextClassName="bg-gray-800 text-gray-200 hover:bg-gradient-to-r from-green-400 to-purple-600 hover:text-white px-4 py-2 rounded-md cursor-pointer"
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryComponent;
