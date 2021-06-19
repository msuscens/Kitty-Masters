const Utilities = artifacts.require("ArrayUtils")
const KittyContract = artifacts.require("KittyContract")

module.exports = function(deployer) {
  deployer.deploy(Utilities)
  deployer.link(Utilities, KittyContract)
  deployer.deploy(KittyContract, "MarksCryptoKitties", "MCK")
}