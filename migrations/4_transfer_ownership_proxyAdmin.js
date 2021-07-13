// Transfer ownship of Proxies Admin contract to GnosisSafe 
// multiSig wallet only if deploying to Rinkeby network.

const { admin } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer, network) {
// COMMENTED OUT FOR NOW: So that we don't accidentially transfer the
// ProxyAdmin ownership (for DragonToken and Marketplace proxies).
// NOTE: Details for (Rinkeby) Gnosis safe below are the ones used for
//      KittyMasters, may want to reuse this safe or set up a new one. 
/* 

  // Address of KittyMasters-Rinkeby Gnosis Safe
  const gnosisSafeRinkeby = '0x7bE70cbBED2b059fa6231AB7918C4F101169B607'
 
  // Change ProxyAdmin ownership (on Rinkeby only) to 'Gnosis Safe'
  // (NB only the owner of the ProxyAdmin can upgrade our contracts)
  if (network === 'rinkeby') {
     await admin.transferProxyAdminOwnership(gnosisSafeRinkeby);
     console.log(
       `Transfered ProxyAdmin ownership to 'Gnosis Safe' on ${network}.`,
       `\n(Rinkeby) Gnosis Safe' address: ${gnosisSafeRinkeby}`
     )
  }

*/
  console.log("Skipping ownership transfer (currently commented out)")

  // For now DON'T change ProxyAdmn ownership for Ropsten network
  // if (network === 'ropsten') {
  //   // DO nothing for now!  
  //   // NB We'd need a Ropsten 'multisig wallet/safe' to become the ProxyAdmin
  //   // owner/adminstor.  Ropsten version of 'Gnosis Safe' doesn't have a UI,
  //   // there create a Gnosis safe (on Ropsten) from within Defender.
  // }

}