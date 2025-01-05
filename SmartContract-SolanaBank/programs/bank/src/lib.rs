use anchor_lang::prelude::*;

declare_id!("56dC8eKg1qFVtQcncKWm8cH9kH9wiQijBwDvPY1ceqXm");

#[program]
pub mod bank {
    use super::*;

    pub fn initialize_supply(ctx: Context<InitializeSupply>, amount: u64) -> Result<()> {
        let supply_account = &mut ctx.accounts.supply_account;
        let user_account = &mut ctx.accounts.user_account;
        let system_program = &ctx.accounts.system_program;

        supply_account.total_balance = amount;

        if user_account.to_account_info().data_is_empty() {
            user_account.balance = 0;
            user_account.transaction_history = Vec::new();
        }

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        msg!("Starting deposit process...");
        msg!("Deposit amount: {}", amount);
        msg!("User wallet: {}", ctx.accounts.user.key());
        msg!("Supply account: {}", ctx.accounts.supply_account.key());

        let supply_account_info = ctx.accounts.supply_account.to_account_info();
        let user_account_info = ctx.accounts.user.to_account_info();
        let system_program_info = ctx.accounts.system_program.to_account_info();

        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.supply_account.key(),
            amount,
        );

        msg!("Executing transfer instruction...");
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                user_account_info,
                supply_account_info.clone(),
                system_program_info,
            ],
        )?;
        msg!("Transfer instruction executed successfully.");

        let supply_account = &mut ctx.accounts.supply_account;
        let user_account = &mut ctx.accounts.user_account;

        msg!("Updating account balances...");
        supply_account.total_balance += amount;
        user_account.balance += amount;

        let transaction = Transaction {
            txn_type: TransactionType::Deposit,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        };
        user_account.transaction_history.push(transaction.clone());

        msg!("Transaction added: {:?}", transaction);
        msg!(
            "Updated transaction history: {:?}",
            user_account.transaction_history
        );

        msg!(
            "Deposit completed. Updated balances - Supply total: {}, User balance: {}",
            supply_account.total_balance,
            user_account.balance
        );

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        msg!("Starting withdraw process...");
        msg!("Withdraw amount: {}", amount);
        msg!("User wallet: {}", ctx.accounts.user.key());
        msg!("Supply account: {}", ctx.accounts.supply_account.key());

        let supply_account_info = ctx.accounts.supply_account.to_account_info();
        let user_wallet = ctx.accounts.user.to_account_info();

        let supply_account = &mut ctx.accounts.supply_account;
        let user_account = &mut ctx.accounts.user_account;

        require!(user_account.balance >= amount, ErrorCode::InsufficientFunds);

        msg!("Executing withdrawal transfer...");
        **supply_account_info.try_borrow_mut_lamports()? -= amount;
        **user_wallet.try_borrow_mut_lamports()? += amount;

        supply_account.total_balance -= amount;
        user_account.balance -= amount;

        let transaction = Transaction {
            txn_type: TransactionType::Withdraw,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        };
        user_account.transaction_history.push(transaction.clone());

        msg!("Transaction added: {:?}", transaction);
        msg!(
            "Updated transaction history: {:?}",
            user_account.transaction_history
        );

        msg!(
            "Withdraw completed. Updated balances - Supply total: {}, User balance: {}",
            supply_account.total_balance,
            user_account.balance
        );

        Ok(())
    }

    pub fn initialize_loan_account(ctx: Context<InitializeLoanAccount>) -> Result<()> {
        let loan_account = &mut ctx.accounts.loan_account;

        loan_account.borrower = ctx.accounts.user.key();
        loan_account.loan_amount = 0;
        loan_account.interest_rate = 0;
        loan_account.start_time = 0;
        loan_account.repaid = true;

        msg!(
            "Loan account initialized successfully for user: {}",
            ctx.accounts.user.key()
        );
        Ok(())
    }

    pub fn request_loan(
        ctx: Context<RequestLoan>,
        amount: u64,
        interest_rate: u64,
        loan_term: i64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidLoanAmount);
        require!(
            ctx.accounts.supply_account.total_balance >= amount,
            ErrorCode::InsufficientFunds
        );
        let user_account = &mut ctx.accounts.user_account;

        let supply_account_info = ctx.accounts.supply_account.to_account_info();
        let user_wallet_info = ctx.accounts.user.to_account_info();

        **supply_account_info.try_borrow_mut_lamports()? -= amount;
        **user_wallet_info.try_borrow_mut_lamports()? += amount;

        let loan_account = &mut ctx.accounts.loan_account;
        loan_account.loan_amount = amount;
        loan_account.interest_rate = interest_rate;
        loan_account.start_time = Clock::get()?.unix_timestamp;
        loan_account.end_time = loan_account.start_time + loan_term;

        loan_account.repaid = false;

        let supply_account = &mut ctx.accounts.supply_account;
        supply_account.total_balance -= amount;

        user_account.has_loan_account = true;

        msg!(
            "Loan requested successfully. Amount: {}, Interest Rate: {}, End Time: {}",
            amount,
            interest_rate,
            loan_account.end_time
        );

        Ok(())
    }

    pub fn repay_loan(ctx: Context<RepayLoan>, repayment_amount: u64) -> Result<()> {
        require!(repayment_amount > 0, ErrorCode::InvalidRepaymentAmount);

        let loan_account = &mut ctx.accounts.loan_account;
        require!(!loan_account.repaid, ErrorCode::LoanAlreadyRepaid);

        let total_repayment_due = loan_account.loan_amount
            + ((loan_account.loan_amount * loan_account.interest_rate) / 100);
        require!(
            repayment_amount >= total_repayment_due,
            ErrorCode::InvalidRepaymentAmount
        );

        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.supply_account.key(),
            repayment_amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.supply_account.to_account_info(),
            ],
        )?;

        loan_account.repaid = true;

        let user_account = &mut ctx.accounts.user_account;
        user_account.has_loan_account = false;

        let supply_account = &mut ctx.accounts.supply_account;
        supply_account.total_balance += repayment_amount;

        msg!(
            "Loan repaid successfully. Repaid status: {}. Amount: {}, Total Due: {}, Remaining Balance in Bank Vault: {}",
            loan_account.repaid,
            repayment_amount,
            total_repayment_due,
            supply_account.total_balance
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeSupply<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 8,
        seeds = [b"supply"],
        bump
    )]
    pub supply_account: Account<'info, SupplyAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 8 + 4 + (100 * (8 + 8)),
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut, seeds = [b"supply"], bump)]
    pub supply_account: Account<'info, SupplyAccount>,

    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"supply"], bump)]
    pub supply_account: Account<'info, SupplyAccount>,

    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct SupplyAccount {
    pub total_balance: u64,
}

#[account]
pub struct UserAccount {
    pub balance: u64,
    pub transaction_history: Vec<Transaction>,
    pub has_loan_account: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Transaction {
    pub txn_type: TransactionType,
    pub amount: u64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum TransactionType {
    Deposit,
    Withdraw,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds.")]
    InsufficientFunds,

    #[msg("User already has an active loan.")]
    ActiveLoanExists,

    #[msg("Invalid loan amount.")]
    InvalidLoanAmount,

    #[msg("The loan has already been repaid.")]
    LoanAlreadyRepaid,

    #[msg("The repayment amount is invalid.")]
    InvalidRepaymentAmount,
}

//For Loan Accounts
#[account]
pub struct LoanAccount {
    pub borrower: Pubkey,
    pub loan_amount: u64,
    pub interest_rate: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub repaid: bool,
}

impl LoanAccount {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 32;
}

#[derive(Accounts)]
pub struct InitializeLoanAccount<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = LoanAccount::LEN,
        seeds = [b"loan", user.key().as_ref()],
        bump
    )]
    pub loan_account: Account<'info, LoanAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestLoan<'info> {
    #[account(mut, seeds = [b"supply"], bump)]
    pub supply_account: Account<'info, SupplyAccount>,

    #[account(mut, seeds = [b"loan", user.key().as_ref()], bump)]
    pub loan_account: Account<'info, LoanAccount>,

    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RepayLoan<'info> {
    #[account(mut, seeds = [b"supply"], bump)]
    pub supply_account: Account<'info, SupplyAccount>,

    #[account(mut, seeds = [b"loan", user.key().as_ref()], bump)]
    pub loan_account: Account<'info, LoanAccount>,

    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
