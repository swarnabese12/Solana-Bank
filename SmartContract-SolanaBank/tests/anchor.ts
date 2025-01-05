import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import type { Bank } from "../target/types/bank";

describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Bank as anchor.Program<Bank>;
  
  let program = program;
  let wallet = pg.wallet;

  let supplyAccountPDA;
  let userAccountPDA;
  let supplyAccountBump: number;
  let userAccountBump: number;

  before(async () => {
    // Derive PDA for supply account
    [supplyAccountPDA, supplyAccountBump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("supply")],
        program.programId
      );

    // Derive PDA for user account
    [userAccountPDA, userAccountBump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );
  });

  // it("initialize supply account", async () => {
  //   const amount = new anchor.BN(5_000_000_000); // Initial supply amount in lamports

  //   await program.methods
  //     .initializeSupply(amount)
  //     .accounts({
  //       supplyAccount: supplyAccountPDA,
  //       userAccount: userAccountPDA,
  //       user: wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([])
  //     .rpc();

  //   // Fetch the updated supply account
  //   let supplyAccount = await program.account.supplyAccount.fetch(
  //     supplyAccountPDA
  //   );

  //   // Fetch the updated user account
  //   let userAccount = await program.account.userAccount.fetch(userAccountPDA);

  //   console.log("supplyAccount", supplyAccount.totalBalance.toString());
  //   console.log("userAccount", userAccount.balance.toString());
  //   console.log("userAccount Transcations-->", userAccount.balance.toString());
  // });
  // it("deposit funds", async () => {
  //   const depositAmount = new anchor.BN(10_000_000); // Amount to deposit in lamports

  //   // Fetch initial wallet balance and account states
  //   const initialWalletBalance = await program.provider.connection.getBalance(
  //     wallet.publicKey
  //   );
  //   const supplyAccountBefore = await program.account.supplyAccount.fetch(
  //     supplyAccountPDA
  //   );
  //   const userAccountBefore = await program.account.userAccount.fetch(
  //     userAccountPDA
  //   );

  //   console.log("Initial Wallet Balance:", initialWalletBalance);
  //   console.log(
  //     "Supply Account Total Before:",
  //     supplyAccountBefore.totalBalance.toString()
  //   );
  //   console.log(
  //     "User Account Total Before:",
  //     userAccountBefore.balance.toString()
  //   );

  //   // Call the deposit function
  //   await program.methods
  //     .deposit(depositAmount)
  //     .accounts({
  //       supplyAccount: supplyAccountPDA,
  //       userAccount: userAccountPDA,
  //       user: wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId, // Include system program
  //     })
  //     .signers([])
  //     .rpc();

  //   // Fetch updated wallet balance and account states
  //   const finalWalletBalance = await program.provider.connection.getBalance(wallet.publicKey);
  //   const supplyAccountAfter = await program.account.supplyAccount.fetch(
  //     supplyAccountPDA
  //   );
  //   const userAccountAfter = await program.account.userAccount.fetch(
  //     userAccountPDA
  //   );

  //   console.log("Final Wallet Balance:", finalWalletBalance);
  //   console.log(
  //     "Supply Account Total After:",
  //     supplyAccountAfter.totalBalance.toString()
  //   );
  //   console.log(
  //     "User Account Total After:",
  //     userAccountAfter.balance.toString()
  //   );
  //   let lastTransaction =
  //     userAccountAfter.transactionHistory[
  //       userAccountAfter.transactionHistory.length - 1
  //     ];
  //   // const timestampInMilliseconds = lastTransaction.timestamp.toNumber() * 1000;
  //   // const date = new Date(timestampInMilliseconds);
  //   // const formattedDate = date.toLocaleString();

  //   //console.log("Formatted Timestamp:", formattedDate);

  //   console.log(
  //     "User Account Last Transaction",
  //     `Txn Type: ${Object.keys(lastTransaction.txnType)[0].toUpperCase()} --`,
  //     `Amount: ${lastTransaction.amount.toString()} -- `,
  //     `Timestamp: ${lastTransaction.timestamp.toNumber()}`
  //   );
  // });
  // it("withdraw funds", async () => {
  //   const withdrawAmount = new anchor.BN(10_000_000); // Amount to withdraw in lamports

  //   // Fetch initial wallet balance and account states
  //   const initialWalletBalance = await program.provider.connection.getBalance(
  //     wallet.publicKey
  //   );
  //   const supplyAccountBefore = await program.account.supplyAccount.fetch(
  //     supplyAccountPDA
  //   );
  //   const userAccountBefore = await program.account.userAccount.fetch(
  //     userAccountPDA
  //   );

  //   console.log("Initial Wallet Balance:", initialWalletBalance);
  //   console.log(
  //     "Supply Account Total Before:",
  //     supplyAccountBefore.totalBalance.toString()
  //   );
  //   console.log(
  //     "User Account Total Before:",
  //     userAccountBefore.balance.toString()
  //   );

  //   // Call the withdraw function
  //   await program.methods
  //     .withdraw(withdrawAmount)
  //     .accounts({
  //       supplyAccount: supplyAccountPDA,
  //       userAccount: userAccountPDA,
  //       user: wallet.publicKey,
  //     })
  //     .signers([])
  //     .rpc();

  //   // Fetch updated wallet balance and account states
  //   const finalWalletBalance = await program.provider.connection.getBalance(wallet.publicKey);
  //   const supplyAccountAfter = await program.account.supplyAccount.fetch(
  //     supplyAccountPDA
  //   );
  //   const userAccountAfter = await program.account.userAccount.fetch(
  //     userAccountPDA
  //   );

  //   console.log("Final Wallet Balance:", finalWalletBalance);
  //   console.log(
  //     "Supply Account Total After:",
  //     supplyAccountAfter.totalBalance.toString()
  //   );
  //   console.log(
  //     "User Account Total After:",
  //     userAccountAfter.balance.toString()
  //   );

  //   // Fetch the last transaction details
  //   let lastTransaction =
  //     userAccountAfter.transactionHistory[
  //       userAccountAfter.transactionHistory.length - 1
  //     ];

  //   // Convert timestamp to readable date format
  //   // const timestampInMilliseconds = lastTransaction.timestamp.toNumber() * 1000;
  //   // const date = new Date(timestampInMilliseconds);
  //   // const formattedDate = date.toLocaleString();

  //   console.log(
  //     "User Account Last Transaction",
  //     `Txn Type: ${Object.keys(lastTransaction.txnType)[0].toUpperCase()} --`,
  //     `Amount: ${lastTransaction.amount.toString()} -- `,
  //     `Timestamp: ${lastTransaction.timestamp.toNumber()}`
  //   );
  // });
  // it("initiate loan account", async () => {
  //   let [loanAccountPDA, bump] =
  //     await anchor.web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("loan"), wallet.publicKey.toBuffer()],
  //       program.programId
  //     );

  //   await program.methods
  //     .initializeLoanAccount()
  //     .accounts({
  //       loanAccount: loanAccountPDA,
  //       user: wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([])
  //     .rpc();

  //   console.log("Loan Account Initialized:", loanAccountPDA.toString());
  // });
  it("request loan with end time", async () => {
    const loanAmount = new anchor.BN(5_000_000);
    const interestRate = new anchor.BN(5);
    const loanTerm = new anchor.BN(15 * 24 * 60 * 60);

    // Derive the loan account PDA
    let [loanAccountPDA, loanBump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("loan"), wallet.publicKey.toBuffer()],
        program.programId
      );

    // Fetch initial states
    const supplyAccountBefore = await program.account.supplyAccount.fetch(
      supplyAccountPDA
    );
    const loanAccountBefore = await program.account.loanAccount.fetch(
      loanAccountPDA
    );
    const initialWalletBalance = await program.provider.connection.getBalance(
      wallet.publicKey
    );

    console.log("Initial Wallet Balance:", initialWalletBalance);
    console.log(
      "Supply Account Total Before:",
      supplyAccountBefore.totalBalance.toString()
    );
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

    // Call the `requestLoan` function
    await program.methods
      .requestLoan(loanAmount, interestRate, loanTerm)
      .accounts({
        supplyAccount: supplyAccountPDA,
        loanAccount: loanAccountPDA,
        userAccount: userAccountPDA,
        user: wallet.publicKey,
      })
      .signers([])
      .rpc();

    // Fetch updated states
    const supplyAccountAfter = await program.account.supplyAccount.fetch(
      supplyAccountPDA
    );
    const loanAccountAfter = await program.account.loanAccount.fetch(
      loanAccountPDA
    );
    const finalWalletBalance = await program.provider.connection.getBalance(wallet.publicKey);

    console.log("Final Wallet Balance:", finalWalletBalance);
    console.log(
      "Supply Account Total After:",
      supplyAccountAfter.totalBalance.toString()
    );
    console.log(
      "Loan Account State After:",
      JSON.stringify({
        loanAmount: loanAccountAfter.loanAmount.toString(),
        interestRate: loanAccountAfter.interestRate.toString(),
        startTime: loanAccountAfter.startTime.toString(),
        endTime: loanAccountAfter.endTime.toString(),
        repaid: loanAccountAfter.repaid,
      })
    );
  });
  // it("repay loan", async () => {
  //   const repaymentAmount = new anchor.BN(5_250_000);

  //   // Derive the loan account PDA
  //   let [loanAccountPDA, loanBump] =
  //     await anchor.web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("loan"), wallet.publicKey.toBuffer()],
  //       program.programId
  //     );

  //   // Derive the supply account PDA
  //   let [supplyAccountPDA, supplyBump] =
  //     await anchor.web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("supply")],
  //       program.programId
  //     );

  //   // Fetch initial states
  //   const loanAccountBefore = await program.account.loanAccount.fetch(
  //     loanAccountPDA
  //   );
  //   const supplyAccountBefore = await program.account.supplyAccount.fetch(
  //     supplyAccountPDA
  //   );
  //   const initialWalletBalance = await program.provider.connection.getBalance(
  //     wallet.publicKey
  //   );

  //   console.log("Initial Wallet Balance:", initialWalletBalance);
  //   console.log(
  //     "Supply Account Total Before:",
  //     supplyAccountBefore.totalBalance.toString()
  //   );
  //   console.log(
  //     "Loan Account State Before:",
  //     JSON.stringify({
  //       loanAmount: loanAccountBefore.loanAmount.toString(),
  //       interestRate: loanAccountBefore.interestRate.toString(),
  //       startTime: loanAccountBefore.startTime.toString(),
  //       endTime: loanAccountBefore.endTime.toString(),
  //       repaid: loanAccountBefore.repaid,
  //     })
  //   );
  //   const totalRepaymentDue =
  //     loanAccountBefore.loanAmount.toNumber() +
  //     (loanAccountBefore.loanAmount.toNumber() *
  //       loanAccountBefore.interestRate.toNumber()) /
  //       100;
  //   console.log("totalRepaymentDue-->", totalRepaymentDue);

  //   // Call the `repayLoan` function
  //   await program.methods
  //     .repayLoan(repaymentAmount)
  //     .accounts({
  //       supplyAccount: supplyAccountPDA,
  //       loanAccount: loanAccountPDA,
  //       userAccount: userAccountPDA, // Include userAccount PDA
  //       user: wallet.publicKey,
  //     })
  //     .signers([])
  //     .rpc();

  //   // Fetch updated states
  //   const loanAccountAfter = await program.account.loanAccount.fetch(
  //     loanAccountPDA
  //   );
  //   const supplyAccountAfter = await program.account.supplyAccount.fetch(
  //     supplyAccountPDA
  //   );
  //   const finalWalletBalance = await program.provider.connection.getBalance(wallet.publicKey);

  //   console.log("Final Wallet Balance:", finalWalletBalance);
  //   console.log(
  //     "Supply Account Total After:",
  //     supplyAccountAfter.totalBalance.toString()
  //   );
  //   console.log(
  //     "Loan Account State After:",
  //     JSON.stringify({
  //       loanAmount: loanAccountAfter.loanAmount.toString(),
  //       interestRate: loanAccountAfter.interestRate.toString(),
  //       startTime: loanAccountAfter.startTime.toString(),
  //       endTime: loanAccountAfter.endTime.toString(),
  //       repaid: loanAccountAfter.repaid,
  //     })
  //   );

  //   // Calculate total repayment due (principal + interest)
  // });
});
