// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendBorrowWithERC20Collateral is Ownable {
    IERC20 public dummyETH;
    IERC20 public usdc;

    uint256 public constant COLLATERAL_RATIO = 70; // 70%
    uint256 public constant INTEREST_RATE = 5;     // 5%
    uint256 public constant USDC_DECIMALS = 1e6;   // USDC has 6 decimals

    struct Loan {
        uint256 collateralAmount;
        uint256 borrowedAmount;
        bool active;
    }

    mapping(address => Loan) public loans;
    mapping(address => uint256) public lendersBalance;

    constructor(
        address _dummyETH,
        address _usdc,
        address _initialOwner
    ) Ownable(_initialOwner) {
        dummyETH = IERC20(_dummyETH);
        usdc = IERC20(_usdc);
    }

    // 1. Lend USDC
    function lend(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        lendersBalance[msg.sender] += amount;
    }

    // 2. Withdraw lent USDC (only if not used)
    function withdrawLend(uint256 amount) external {
        require(lendersBalance[msg.sender] >= amount, "Insufficient balance");

        lendersBalance[msg.sender] -= amount;
        require(usdc.transfer(msg.sender, amount), "Withdraw failed");
    }

    // 3. Deposit dummy ETH as collateral and borrow USDC
    function depositAndBorrow(uint256 collateralAmount) external {
        require(collateralAmount > 0, "Invalid collateral");
        require(!loans[msg.sender].active, "Loan exists");

        require(dummyETH.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        uint256 usdcAmount = (collateralAmount * COLLATERAL_RATIO) / 100;

        require(usdc.balanceOf(address(this)) >= usdcAmount, "Not enough USDC in pool");

        loans[msg.sender] = Loan({
            collateralAmount: collateralAmount,
            borrowedAmount: usdcAmount,
            active: true
        });

        require(usdc.transfer(msg.sender, usdcAmount), "USDC transfer failed");
    }

    // 4. Repay loan and get back collateral
    function repayLoan() external {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "No active loan");

        uint256 repayment = loan.borrowedAmount + ((loan.borrowedAmount * INTEREST_RATE) / 100);
        require(usdc.transferFrom(msg.sender, address(this), repayment), "Repayment failed");

        uint256 collateral = loan.collateralAmount;
        delete loans[msg.sender];

        require(dummyETH.transfer(msg.sender, collateral), "Return collateral failed");
    }

    // 5. Admin can withdraw tokens (emergency)
    function adminWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}
