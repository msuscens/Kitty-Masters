// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

interface IOwnable {

    function getContractOwner() external view returns (address);
}