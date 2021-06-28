// migrations/6_prepare_upgrade_kittyMarketplaceV2.js
const Marketplace = artifacts.require('KittyMarketplace')
const MarketplaceV2 = artifacts.require('KittyMarketplaceV2')
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer) {
  const marketInstance = await Marketplace.deployed()
  await prepareUpgrade(marketInstance.address, MarketplaceV2, { deployer })
}