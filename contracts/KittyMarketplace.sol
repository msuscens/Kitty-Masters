// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;


import "./IKittyMarketplace.sol";
import "./KittyContract.sol"; 

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KittyMarketplace is OwnableUpgradeable, IKittyMarketplace {

    KittyContract private _kittyContract;

    struct Offer {
        address seller;
        uint256 price;
        uint256 index;
        uint256 tokenId;
        bool active;
    }

    Offer[] private _offers;
    mapping(uint256 => Offer) private _tokenIdToOffer;
    

// Public & external functions

    function init_KittyMarketplace(address kittyContractAddress)
        public
        initializer
    {
        OwnableUpgradeable.__Ownable_init();
        setKittyContract(kittyContractAddress);
    }


    function setKittyContract(address kittyContractAddress)
        override
        public
        onlyOwner
    {
        _kittyContract = KittyContract(kittyContractAddress);
    }


    function getOffer(uint256 idOfToken)
        override
        external
        view
        returns(address seller, uint256 price, uint256 index, uint256 tokenId, bool active)
    {
        require(_tokenIdToOffer[idOfToken].seller != address(0), "Token not on offer!");

        seller = _tokenIdToOffer[idOfToken].seller;
        price = _tokenIdToOffer[idOfToken].price;
        index = _tokenIdToOffer[idOfToken].index;
        tokenId = _tokenIdToOffer[idOfToken].tokenId;
        active = _tokenIdToOffer[idOfToken].active;
    }


    function getAllTokenOnSale() 
        override
        external
        view
        returns(uint256[] memory)
    {
        uint256 totalOffers = _offers.length;
        uint256[] memory allOfferIds = new uint256[](totalOffers);

        uint256 i;
        uint256 activeOffers = 0;
        for (i = 0; i < totalOffers; i++){
            if (_offers[i].active == true) {
                allOfferIds[activeOffers] = _offers[i].tokenId;
                activeOffers++;
            }
        }

        if (activeOffers == totalOffers) return allOfferIds;

        // Create correctly sized smaller array (as some offers weren't active)
        uint256[] memory activeOfferIds = new uint256[](activeOffers);
        for (i = 0; i < activeOffers; i++) {
            activeOfferIds[i] = allOfferIds[i];
        }
        return activeOfferIds;
    }

    
    function setOffer(uint256 price, uint256 tokenId) override external {

        require(_isKittyOwner(msg.sender, tokenId), "Only owner can offer for sale!");
        require(_isOnOffer(tokenId) == false, "Already on offer for sale!");
        require(
            _kittyContract.isApprovedForAll(msg.sender, address(this)),
            "Contract must be sales operator!"
        );

        Offer memory newOffer = Offer(
            {
                seller: msg.sender,  // address(uint160(msg.sender)),
                price: price,
                index: _offers.length,
                tokenId: tokenId,
                active: true
            }
        );
        _offers.push(newOffer);
        _tokenIdToOffer[tokenId] = newOffer;

        emit MarketTransaction("Create offer", msg.sender, tokenId);
    }

    
    function removeOffer(uint256 tokenId) override external {

        require(_isOnOffer(tokenId) == true, "Active offer doesn't exist!");
        require(
            msg.sender == _tokenIdToOffer[tokenId].seller,
            "Only seller can remove offer!"
        );

        _removeOffer(tokenId);
        emit MarketTransaction("Remove offer", msg.sender, tokenId);
    }

    
    function buyKitty(uint256 tokenId) override external payable {
        Offer memory tokenOffer = _tokenIdToOffer[tokenId];
        require(_isOnOffer(tokenId) == true, "Active offer doesn't exist!");
        require(msg.value >= tokenOffer.price, "Token purchase price not sent!");

        _removeOffer(tokenId);

    // *** Make this logic pull instead of push (see consensus best practice guide for smart contract security)
    // *** Ie. Replace transfer() and instead use call()
        if (msg.value > 0) {
            // tokenOffer.seller.transfer(tokenOffer.price);

            // This forwards all available gas. Be sure to check the return value!
            (bool success, ) = payable(tokenOffer.seller).call{value: msg.value}("");
            require(success, "Payment to seller failed!");
        }
        _kittyContract.safeTransferFrom(tokenOffer.seller, msg.sender, tokenId);

        emit MarketTransaction("Buy", tokenOffer.seller, tokenId);
    }


    function isTokenOnSale(uint256 tokenId) override external view returns (bool) {
        return (_isOnOffer(tokenId));
    }


// Internal & private functions

    function _isKittyOwner(address claimant,uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return(_kittyContract.ownerOf(tokenId) == claimant);
    }


    function _isOnOffer(uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return(_tokenIdToOffer[tokenId].active == true);
    }


    function _removeOffer(uint256 tokenId) internal {
        Offer memory toBeRemoved = _tokenIdToOffer[tokenId];

        uint256 lastIndex = _offers.length - 1;
        if (toBeRemoved.index < lastIndex) { // not the last offer in the array
            // Move last offer record (in array) to overwrite the offer to be removed
            Offer memory lastOffer = _offers[lastIndex];
            lastOffer.index = toBeRemoved.index;       // poisition to which last offer record will be moved
            _offers[toBeRemoved.index] = lastOffer;    // overwrite offer to be removed (with last offer record) 
            _tokenIdToOffer[lastOffer.tokenId] = lastOffer; // Update record in the token mapping 
        }
        _offers.pop();   // remove last offer record (now redundant as moved, or is the offer to be removed)
        delete _tokenIdToOffer[toBeRemoved.tokenId];   
    }

}
