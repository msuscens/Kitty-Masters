Dragons : https://github.com/msuscens/Kitty-Masters/tree/dragons
A branch of Kitty-Masters project (see below) to rename contracts, functions 
and variables ready for the Dragon-Masters (team) project.  There is also 
some minor refactoring and tidying-up to remove unused functions, comment
out testnet config (truffle-config.js), and add a new UI interface function 
(interface.js) for setting Marketplace approval for a single dragon token.
The contracts now have the pause() and unpause() functions (moved across
from the V2 contracts) and migration scripts for transfer ownership of the
proxyAdmin and to upgrade the contracts to V2 have internals commented out
(since we are not ready to perform these actions with Dragon-Masters yet).
Additionally, added Truffle tests for contract functionality.
Developed by Mark Suscens (July 2021)
_______________________________________________________________________________

KITTY-MASTERS : Developed by Mark Suscens May-July 2021 (final project in the
                'Blockchain Develper Bootcamp' IvanOnTech Blockchain Academy)
                Kitty-Masters was developed with the aim of creating a solid
                basis/structure for 'Dragon Masters' (a future project that 
                in a team we aim to develop and commercially launch).
                https://github.com/msuscens/Kitty-Masters/tree/master

Running on Ropsten: https://reverent-mirzakhani-acd298.netlify.app/index.html

To install, migrate and run Kitty-Masters DAPP locally: Please follow the steps
in the accompanying file: “README-Repo-Clone-and-Configure-App”

Project Scope and Key Features:
* Based upon/replicates functionality of “CryptoKitties-Clone” (ie. my 2nd Bootcamp
 project, that I git cloned at the start of this "Kitty-Masters" project)

* Truffle Tests added (to support development/integration)

*  Refactored to Solidity version 0.8.6, with code layout following official
Solidity coding style.  (“CryptoKitties-Clone" was written in Solidity v0.5.4)

* Refactored to use OpenZeppelin’s ‘upgradeable’ contract library (v4.1) 
making contracts:
	- Upgradeable (employing OZ ‘Transparent Upgradeable Proxy’ pattern)
	- Plausable 

* “CryptoKitties-Clone” contracts refactored to use OZ ERC721 inherrited
functions rather than the same ERC&21 standard functions that I wrote
(as part of my previous “CryptoKitties-Clone” project):
	- KittyContract.sol file substantially reduced in size, down to 255 lines
        plus the dnaMix function code. [Note: There are 5 versions of dnaMix
        function, of varrying degrees of sophistication/complexity!  But only 
        one dnaMix function is needed/used.]
	- Marketplace.sol file is 200 lines

* Refactored the frontend's contract's Interface (abstraction) layer that
    decouples (website) front-end from (otherwise) having to make  direct
    web3/contract calls.

* Kitty-Masters DAP proven with Testnet deployments
    * Contract Migration scripts and truffle-config.js support local,
    ropsten, rinkeby deployments
    * Front-end (contract) interface code detects current MetaMask network to
    automatically connect to either: local, rospten, or rinkeby network.
    [See initiationConnection() in client/assets/contractInterface/interface.js]
    * Kitty-Masters DAP hosted on Ropsten - access here:
        https://reverent-mirzakhani-acd298.netlify.app/index.html

* Upgradeable/pausible contracts proven to work with Defender and GnosisSafe
    * Transfered proxyAdmin contract ownership to my GnosisSafe (on Rinkeby)
    [See migration script 4_transfer_ownership_proxyAdmin.js]
    * KittyContract upgrade perfomed (to KittyContractV2) via Defender.
    [Note: Defender could therefore readily employed to support Dev/Sec Ops
    for the future Dragon-Master's project.]
    * KittyContractV2 pausible function (with pausible modify) paused and
    unpaused via Defender.

Note: Kitty-Masters does not add any new website functionality, it has the 
same DAP user functionality as in my CryptoKitties-Clone project. This
Kitty-Masters project, whilst it has made very significant enhancements to 
my previous (CryptoKitties-Clone) project, these changes are not visible
from the website but are rather all under-the-hood. 

