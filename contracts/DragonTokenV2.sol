// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./DragonToken.sol"; 

contract DragonTokenV2 is DragonToken {

    uint _version;    //ADDED new state variable

    function init_DragonTokenV2(
        string memory tokenName, 
        string memory tokenSymbol,
        uint256 gen0Limit
    )
        public
        initializer
    {
        DragonToken.init_DragonToken(tokenName, tokenSymbol, gen0Limit);
    }

    // ADDED Functionality

    function setVersion(uint number) public onlyOwner {
        _version = number;
    }

    function getVersion() public view whenNotPaused returns (uint) {
        return _version;
    }

}