const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const KittyContract = artifacts.require("KittyContract")
const Marketplace = artifacts.require("KittyMarketplace")

let marketInstance

module.exports = async function (deployer, network, accounts) {

  console.log("KittyContract.address:", KittyContract.address)
  const kittyContract = await KittyContract.deployed()
  console.log("kittyContract.address:", kittyContract.address)

  console.log("***DEBUG : About to deployProxy")
  // Deploy the Logic contract and initialize (with associated proxy)
  marketInstance = await deployProxy(
    Marketplace, 
    [kittyContract.address], 
    // [KittyContract.address], 
    { deployer, initializer: 'init_KittyMarketplace', from: accounts[0]}
  )
  console.log("***DEBUG:Done deployProxy")

}