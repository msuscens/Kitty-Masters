const Marketplace = artifacts.require('KittyMarketplace')
const MarketplaceV2 = artifacts.require('KittyMarketplaceV2')
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer) {

  // COMMENTED OUT FOR NOW SO WE DON'T ACCIDENTIALLY 
  // UPGRADE KittyMarketplace TO KittyMarketplaceV2 
  /*
  const marketInstance = await Marketplace.deployed()
  await prepareUpgrade(marketInstance.address, MarketplaceV2, { deployer })
  */
}