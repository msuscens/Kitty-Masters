const Marketplace = artifacts.require('Marketplace')
const MarketplaceV2 = artifacts.require('MarketplaceV2')
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer) {

  // COMMENTED OUT FOR NOW SO WE DON'T ACCIDENTIALLY 
  // UPGRADE Marketplace TO MarketplaceV2 
  /*
  const marketplace = await Marketplace.deployed()
  await prepareUpgrade(marketplace.address, MarketplaceV2, { deployer })
  */
 console.log("Skipping upgrade (currently commented out)")
}