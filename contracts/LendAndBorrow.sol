// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendBorrowWithERC20Collateral is Ownable {
    IERC20 public dummyETH;
    IERC20 public usdc;

    uint256 public constant INTEREST_RATE = 5;     // 5%
    uint256 public constant USDC_DECIMALS = 1e18;   // USDC has 18 decimals

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

   
    function lend(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        lendersBalance[msg.sender] += amount;
    }

    function withdrawLend(uint256 amount) external {
        require(lendersBalance[msg.sender] >= amount, "Insufficient balance");

        require(usdc.transfer(msg.sender, amount), "Transfer failed");
        lendersBalance[msg.sender] -= amount;
        
    }


    function deposit(uint256 collateralAmount) external {
    require(collateralAmount > 0, "Invalid collateral");

    Loan storage userLoan = loans[msg.sender];


    if (!userLoan.active) {
        
        require(dummyETH.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        
        userLoan.collateralAmount = collateralAmount;

        userLoan.active = true;

        
    } else {

        require(dummyETH.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");
       
        userLoan.collateralAmount += collateralAmount;

        
    }
}

function borrow(uint256 amount) external {
    Loan storage userLoan = loans[msg.sender];
    uint256 collateralAmount = userLoan.collateralAmount;

    require(collateralAmount > 0, "No collateral deposited");
    require(usdc.balanceOf(address(this)) >= amount, "Not enough USDC in pool");

    if (!userLoan.active) {
        userLoan.borrowedAmount = amount;
        userLoan.active = true;
    } else {
        userLoan.borrowedAmount += amount;
    }

    require(usdc.transfer(msg.sender, amount), "USDC transfer failed");
}


    function repayLoan() external {
    Loan storage loan = loans[msg.sender];
    require(loan.active, "No active loan");
    require(loan.borrowedAmount > 0, "Nothing to repay");

    uint256 repayment = loan.borrowedAmount;

    require(usdc.transferFrom(msg.sender, address(this), repayment), "Repayment failed");

    uint256 collateral = loan.collateralAmount;

    delete loans[msg.sender];

    require(dummyETH.transfer(msg.sender, collateral), "Return collateral failed");
}

}
