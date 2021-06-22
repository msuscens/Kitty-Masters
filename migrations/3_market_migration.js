const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const KittyContract = artifacts.require("KittyContract")
const Marketplace = artifacts.require("KittyMarketplace")

let marketInstance

module.exports = async function (deployer, network, accounts) {

  // Deploy the Logic contract and initialize (with associated proxy)
  marketInstance = await deployProxy(
    Marketplace, 
    [KittyContract.address], 
    { deployer, initializer: 'init_KittyMarketplace', from: accounts[0]}
  )
  
}