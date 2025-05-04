
# Pharos Lending Platform Smart Contracts

This repository contains the smart contracts for the Pharos Lending Platform, a decentralized lending protocol built on the Pharos blockchain.

## Overview

The Pharos Lending Platform allows users to:

- Deposit USDP stablecoins to earn interest
- Borrow USDP against PHAR collateral
- Build credit scores through platform interactions
- Earn additional yield through collateral restaking

## Contract Architecture

The platform consists of the following core contracts:

- **PharosToken (PHAR)**: Native token of the ecosystem
- **USDPToken (USDP)**: Stablecoin used for lending and borrowing
- **CreditScoring**: Manages user credit scores based on platform interactions
- **RestakingIntegration**: Handles staking of collateral for additional yield
- **PharosLending**: Main contract managing deposits, loans, and repayments

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- Hardhat
- Wagmi + RainbowKit

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and populate it with your credentials:
   ```
   cp .env.example .env
   ```

### Compilation Smart Contract

Compile the smart contracts:

```
npx hardhat compile
```

### Testing

Run the test suite:

```
npx hardhat test
```

### Running Project

```
npm run dev
```

### Deployment

To deploy to Pharos Testnet:

1. Ensure your `.env` file is properly configured with your private key and RPC URL
2. Run the deployment script:
   ```
   npx hardhat run deploy/deploy.js --network pharosTestnet
   ```
3. The deployed contract addresses will be saved to `deployed-addresses.json`

## Smart Contract Details

### PharosToken (PHAR)

ERC20 token representing the native token of the Pharos ecosystem.

### USDPToken (USDC)

ERC20 stablecoin used for lending and borrowing within the platform.

### CreditScoring

Calculates and manages user credit scores based on:
- Platform interaction count
- PTT token holdings
- Repayment history
- Actifity On Chain

### RestakingIntegration

Manages the staking of collateral to generate additional yield.

### PharosLending

Main contract that handles:
- USDC deposits and withdrawals
- Borrowing USDC against wBTC/ETH collateral
- Loan repayments
- Interest accrual for both lenders and borrowers

## Security Considerations

These contracts implement several security features:
- ReentrancyGuard to prevent reentrancy attacks
- Pausable functionality for emergency scenarios
- Input validation and require statements
- SafeERC20 for safe token transfers
