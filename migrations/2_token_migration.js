const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const KittyContract = artifacts.require("KittyContract")

const tokenName = "Mark-Crypto-Kitty"
const tokenSymbol = "MCK"
let kittyInstance

module.exports = async function (deployer, network, accounts) {

  // Deploy the Logic contract and initialize (with associated proxy)
  kittyInstance = await deployProxy(
    KittyContract, 
    [tokenName, tokenSymbol], 
    { deployer, initializer: 'init_KittyContract', from: accounts[0]}
  )
  
}
