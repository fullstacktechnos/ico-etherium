pragma solidity ^0.4.21;

contract FSTToken {
    // Total number of token
    uint256 public totalSupply;

    constructor () public {
        totalSupply = 1000000;
    }
}