const DragonToken = artifacts.require('DragonToken')
const DragonTokenV2 = artifacts.require('DragonTokenV2')
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer) {

  // COMMENTED OUT FOR NOW SO WE DON'T ACCIDENTIALLY 
  // UPGRADE DragonToken TO DragonTokenV2 
  /*
  const kittyInstance = await DragonToken.deployed()
  await prepareUpgrade(kittyInstance.address, DragonTokenV2, { deployer })
  */
}
