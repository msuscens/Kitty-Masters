pragma solidity 0.5.12;

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