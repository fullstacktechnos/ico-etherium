pragma solidity ^0.4.21;

import "./FSTToken.sol";

contract FSTTokenSale {
    address admin;
    FSTToken public token;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    uint256 public weiRaised;

    event TokenPurchase(
        address indexed _buyer,
        uint256 _value,
        uint256 _amount
    );

    constructor (FSTToken _token, uint256 _tokenPrice) public {
        require(_tokenPrice > 0);

        admin = msg.sender;
        token = _token;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 a, uint256 b) internal pure returns(uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        assert(c / a == b);
        return c;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        uint256 weiAmount = msg.value;

        require(weiAmount != 0);
        require(weiAmount == multiply(_numberOfTokens, tokenPrice));
        require(token.balanceOf(this) >= _numberOfTokens);
        
        tokenSold += _numberOfTokens;
        weiRaised += weiAmount;

        token.transfer(msg.sender, _numberOfTokens);
        emit TokenPurchase(msg.sender, weiAmount, _numberOfTokens);

        admin.transfer(weiAmount);
    }

    function endSale() public {
        require(msg.sender == admin);
        
        uint256 balance = token.balanceOf(this);
        assert(balance > 0);
        token.transfer(admin, balance);

        // Destroy the contract and send any remiaing ether in the contract to admin.
        selfdestruct(admin);
    }
}