// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./KittyContract.sol"; 

contract KittyContractV2 is KittyContract {

    uint _version;    //ADDED new state variable

    function init_KittyContractV2(
        string memory tokenName, 
        string memory tokenSymbol,
        uint256 gen0Limit
    )
        public
        initializer
    {
        KittyContract.init_KittyContract(tokenName, tokenSymbol, gen0Limit);
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