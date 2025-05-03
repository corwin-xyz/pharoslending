// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendBorrowWithERC20Collateral is Ownable {
    IERC20 public dummyETH;
    IERC20 public usdc;

    uint256 public constant INTEREST_RATE = 5;     // 5%
    uint256 public constant USDC_DECIMALS = 1e18;   // USDC has 6 decimals

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
        
    }

    // 3. Deposit dummy ETH as collateral and borrow USDC
    function deposit(uint256 collateralAmount) external {
    require(collateralAmount > 0, "Invalid collateral");

    // Mengakses data pinjaman pengguna di storage
    Loan storage userLoan = loans[msg.sender];

    // Jika pinjaman belum ada, buat pinjaman baru
    if (!userLoan.active) {
        // Transfer dummyETH sebagai jaminan
        require(dummyETH.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        // Menetapkan jumlah collateral untuk pinjaman pertama
        userLoan.collateralAmount = collateralAmount;

        // Menghitung jumlah USDC yang dapat dipinjam
        userLoan.active = true;

        
    } else {
        // Jika pinjaman sudah ada, menambah collateral pada pinjaman yang ada
        require(dummyETH.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        // Menambah collateral untuk pinjaman yang sudah ada
        userLoan.collateralAmount += collateralAmount;

        // Menghitung jumlah tambahan USDC yang dapat dipinjam berdasarkan collateral yang baru
        
    }
}

function borrow() external {
Loan storage userLoan = loans[msg.sender];

uint256 collateralAmount = userLoan.collateralAmount;
    if (!userLoan.active) {
uint256 amount = (collateralAmount * 2000) * 70 / 100;

        // Memastikan bahwa kontrak memiliki cukup USDC untuk diberikan ke pengguna
        require(usdc.balanceOf(address(this)) >= amount, "Not enough USDC in pool");

        // Membuat pinjaman dan menandai pinjaman aktif
        userLoan.borrowedAmount = amount;
        // Mentransfer USDC ke pengguna
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");
    } else {
uint256 amount = (collateralAmount * 2000) * 70 / 100;

        // Memastikan bahwa kontrak memiliki cukup USDC untuk diberikan ke pengguna
        require(usdc.balanceOf(address(this)) >= amount, "Not enough USDC in pool");

        // Menambahkan jumlah pinjaman yang baru
        userLoan.borrowedAmount += amount;

        // Mentransfer tambahan USDC ke pengguna
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");
    }
    
}


    // 4. Repay loan and get back collateral
    function repayLoan() external {
    Loan storage loan = loans[msg.sender];
    require(loan.active, "No active loan");

    // Menghitung jumlah yang harus dibayar (pinjaman + bunga)
    uint256 repayment = loan.borrowedAmount + ((loan.borrowedAmount * INTEREST_RATE) / 100);
    
    // Memastikan pengguna memiliki cukup saldo untuk membayar
    require(usdc.transferFrom(msg.sender, address(this), repayment), "Repayment failed");

    // Mengambil jumlah collateral yang ditransfer kembali ke pengguna
    uint256 collateral = loan.collateralAmount;

    // Menghapus pinjaman dari mapping
    delete loans[msg.sender];

    // Mengembalikan collateral ke pengguna
    require(dummyETH.transfer(msg.sender, collateral), "Return collateral failed");
}


    // 5. Admin can withdraw tokens (emergency)
    function adminWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}
