
const TOKEN_NAME = "Dragon Masters Token"
const TOKEN_SYMBOL = "DMT"
const GEN0_LIMIT = 10

const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const DragonToken = artifacts.require("DragonToken")

let kittyInstance

module.exports = async function (deployer, network, accounts) {

  // Deploy the DragonToken (logic, admin, & proxy contracts) and initialize
  kittyInstance = await deployProxy(
    DragonToken, 
    [TOKEN_NAME, TOKEN_SYMBOL, GEN0_LIMIT], 
    { deployer, initializer: 'init_DragonToken', from: accounts[0]}
  )
  
}
