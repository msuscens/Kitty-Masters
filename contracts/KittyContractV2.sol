// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

import "./KittyContract.sol"; 

contract KittyContractV2 is KittyContract {

    uint _version;    //ADDED new state variable

    function initialize(
        string memory tokenName, 
        string memory tokenSymbol
    )
        public
        initializer
    {
        KittyContract.init_KittyContract(tokenName, tokenSymbol);
    }

    // ADDED Functionality

    function setVersion(uint number) public onlyOwner {
        _version = number;
    }

    function getVersion() public view whenNotPaused returns (uint) {
        return _version;
    }


    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyOwner whenPaused {
        _unpause();
    }

}