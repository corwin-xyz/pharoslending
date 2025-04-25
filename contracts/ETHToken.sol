// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Ethereum
 * @dev Stablecoin
 */
contract Ethereum is ERC20, Ownable {
    constructor(address initialOwner) ERC20("ETH Dummy", "ETH") {
        _transferOwnership(initialOwner); // set owner secara manual
        _mint(initialOwner, 10 * 10**decimals());
    }

    /**
     * @dev Allows owner to mint additional tokens in the future if needed
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
