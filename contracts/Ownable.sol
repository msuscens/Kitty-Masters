pragma solidity 0.5.12;

contract Ownable {
    address internal _contractOwner;

    modifier onlyOwner() {
        require(msg.sender == _contractOwner);
        _; //Continue execution
    }
    
    constructor() public {
        _contractOwner = msg.sender;
    }

    function getContractOwner() external view returns (address) {
        return _contractOwner;
    }
}