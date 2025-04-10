
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RestakingIntegration
 * @dev Manages PHAR restaking for yield generation
 */
contract RestakingIntegration is Ownable {
    using SafeERC20 for IERC20;
    
    // State variables
    IERC20 public pharToken;
    uint256 public totalStaked;
    uint256 public annualYieldRate = 8; // 8% annual yield
    
    // User staking data
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastStakeTimestamp;
    mapping(address => uint256) public rewardsAccrued;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    
    constructor(address initialOwner, address _pharToken) Ownable(initialOwner) {
        pharToken = IERC20(_pharToken);
    }
    
    /**
     * @dev Stake PHAR tokens for yield generation
     * @param amount Amount of PHAR to stake
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake zero amount");
        
        // Update rewards before changing balance
        _updateRewards(msg.sender);
        
        // Transfer tokens to contract
        pharToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update staking records
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake PHAR tokens
     * @param amount Amount of PHAR to unstake
     */
    function unstake(uint256 amount) external {
        require(amount > 0, "Cannot unstake zero amount");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        // Update rewards before changing balance
        _updateRewards(msg.sender);
        
        // Update staking records
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back to user
        pharToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim accrued rewards
     */
    function claimRewards() external {
        // Update rewards
        _updateRewards(msg.sender);
        
        uint256 rewardAmount = rewardsAccrued[msg.sender];
        require(rewardAmount > 0, "No rewards to claim");
        
        // Reset rewards
        rewardsAccrued[msg.sender] = 0;
        
        // Transfer reward tokens (assuming minted by owner or pre-allocated)
        pharToken.safeTransfer(msg.sender, rewardAmount);
        
        emit RewardClaimed(msg.sender, rewardAmount);
    }
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user Address of the user
     * @return Amount of pending rewards
     */
    function pendingRewards(address user) external view returns (uint256) {
        if (stakedBalance[user] == 0) {
            return rewardsAccrued[user];
        }
        
        uint256 timeElapsed = block.timestamp - lastStakeTimestamp[user];
        uint256 reward = (stakedBalance[user] * annualYieldRate * timeElapsed) / (365 days * 100);
        
        return rewardsAccrued[user] + reward;
    }
    
    /**
     * @dev Update rewards for a user
     * @param user Address of the user
     */
    function _updateRewards(address user) internal {
        if (stakedBalance[user] > 0 && lastStakeTimestamp[user] > 0) {
            uint256 timeElapsed = block.timestamp - lastStakeTimestamp[user];
            uint256 reward = (stakedBalance[user] * annualYieldRate * timeElapsed) / (365 days * 100);
            rewardsAccrued[user] += reward;
        }
        
        lastStakeTimestamp[user] = block.timestamp;
    }
    
    /**
     * @dev Set annual yield rate
     * @param newYieldRate New annual yield rate (percentage)
     */
    function setAnnualYieldRate(uint256 newYieldRate) external onlyOwner {
        require(newYieldRate <= 100, "Yield rate cannot exceed 100%");
        annualYieldRate = newYieldRate;
    }
}
