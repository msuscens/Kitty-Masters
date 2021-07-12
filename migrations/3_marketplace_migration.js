const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const DragonToken = artifacts.require("DragonToken")
const Marketplace = artifacts.require("Marketplace")

let marketInstance

module.exports = async function (deployer, network, accounts) {

  // Get KiityContract proxy (previously deployed)
  const dragonToken = await DragonToken.deployed()

  // Deploy the Marketplace (logic & proxy) and initialize
  marketInstance = await deployProxy(
    Marketplace, 
    [dragonToken.address], 
    { deployer, initializer: 'init_Marketplace', from: accounts[0]}
  )

}