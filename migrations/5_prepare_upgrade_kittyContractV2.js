// migrations/5_prepare_upgrade_kittyContractV2.js
const KittyContract = artifacts.require('KittyContract')
const KittyContractV2 = artifacts.require('KittyContractV2')
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer) {
  const kittyInstance = await KittyContract.deployed()
  await prepareUpgrade(kittyInstance.address, KittyContractV2, { deployer })
}