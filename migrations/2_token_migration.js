
const TOKEN_NAME = "Mark-Crypto-Kitty"
const TOKEN_SYMBOL = "MCK"
const GEN0_LIMIT = 10

const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const KittyContract = artifacts.require("KittyContract")

let kittyInstance

module.exports = async function (deployer, network, accounts) {

  // Deploy the KittyContract (logic, admin, & proxy contracts) and initialize
  kittyInstance = await deployProxy(
    KittyContract, 
    [TOKEN_NAME, TOKEN_SYMBOL, GEN0_LIMIT], 
    { deployer, initializer: 'init_KittyContract', from: accounts[0]}
  )
  
}
