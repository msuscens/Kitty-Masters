const Marketplace = artifacts.require('Marketplace')
const MarketplaceV2 = artifacts.require('MarketplaceV2')
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer) {

  // COMMENTED OUT FOR NOW SO WE DON'T ACCIDENTIALLY 
  // UPGRADE Marketplace TO MarketplaceV2 
  /*
  const marketInstance = await Marketplace.deployed()
  await prepareUpgrade(marketInstance.address, MarketplaceV2, { deployer })
  */
}