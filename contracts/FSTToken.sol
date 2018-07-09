pragma solidity ^0.4.21;

contract FSTToken {
    string public constant name = "FSTToken";
    string public constant symbol = "FST";

    uint256 totalSupply_;
    mapping(address => uint256) balances;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value 
    );

    constructor (uint256 _initialSupply) public {
        balances[msg.sender] = _initialSupply;
        totalSupply_ = _initialSupply;
    }

    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    } 
    
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balances[msg.sender] >= _value);
        
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        
        return true;
    }
}