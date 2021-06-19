// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata
    )
        external
        returns (bytes4);
}