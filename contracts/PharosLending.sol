
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreditScoring.sol";   
import "./RestakingIntegration.sol";

/**
 * @title PharosLending
 * @dev Main contract for the Pharos lending platform
 */
contract PharosLending is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public usdpToken;
    IERC20 public pharToken;
    CreditScoring public creditScoring;
    RestakingIntegration public restaking;
    
    // Constants
    uint256 public constant LENDING_APY = 5; // 5% APY for lenders
    uint256 public constant BORROWING_APY = 8; // 8% APY for borrowers
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant BASIS_POINTS = 10000; // For percentage calculations (100% = 10000)
    
    // Protocol state
    uint256 public totalDeposited; // Total USDP in lending pool
    uint256 public totalBorrowed; // Total USDP borrowed
    uint256 public totalCollateral; // Total PHAR collateral provided
    
    // User data
    struct UserLending {
        uint256 deposited; // USDP deposited by user
        uint256 interestAccrued; // USDP interest earned but not claimed
        uint256 lastUpdateTimestamp; // Last time interest was calculated
    }
    
    struct UserBorrowing {
        uint256 borrowed; // USDP borrowed by user
        uint256 collateral; // PHAR provided as collateral
        uint256 interestAccrued; // USDP interest owed but not paid
        uint256 lastUpdateTimestamp; // Last time interest was calculated
        bool active; // Whether loan is active
    }
    
    mapping(address => UserLending) public userLending;
    mapping(address => UserBorrowing) public userBorrowing;
    
    // Events
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount, uint256 collateral);
    event Repaid(address indexed user, uint256 amount);
    event CollateralReturned(address indexed user, uint256 amount);
    event InterestClaimed(address indexed user, uint256 amount);
    
    constructor(
        address initialOwner,
        address _usdpToken, 
        address _pharToken, 
        address _creditScoring, 
        address _restaking
    ) Ownable(initialOwner) {
        usdpToken = IERC20(_usdpToken);
        pharToken = IERC20(_pharToken);
        creditScoring = CreditScoring(_creditScoring);
        restaking = RestakingIntegration(_restaking);
    }
    
    /**
     * @dev Deposit USDP into the lending pool
     * @param amount Amount of USDP to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot deposit zero amount");
        
        // Update user's interest before changing their balance
        _updateLendingInterest(msg.sender);
        
        // Record interaction for credit score
        creditScoring.recordInteraction(msg.sender);
        
        // Transfer USDP from user to contract
        usdpToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user's lending data
        userLending[msg.sender].deposited += amount;
        userLending[msg.sender].lastUpdateTimestamp = block.timestamp;
        
        // Update protocol state
        totalDeposited += amount;
        
        emit Deposited(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw USDP from the lending pool
     * @param amount Amount of USDP to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw zero amount");
        
        // Update user's interest before changing their balance
        _updateLendingInterest(msg.sender);
        
        require(userLending[msg.sender].deposited >= amount, "Insufficient deposited balance");
        
        // Check if protocol has enough liquidity
        uint256 availableLiquidity = usdpToken.balanceOf(address(this));
        require(availableLiquidity >= amount, "Insufficient protocol liquidity");
        
        // Record interaction for credit score
        creditScoring.recordInteraction(msg.sender);
        
        // Update user's lending data
        userLending[msg.sender].deposited -= amount;
        userLending[msg.sender].lastUpdateTimestamp = block.timestamp;
        
        // Update protocol state
        totalDeposited -= amount;
        
        // Transfer USDP to user
        usdpToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Claim accrued lending interest
     */
    function claimInterest() external nonReentrant {
        // Update user's interest
        _updateLendingInterest(msg.sender);
        
        uint256 interestAmount = userLending[msg.sender].interestAccrued;
        require(interestAmount > 0, "No interest to claim");
        
        // Reset user's accrued interest
        userLending[msg.sender].interestAccrued = 0;
        
        // Record interaction for credit score
        creditScoring.recordInteraction(msg.sender);
        
        // Transfer USDP to user (from protocol reserves)
        usdpToken.safeTransfer(msg.sender, interestAmount);
        
        emit InterestClaimed(msg.sender, interestAmount);
    }
    
    /**
     * @dev Borrow USDP against PHAR collateral
     * @param borrowAmount Amount of USDP to borrow
     * @param collateralAmount Amount of PHAR to provide as collateral
     */
    function borrow(uint256 borrowAmount, uint256 collateralAmount) external nonReentrant whenNotPaused {
        require(borrowAmount > 0, "Cannot borrow zero amount");
        require(collateralAmount > 0, "Cannot provide zero collateral");
        require(!userBorrowing[msg.sender].active, "Active loan already exists");
        
        // Check if protocol has enough liquidity
        uint256 availableLiquidity = usdpToken.balanceOf(address(this));
        require(availableLiquidity >= borrowAmount, "Insufficient protocol liquidity");
        
        // Get user's required collateral ratio
        uint256 collateralRatio = creditScoring.getCollateralRatio(msg.sender);
        
        // Calculate minimum required collateral
        // Convert collateral to USDP equivalent assuming 1 PHAR = 10 USDP (simplified)
        uint256 collateralValueInUsdp = (collateralAmount * 10);
        uint256 minCollateralRequired = (borrowAmount * collateralRatio) / 100;
        
        require(
            collateralValueInUsdp >= minCollateralRequired,
            "Insufficient collateral for requested loan"
        );
        
        // Record interaction for credit score
        creditScoring.recordInteraction(msg.sender);
        
        // Transfer PHAR collateral from user to contract
        pharToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
        
        // Stake collateral into restaking contract for yield generation
        pharToken.approve(address(restaking), collateralAmount);
        restaking.stake(collateralAmount);
        
        // Update user's borrowing data
        userBorrowing[msg.sender] = UserBorrowing({
            borrowed: borrowAmount,
            collateral: collateralAmount,
            interestAccrued: 0,
            lastUpdateTimestamp: block.timestamp,
            active: true
        });
        
        // Update protocol state
        totalBorrowed += borrowAmount;
        totalCollateral += collateralAmount;
        
        // Transfer USDP to user
        usdpToken.safeTransfer(msg.sender, borrowAmount);
        
        emit Borrowed(msg.sender, borrowAmount, collateralAmount);
    }
    
    /**
     * @dev Repay USDP loan (partial or full)
     * @param repayAmount Amount of USDP to repay
     */
    function repay(uint256 repayAmount) external nonReentrant {
        require(repayAmount > 0, "Cannot repay zero amount");
        require(userBorrowing[msg.sender].active, "No active loan to repay");
        
        // Calculate the total amount owed (principal + interest)
        _updateBorrowingInterest(msg.sender);
        uint256 totalOwed = userBorrowing[msg.sender].borrowed + userBorrowing[msg.sender].interestAccrued;
        
        // Ensure repayment doesn't exceed total owed
        uint256 actualRepayAmount = repayAmount > totalOwed ? totalOwed : repayAmount;
        
        // Record interaction for credit score and update repayment history
        creditScoring.recordInteraction(msg.sender);
        creditScoring.updateRepaymentHistory(msg.sender, true);
        
        // Transfer USDP from user to contract
        usdpToken.safeTransferFrom(msg.sender, address(this), actualRepayAmount);
        
        // Calculate how much of the repayment goes to interest vs principal
        uint256 interestPayment = (actualRepayAmount < userBorrowing[msg.sender].interestAccrued) 
            ? actualRepayAmount 
            : userBorrowing[msg.sender].interestAccrued;
        
        uint256 principalPayment = actualRepayAmount - interestPayment;
        
        // Update user's borrowing data
        userBorrowing[msg.sender].interestAccrued -= interestPayment;
        userBorrowing[msg.sender].borrowed -= principalPayment;
        userBorrowing[msg.sender].lastUpdateTimestamp = block.timestamp;
        
        // Update protocol state
        totalBorrowed -= principalPayment;
        
        // If loan is fully repaid, return collateral
        if (userBorrowing[msg.sender].borrowed == 0) {
            _returnCollateral(msg.sender);
            userBorrowing[msg.sender].active = false;
        }
        
        emit Repaid(msg.sender, actualRepayAmount);
    }
    
    /**
     * @dev Add more collateral to an existing loan
     * @param additionalCollateral Amount of PHAR to add as collateral
     */
    function addCollateral(uint256 additionalCollateral) external nonReentrant whenNotPaused {
        require(additionalCollateral > 0, "Cannot add zero collateral");
        require(userBorrowing[msg.sender].active, "No active loan");
        
        // Record interaction for credit score
        creditScoring.recordInteraction(msg.sender);
        
        // Transfer PHAR collateral from user to contract
        pharToken.safeTransferFrom(msg.sender, address(this), additionalCollateral);
        
        // Stake additional collateral
        pharToken.approve(address(restaking), additionalCollateral);
        restaking.stake(additionalCollateral);
        
        // Update user's borrowing data
        userBorrowing[msg.sender].collateral += additionalCollateral;
        
        // Update protocol state
        totalCollateral += additionalCollateral;
        
        emit Borrowed(msg.sender, 0, additionalCollateral); // Using Borrowed event with 0 borrow amount
    }
    
    /**
     * @dev Return collateral to a user when loan is fully repaid
     * @param user Address of the user
     */
    function _returnCollateral(address user) internal {
        uint256 collateralAmount = userBorrowing[user].collateral;
        
        if (collateralAmount > 0) {
            // Unstake collateral from restaking contract
            restaking.unstake(collateralAmount);
            
            // Update user's borrowing data
            userBorrowing[user].collateral = 0;
            
            // Update protocol state
            totalCollateral -= collateralAmount;
            
            // Transfer PHAR back to user
            pharToken.safeTransfer(user, collateralAmount);
            
            emit CollateralReturned(user, collateralAmount);
        }
    }
    
    /**
     * @dev Update lending interest for a user
     * @param user Address of the user
     */
    function _updateLendingInterest(address user) internal {
        UserLending storage lending = userLending[user];
        
        if (lending.deposited > 0 && lending.lastUpdateTimestamp > 0) {
            uint256 timeElapsed = block.timestamp - lending.lastUpdateTimestamp;
            if (timeElapsed > 0) {
                uint256 interest = (lending.deposited * LENDING_APY * timeElapsed) / (SECONDS_PER_YEAR * 100);
                lending.interestAccrued += interest;
                lending.lastUpdateTimestamp = block.timestamp;
            }
        }
    }
    
    /**
     * @dev Update borrowing interest for a user
     * @param user Address of the user
     */
    function _updateBorrowingInterest(address user) internal {
        UserBorrowing storage borrowing = userBorrowing[user];
        
        if (borrowing.active && borrowing.lastUpdateTimestamp > 0) {
            uint256 timeElapsed = block.timestamp - borrowing.lastUpdateTimestamp;
            if (timeElapsed > 0) {
                uint256 interest = (borrowing.borrowed * BORROWING_APY * timeElapsed) / (SECONDS_PER_YEAR * 100);
                borrowing.interestAccrued += interest;
                borrowing.lastUpdateTimestamp = block.timestamp;
            }
        }
    }
    
    /**
     * @dev Get total amount owed by a borrower
     * @param user Address of the user
     * @return totalOwed Total amount owed (principal + interest)
     */
    function getTotalOwed(address user) external view returns (uint256 totalOwed) {
        UserBorrowing storage borrowing = userBorrowing[user];
        
        // Start with current tracked amounts
        totalOwed = borrowing.borrowed + borrowing.interestAccrued;
        
        // Add untracked interest since last update
        if (borrowing.active && borrowing.lastUpdateTimestamp > 0) {
            uint256 timeElapsed = block.timestamp - borrowing.lastUpdateTimestamp;
            if (timeElapsed > 0) {
                uint256 additionalInterest = (borrowing.borrowed * BORROWING_APY * timeElapsed) / (SECONDS_PER_YEAR * 100);
                totalOwed += additionalInterest;
            }
        }
        
        return totalOwed;
    }
    
    /**
     * @dev Get total owed interest by a borrower
     * @param user Address of the user
     * @return totalInterest Total interest owed
     */
    function getTotalInterestOwed(address user) external view returns (uint256 totalInterest) {
        UserBorrowing storage borrowing = userBorrowing[user];
        
        // Start with current tracked interest
        totalInterest = borrowing.interestAccrued;
        
        // Add untracked interest since last update
        if (borrowing.active && borrowing.lastUpdateTimestamp > 0) {
            uint256 timeElapsed = block.timestamp - borrowing.lastUpdateTimestamp;
            if (timeElapsed > 0) {
                uint256 additionalInterest = (borrowing.borrowed * BORROWING_APY * timeElapsed) / (SECONDS_PER_YEAR * 100);
                totalInterest += additionalInterest;
            }
        }
        
        return totalInterest;
    }
    
    /**
     * @dev Get total accrued interest for a lender
     * @param user Address of the user
     * @return totalInterest Total accrued interest
     */
    function getTotalAccruedInterest(address user) external view returns (uint256 totalInterest) {
        UserLending storage lending = userLending[user];
        
        // Start with current tracked interest
        totalInterest = lending.interestAccrued;
        
        // Add untracked interest since last update
        if (lending.deposited > 0 && lending.lastUpdateTimestamp > 0) {
            uint256 timeElapsed = block.timestamp - lending.lastUpdateTimestamp;
            if (timeElapsed > 0) {
                uint256 additionalInterest = (lending.deposited * LENDING_APY * timeElapsed) / (SECONDS_PER_YEAR * 100);
                totalInterest += additionalInterest;
            }
        }
        
        return totalInterest;
    }
    
    /**
     * @dev Pause the protocol in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the protocol
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Calculate max borrowable amount for a user based on provided collateral
     * @param collateralAmount Amount of PHAR to be provided as collateral
     * @param user Address of the potential borrower
     * @return maxBorrow Maximum amount that can be borrowed
     */
    function calculateMaxBorrow(uint256 collateralAmount, address user) external view returns (uint256 maxBorrow) {
        // Get user's required collateral ratio
        uint256 collateralRatio = creditScoring.getCollateralRatio(user);
        
        // Calculate collateral value in USDP (assuming 1 PHAR = 10 USDP)
        uint256 collateralValueInUsdp = (collateralAmount * 10);
        
        // Calculate max borrow amount
        maxBorrow = (collateralValueInUsdp * 100) / collateralRatio;
        
        // Check against available protocol liquidity
        uint256 availableLiquidity = usdpToken.balanceOf(address(this));
        if (maxBorrow > availableLiquidity) {
            maxBorrow = availableLiquidity;
        }
        
        return maxBorrow;
    }
}
