// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

/*
 * Marketplace to trade dragon tokens. It needs an existing DragonToken
 * contract with which to interact.
 * Note: It does not inherit from the DragonToken contract
 * Note: The contract needs to be an operator for everyone who is selling
 * through this contract.
 */
interface IMarketplace {

    event MarketTransaction(string TxType, address owner, uint256 tokenId);

    /*
    * Creates a new offer for _tokenId for the price _price.
    * Emits the MarketTransaction event with txType "Create offer"
    * Requirement: Only the owner of _tokenId can create an offer.
    * Requirement: There can only be one active offer for a token at a time.
    * Requirement: Marketplace contract (this) needs to be an approved operator 
    *   when the offer is created (either for token in question or all tokens).
     */
    function setOffer(uint256 _price, uint256 _tokenId) external;

    /*
    * Removes an existing offer.
    * Emits the MarketTransaction event with txType "Remove offer"
    * Requirement: Only the seller of _tokenId can remove an offer.
     */
    function removeOffer(uint256 _tokenId) external;

    /*
    * Executes the purchase of _tokenId.
    * Sends the funds to the seller and transfers the token using transferFrom in DragonToken.
    * Emits the MarketTransaction event with txType "Buy".
    * Requirement: There must be an active offer for _tokenId
    * Requirement: Buyer must not already be the owner of _tokenId
    * Requirement: The msg.value needs to equal the price of _tokenId
     */
    function buyDragon(uint256 _tokenId) external payable;

    /*
    * Get the current DragonToken contract address held by the Marketplace contract.
     */
    function getDragonToken() external view returns(address dragonTokenAddress);

    /*
    * Get the details about a offer for _tokenId. Throws an error if there is no active offer for _tokenId.
     */
    function getOffer(uint256 _tokenId) external view returns ( address seller, uint256 price, uint256 index, uint256 tokenId, bool active);

    /*
    * Get all tokenId's that are currently for sale. Returns an empty array if none exist.
     */
    function getAllTokenOnSale() external view  returns(uint256[] memory listOfOffers);

    /*
    * Checks if given tokenId is on sale or not; returning true if it is, false if not.
    */
    function isTokenOnSale(uint256 tokenId) external view returns (bool);
}
