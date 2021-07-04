const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const KittyContract = artifacts.require("KittyContract")
const Marketplace = artifacts.require("KittyMarketplace")

let marketInstance

module.exports = async function (deployer, network, accounts) {

  // Get KiityContract proxy (previously deployed)
  const kittyContract = await KittyContract.deployed()

  // Deploy the Marketplace (logic & proxy) and initialize
  marketInstance = await deployProxy(
    Marketplace, 
    [kittyContract.address], 
    { deployer, initializer: 'init_KittyMarketplace', from: accounts[0]}
  )
  console.log("***DEBUG:Done deployProxy")

}