// Transfer ownship of Proxies Admin contract to GnosisSafe 
// multiSig wallet only if deploying to Rinkeby network.

const { admin } = require('@openzeppelin/truffle-upgrades')
 
module.exports = async function (deployer, network) {
  // Address of KittyMasters-Rinkeby Gnosis Safe
  const gnosisSafeRinkeby = '0x7bE70cbBED2b059fa6231AB7918C4F101169B607'
 
  // Change ProxyAdmin ownership (on Rinkeby only) to our Rinkeby Gnosis Safe
  // (NB only the owner of the ProxyAdmin can upgrade our contracts)
  if (network === 'rinkeby') {
     await admin.transferProxyAdminOwnership(gnosisSafeRinkeby);
     console.log(
       `Transfered ProxyAdmin ownership to 'Gnosis Safe' on ${network}.`,
       `\n(Rinkeby) Gnosis Safe' address: ${gnosisSafeRinkeby}`
     )
  }

  // For now DON'T change ProxyAdmn ownership for Ropsten network
  // if (network === 'ropsten') {
  //   // DO nothing for now!  
  //   // NB We'd need a Ropsten 'multisig wallet/safe' to become the ProxyAdmin
  //   // owner/adminstor.  However, there currently isn't a Ropsten version of
  //   // 'Gnosis Safe' 
  // }

}