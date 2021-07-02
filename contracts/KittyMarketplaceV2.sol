// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./KittyMarketplace.sol"; 

contract KittyMarketplaceV2 is KittyMarketplace {

    uint _version;    //ADDED new state variable

    function initialize(address kityContractAddress)
        public
        initializer
    {
        KittyMarketplace.init_KittyMarketplace(kityContractAddress);
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