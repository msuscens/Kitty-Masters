const KittyContract = artifacts.require("KittyContract")
const Marketplace = artifacts.require("KittyMarketplace")

module.exports = function(deployer) {
  deployer.deploy(Marketplace, KittyContract.address)
}
