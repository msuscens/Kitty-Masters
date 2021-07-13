// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./Marketplace.sol"; 

contract MarketplaceV2 is Marketplace {

    uint _version;    //ADDED new state variable

    function initialize(address dragonTokenAddress)
        public
        initializer
    {
        Marketplace.init_Marketplace(dragonTokenAddress);
    }

    // ADDED Functionality

    function setVersion(uint number) public onlyOwner {
        _version = number;
    }

    function getVersion() public view whenNotPaused returns (uint) {
        return _version;
    }

}