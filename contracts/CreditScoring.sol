
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CreditScoring
 * @dev Handles credit score calculation for borrowers
 */
contract CreditScoring is Ownable {
    // State variables
    IERC20 public pharToken;
    
    // Credit score components
    struct UserCreditData {
        uint256 interactionCount;
        uint256 repaymentHistory; // 0-100 score
        uint256 lastUpdateBlock;
        bool initialized;
    }
    
    mapping(address => UserCreditData) public userCreditData;
    
    // Events
    event CreditScoreUpdated(address indexed user, uint256 newScore);
    event InteractionRecorded(address indexed user, uint256 newInteractionCount);
    
    constructor(address initialOwner, address _pharToken) Ownable(initialOwner) {
        pharToken = IERC20(_pharToken);
    }
    
    /**
     * @dev Record a new interaction for a user
     * @param user Address of the user
     */
    function recordInteraction(address user) external {
        // Only the lending contract should be able to call this
        // This would require additional access control in production
        require(msg.sender == owner(), "Only owner can record interactions");
        
        if (!userCreditData[user].initialized) {
            userCreditData[user] = UserCreditData({
                interactionCount: 1,
                repaymentHistory: 50, // Start with neutral score
                lastUpdateBlock: block.number,
                initialized: true
            });
        } else {
            userCreditData[user].interactionCount += 1;
            userCreditData[user].lastUpdateBlock = block.number;
        }
        
        emit InteractionRecorded(user, userCreditData[user].interactionCount);
    }
    
    /**
     * @dev Update repayment history score
     * @param user Address of the user
     * @param successful Whether the repayment was successful
     */
    function updateRepaymentHistory(address user, bool successful) external {
        require(msg.sender == owner(), "Only owner can update repayment history");
        
        if (!userCreditData[user].initialized) {
            userCreditData[user] = UserCreditData({
                interactionCount: 0,
                repaymentHistory: successful ? 60 : 40, // Start slightly above/below neutral
                lastUpdateBlock: block.number,
                initialized: true
            });
        } else {
            // Adjust score based on repayment success
            if (successful) {
                // Increase score but cap at 100
                userCreditData[user].repaymentHistory = min(
                    100,
                    userCreditData[user].repaymentHistory + 5
                );
            } else {
                // Decrease score but floor at 0
                userCreditData[user].repaymentHistory = userCreditData[user].repaymentHistory >= 10 
                    ? userCreditData[user].repaymentHistory - 10 
                    : 0;
            }
            userCreditData[user].lastUpdateBlock = block.number;
        }
        
        uint256 newScore = getCreditScore(user);
        emit CreditScoreUpdated(user, newScore);
    }
    
    /**
     * @dev Get credit score for a user
     * @param user Address of the user
     * @return Credit score (0-800)
     */
    function getCreditScore(address user) public view returns (uint256) {
        if (!userCreditData[user].initialized) {
            // Default score for new users
            return 300;
        }
        
        // Get PHAR balance
        uint256 pharBalance = pharToken.balanceOf(user);
        
        // Calculate score components
        uint256 interactionScore = min(userCreditData[user].interactionCount * 10, 200);
        uint256 pharScore = min((pharBalance * 100) / (10**18), 300);
        uint256 repaymentScore = (userCreditData[user].repaymentHistory * 3);
        
        // Combine scores with cap at 800
        uint256 totalScore = 300 + interactionScore + pharScore + repaymentScore;
        return min(totalScore, 800);
    }
    
    /**
     * @dev Get required collateral ratio based on credit score
     * @param user Address of the user
     * @return Collateral ratio as a percentage (120-200)
     */
    function getCollateralRatio(address user) external view returns (uint256) {
        uint256 creditScore = getCreditScore(user);
        
        if (creditScore >= 700) {
            return 120; // 120% (1.2x)
        } else if (creditScore >= 500) {
            return 150; // 150% (1.5x)
        } else {
            return 200; // 200% (2x)
        }
    }
    
    /**
     * @dev Helper function to get minimum of two numbers
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
