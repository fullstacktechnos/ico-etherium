pragma solidity ^0.4.21;

contract FSTToken {
    string public constant name = "FSTToken";
    string public constant symbol = "FST";

    uint256 totalSupply_;
    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) internal allowed;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value 
    );
    event Approval(
        address indexed _owner, 
        address indexed _spender, 
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
        require(balances[_to] + _value > balances[_to]);
        
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require((_value == 0) || (allowed[msg.sender][_spender] == 0));

        allowed[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }
    
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != msg.sender);
        require(balances[_from] >= _value);
        require(allowed[_from][msg.sender] >= _value);
        require(balances[_to] + _value > balances[_to]);
        
        balances[_from] -= _value;
        balances[_to] += _value;

        allowed[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
}