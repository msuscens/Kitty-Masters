// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

import "./IOwnable.sol";

abstract contract Ownable {
    address internal _contractOwner;

    modifier onlyOwner() {
        require(msg.sender == _contractOwner);
        _; //Continue execution
    }
    
    constructor() {
        _contractOwner = msg.sender;
    }

    function getContractOwner() external view returns (address) {
        return _contractOwner;
    }
}