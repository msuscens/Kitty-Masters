const KittyContract = artifacts.require('KittyContract')
const KittyContractV2 = artifacts.require('KittyContractV2')
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer) {

  // COMMENTED OUT FOR NOW SO WE DON'T ACCIDENTIALLY 
  // UPGRADE KittyContract TO KittyContractV2 
  /*
  const kittyInstance = await KittyContract.deployed()
  await prepareUpgrade(kittyInstance.address, KittyContractV2, { deployer })
  */
}

