// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

import "./IERC721.sol";
import "./IOwnable.sol";

interface IKittyContract is IERC721, IOwnable {

    event Birth(
        address owner,
        uint256 kittenId,
        uint256 mumId,
        uint256 dadId,
        uint256 genes,
        uint256 generation
    );


// Public & external functions

    function createKittyGen0(uint256 genes) external;

    function breed(uint256 mumId, uint256 dadId) external returns (uint256);

    function getKitty(uint256 kittyId) external view returns (
        uint256 genes,
        uint64 birthTime, 
        uint64 mumId,
        uint64 dadId,
        uint64 generation
    );

    function getAllYourKittyIds() external view returns(uint256[] memory);


    // IERC165 function implementations
    function supportsInterface(bytes4 interfaceId) external pure returns (bool);


    // IERC721 function implementations

    function balanceOf(address owner)
        override
        external
        view
        returns (uint256);

    function totalSupply() override external view returns (uint256);

    function name() override external view returns (string memory);

    function symbol() override external view returns (string memory);

    function ownerOf(uint256 tokenId)
        override
        external
        view
        returns (address);

    function transfer(address to, uint256 tokenId) override external;
    
    function approve(address approved, uint256 tokenId) override external;

    function setApprovalForAll(address operator, bool approved)
        override
        external;

    function getApproved(uint256 tokenId)
        override
        external
        view
        returns (address);

    function isApprovedForAll(address owner, address operator)
        override
        external
        view
        returns (bool);

    function safeTransferFrom(
        address from, 
        address to, 
        uint256 tokenId, 
        bytes calldata data
    )
        override
        external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    )
        override
        external;

    function transferFrom(address from, address to, uint256 tokenId)
        override
        external;
}

