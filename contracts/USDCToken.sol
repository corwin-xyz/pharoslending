// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title USDCToken
 * @dev Stablecoin
 */
contract USDCToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("USDC Dummy", "USDC") Ownable(initialOwner) {
        // Mint initial supply to owner (10 million tokens)
        _mint(initialOwner, 10_000_000 * 10**decimals());
    }

    /**
     * @dev Allows owner to mint additional tokens in the future if needed
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function getBalance(address account) external view returns (uint256) {
        return balanceOf(account);
    }
}