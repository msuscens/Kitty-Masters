const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const KittyContract = artifacts.require("KittyContract")

const tokenName = "Mark-Crypto-Kitty"
const tokenSymbol = "MCK"
let kittyProxyInstance

module.exports = async function (deployer, network, accounts) {

  // Deploy the Wallet proxy with associated Logic contract and initialize
  kittyProxyInstance = await deployProxy(
    KittyContract, 
    [tokenName, tokenSymbol], 
    { deployer }
  )
  console.log("Deployed (proxy & logic), kittyProxyInstance:", kittyProxyInstance.address)
  
}
