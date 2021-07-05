KITTY MASTERS

PROJECT AIM:

A conversion of my CryptoKitties-Clone project so that the contracts are
upgradable and pausable.  Specific updates to my CryptoKitties-Clone 
contract code were:

i) Convert contract code to Solidity v0.8.5

ii) Convert each contract to make them 'upgradeable' by employing the 
OpenZeppelein 'transaparent proxy' pattern and associated openeZeppelin
upgradable contract library

iii) Add the (OpenZeppelin) 'pausable' capability to each contract, so
that the 'pausable' modifiers can be applied to functions as required

iv) Add some basic Truffle test scripts to each contract (to support
this development work)

v) Completed Stretch goals: 
    a) Deploy to a testnet
    b) Employ 'Gnosis Safe' to hold each (proxy contratcs) Admin contract
    c) Set up Defender to help manage the Dev/Sec Ops of the contracts
    d) Refactor project code to use OZ inheritted ERC721 functions

This project will then form a basis for the planned 'Dragon Masters'
project (ie. a team project that will follow on form this one).

Note: Kitty Masters will not add further user functionality (above that already 
present in my CryptoKitties-Clone project) and will employ the same UI.
(https://github.com/msuscens/CryptoKitties-Clone)


GIT CLONE AND APP SETUP
To git clone this repository and configure the Kitty-Masters app to run on
your local machine, please see the steps in: README-Repo-Clone-and-Configure-App




______________________________________________________________________________
********                                                             *********
********  MY PERSONAL RECORD OF IMPLEMENTATION STEPS / LEARNING LOG  *********

IMPLEMENTAION STEPS
This will record the implementation steps taken to date on thethis project 
and draw upon the steps that I worked out in my project to take make my
MultiSigWallet contract project code and make it upgradeable/pausable:  
https://github.com/msuscens/Upgradeable-MultiSig-Wallet

1. Clone "CryptoKitties-Clone" to set up new project (KittyMasters)
Steps included:
    $ sudo npm install -g npm@7.18.1
    $ npm init
    $ truffle init
    $ git init
    $ git clone https://github.com/msuscens/CryptoKitties-Clone.git

    Version:
        Truffle v5.3.9 (core: 5.3.9)
        Solidity - 0.5.12 (solc-js)
        Node v14.15.5
        Web3.js v1.3.6

    Check that it (cloned CryptoKitties-Clone code) still compiles and runs:
        $ truffle compile
        $ ganache-cli -h 127.0.0.1 -p 8545 -m "quick brown fox jumped over the lazy dog"
        $ truffle migrate --reset

    Update client/assets/contractInterface/interface.js with the current 
    deployed contract addresses, start the local VSCode LiveServer and check
    that the application runs as expected.

    Create new git and gitHub repositories and commit:
    $ git commit -m "Clone 'CryptoKitties-Clone' to set up new project"
    $ git remote add origin https://github.com/msuscens/Kitty-Masters.git
    $ git push -u origin master


2. Install OpenZeppelin and Truffle libraries to provide:
  i) support truffle test assertions:
    $ npm install truffle-assertions

 ii) libary of upgradeable compatible OpenZeppelin contracts (v0.4):
    $ npm install @openzeppelin/contracts-upgradeable
    
iii) the OpenZeppelin Truffle upgrades plug-in for proxy/contract deployment 
and contract upgrade:

    $ sudo npm install --save-dev @openzeppelin/truffle-upgrades
    
    NB. Attempted 'truffle-upgrades' npm install failed with the error:
        npm ERR! code ERESOLVE
        npm ERR! ERESOLVE unable to resolve dependency tree
        npm ERR! 
        npm ERR! Found: bignumber.js@7.2.1
        etc
    [ Also see: https://forum.openzeppelin.com/t/error-installing-truffle-upgrades/7243 ]
    To resolve install truffle again:
    $ npm install truffle
        Note: Reports depeciated warnings and vulnerabilities upon completion:
        40 vulnerabilities (15 low, 15 moderate, 10 high)
    Such warnings and vulnerabilities were also encountered during the
    Upgradeable-MultiSig-Wallet project truffle install, and is a known
    Truffle issue: https://github.com/trufflesuite/truffle/issues/3986
    I therefore ignore these vulnerabilities, and proceed with install:

    $ npm install --save-dev @openzeppelin/truffle-upgrades
        Albeit this reports further depreciated warnings and vulnerabilities:
        53 vulnerabilities (24 low, 18 moderate, 11 high)
    

3. Convert contracts to use solidity V0.8.5 (from solc v0.5.12)
      i) Update truffle-config.js to specify compiler version 0.8.5
     ii) Update all contracts, interfaces and libraries to declare:
            pragma solidity 0.8.5;
    iii) Add 'SPDX-License-Identifier: MIT' comment in each .sol contract
        and library file (to eliminate compile warnings)
     iv) Update KittyContract.sol in accordance with 0.8.x syntax
      v) Update KittyMarketplace.sol in accordance with 0.8.x syntax
     vi) Add IKittyContract.sol and IOwnable.sol interface files (and import
        in KittyMarketplace) to fix the
        issue/warning of two KittyContracts being compiled

4. Update to web3.js latest version 1.3.6 (was on 1.3.4)
    a.    $ npm install web3
        BUT probabaly not necessary since I then:
            a) deleted ./contractInterface/web3.min.js file (v1.3.4) and 
            b) update web3 version in each html file by including:
             <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
    b. Remove depreciated ethereum.enable() method, replacing it with:
        ethereum.request({ method: 'eth_accounts' })

5. Update KittyContract & KittyMArketplace to use OpenZeppelin contracts
    a. Install latest OpenZeppelin contracts (v4.1.0):
        $ npm install @openzeppelin/contracts
    b. Replace local versions of IERC721.sol, IERC721Receiver.sol, and
        Ownable.sol (in KittyMasters/contracts) with @openZeppelin versions
        of each of these interfaces/contracts (in the directory:
        node_modules/@openzeppelin/contracts).
        This required improving (correcting!) the inheritance structure 
        (from contracts and interfaces), ie, they are now as follows:
            interface IKittyContract is IERC721 { ... }
            contract KittyContract is Ownable, IKittyContract { ... }
            interface IKittyMarketplace {
            contract KittyMarketplace is Ownable, IKittyMarketplace {
        Notes: 
            i) There is a bug in solc 0.8.5 that raises 'unreachable code'
            warnings - this should be fixed when 8.6 is released.  These 
            warnings should therefore be ignored: 
            https://github.com/ethereum/solidity/issues/11522
            
6. Write initial Truffle tests for KittyContract (kittyContract_test.js)
    a. Initial state tests
    b. Test structure for contract's functionality - specific tests TBD
    c. Tests for upgrade (commented-out/skipped until contract is 
    refactored to be upgrade compatible)
    Note: To link libraries to contracts within my Truffle Test script, used
    the method given here:
    https://forum.openzeppelin.com/t/trouble-linking-library-contracts-with-openzeppelin-test-environment/2235/3

7. Refactor KittyContract to an upgradeable contract
   (i.e. to follow OpenZeppelin's "transparent upgradeable proxy" pattern)
    a. Replace constructor with 'initialize()' function, adding 'intializer'
        modifier (from OZ 'Initializable' base contract).  (And taking care
        to mannually call the initialzers of all parent contracts.)
    b. Reworked the KittyContract's inheritance hierarchy (and interface) to
        compile with OZ Upgradeable base contract versions for ERC721 
        (ERC721Upgradeable) and Ownable (OwnableUpgradeable), these are under:
        @openzeppelin/contracts-upgradeable/ subdirectories.
    c.  Updated KittyContract's function override and visibility signature so
        that its functions are employed instead of very similar versions in
        OZ base ERC721Upgradeable base contract.
        [ NOTE: Could be refactored to use OZ base functions in many cases,
        which would greatly simplify the code.]
    d. Removed the ArrayUtils library that provided the removeFrom() function
        (used in  KittyContract's transfer(...) function).  Added a new 
        KittyContract function '_removeFrom(...)' as a replacement.
    e. Moved intialisation of state variables from their declaration into the
        'initialize()' function (i.e variables: _GEN0_LIMIT and _dnaFormat).
    f. Updated the truffle tests (kittyContract_test.js) to deploy 
        KittyContract as an upgradeable contract, with deployProxy() function,
        and ensuring that the 'Initial State' tests still pass.
    g. Created a KittyContractV2 (exact copy of KittyContract code for now 
        but just with an updated contract name) and confirmed that the contract
        upgrade to V2 tests (under 'Keeps pre-updgrade state variables') pass.
    h. Updated KittyContract migrations file (2_token_migrations.js) to 
        for deployment of the logic contract (with proxy), and deployed.
    j. Updated client/assets/contractInterface/abi.js (and contract addresses
        in client/assets/contractInterfaceinterface.js), and ran/tested the
        application using the website.

   Note: See this guide:
   https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable

8. Add 'pausable' capability to the KittyContract
    a. Add ERC721PausableUpgradeable was an extension contract to the existing
        ERC721Upgradeable, ie. KittyContract now inherits from both and 
        overrides the multiply inherited function _beforeTokenTransfer(...)
    b. Create new KittyContractV2 contract that inherits from KittyContract 
        and calls the KittyContract initialiser from its own initialize()
        function.  KittyContractV2 defines the new functions: getVersion(),
        setVersion(), pause(), and unpause().
    c. Renamed KittyContract's initialize() function to 'init_KittyContract()'
        and refactored the Truffle tests (kittyContract_test.js) and migration
        file (2_token_migrations.js) to pass this (non-default) function name
        to 'deployProxy()' using the {initializer: 'init_KittyContract'}
        argument.
    c. Revised Truffle tests to test 'pausable' functionality. And adding the 
        'whenNotPaused' modifer to KittyContractV2's getVersion() function.

    Note: Added Truffle tests to check the Proxy's admin functions but the
        'deployProxy()' and 'upgradeProxy()' functions don't expose the admin
        functions and so it appears that admin functions are not callable via
        Truflle Tests or the Truffle console.  However, left the (not working)
        tests/proxy admin function calls comment-out in test script.
 

9. Write initial Truffle tests for KittyMarketplace (kittyMarketplace_test.js)
    a. Initial state tests
    b. Test structure for contract's functionality - specific tests TBD
    c. Tests for contract upgrade (commented-out/skipped until contract is
    refactored to be upgrade compatible)

10. Refactor KittyMarketplace to be contract upgradeable
   (i.e. to follow OpenZeppelin's "transparent upgradeable proxy" pattern)
    a. Replace the Ownable inherited base-contract with OwnableUpgradeable
        [ @openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol ]
    b. Replace constructor with an 'initialize' function, adding 'intializer'
        modifier (from OZ 'Initializable' base-contract):
        function init_KittyMarketplace(address memory kittyContractAddress)
    c. Update KittyMarketplace migrations script (2_market_migrations.js) 
        to deploy as upgradeable contract (using deployProxy function).
    d. Update the truffle tests (kittyMarketplace_test.js) to deploy 
        KittyMarketplace as an upgradeable contract, using deployProxy() 
        function.  Check that the 'Initial State' tests still pass.
    e. Create a KittyMarketplaceV2 (inherits from KittyMarketplace) with
        added functions setVersion(), getVersion() and version variable.
        Check relevant tests pass under: 'Upgraded to KittyMarketplace V2'.
    f. Update client/assets/contractInterface/abi.js (and contract addresses
        in client/assets/contractInterfaceinterface.js). Run/tested the
        application using the website.

11. Add upgrade test to check linked KittyContract address is maintained
    a. Add new getKittyContract() function to KittyMarketplace that returns the
        address of the referenced KittyContract
    b. Update the tests (kittyMarketplace_test.js) to check that the same address
        for KittyContract is held by KittyMarketplace post a contract upgrade.

12. Add 'pausable' capability to the KittyMarketplace contract
    a. Add PausableUpgradeable as a Kittymarketplace inherrited parent contract
        ie. KittyMarketplace inherits from both OZ contracts OwnableUpgradeable 
        and PausableUpgradeable. 
        ["@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol"]
    b. Update KittyMarketplaceV2 to add the new functions: pause() and unpause()
        Give the pause() function the modifiy 'whenNotPaused' and the unpause()
        function the modifier 'whenPaused'.  Add the 'whenNotPaused' modifier
        to the getVersion() function.
    c. Update Truffle tests (kittyMarketplace_test.js) so that the 'pausable' 
        functional tests are executed (no longer skipped) and check they pass.

13. Add test for KittyMarketplace to check it maintains access to an upgraded
    KittyContract. Update all tests to use deepStrictEqual() and remove all
    redundant comments.  Update website's contractInterface (abi.js and
    interface.js files) with latest abi and (deployed) contract addresses.


HOST WEBSITE AND DEPLOY CONTRACTS TO ROPSTEN TESTNET

14. Host website at: https://reverent-mirzakhani-acd298.netlify.app
    a. Sign-up for netlify account (app.netlify.com) and login via GitHub
    b Create a new site (with continuous deployment) called: "Kitty Masters"
    c. Approve access to my KittyMasters GitHub repository
    d. Set owner and Branch to deploy: master
    e. Set Publish directory (be setitng base directory): client
    f. Click 'Deploy Site'
    g. Generated url: https://reverent-mirzakhani-acd298.netlify.app

15. Testnet Deployment (to Ropsten, using Infura)
    a. Configure truffle.config to:
    i) Uncomment the lines:
        // const HDWalletProvider = require('@truffle/hdwallet-provider');
        // const infuraKey = "fj4jll3k.....";
        //
        // const fs = require('fs');
        // const mnemonic = fs.readFileSync(".secret").toString().trim();
    ii) Uncomment the lines under "module.exports = { ...", within section:
        "networks: { ..." ie.:
            // ropsten: {
                // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
                // network_id: 3,       // Ropsten's id
                // gas: 5500000,        // Ropsten has a lower block limit than mainnet
                // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
                // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
                // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
            // },
    iii) Register with Infura (https://infura.io) / login in
     iv) Configure a new project from the Infura dashboard: ie.
            - click 'Ethereum' (left-side menu)
            - click 'Create New Project'
            - enter project name: Kitty Masters
            - copy (infura) project secret and paste into truffle.config
                (as infuraKey string value, see i above)
            - copy (infura) project id and paste into truffle.config
                (over 'YOUR-PROJECT-ID', see ii above)
    b) Add truffle-config.js to the .gitignore file
        (IMPORTANT: So as not to put project secret onto GitHub!!)

16. Initial wallet and set .secret file
    (i.e. for HDWalletProvider defined in truffle-config.js)
    a. Install the wallet (using package.json - assumes npm is installed):
        $ npm install @truffle/hdwallet-provider --save
        (ie. @truffle/hdwallet-provider copied from truffle-config.js,
        see 15ai above)
        NOTE: --save option saves this into the package.json file
        so someone downloads the repository from GitHub then any --save
        packages will be installed automatically.
    b. Create .secret file (new file in the root project directory) and 
    paste into it mnuemonic seed phrase from MetaMask
    (Get seed phrase from MetaMask: With ROPSTEN network selected, via 
    settings, security, show seed phrase.)
    c. IMPORTANT: Add .secret to .gitignore

17. Add test Rospten ETH to my MM wallet, using faucet:
    https://faucet.dimensions.network/
    (My Account 12 & 13 now each has 5 ETH Ropsten, but then transfered
    1 ETH into Account 1 from Account 13, since Account 1 will be used
    (by default) for the deployment(from which gas will need to be paid)

18. Deploy to the Ropsten network, using truffle consile, ie.
    $ truffle console --network ropsten
    truffle(ropsten)> migrate

    Note: With VPN on it failed to migrate when it execued 2_token_migration.js,
    with the following error output:

        Compiling your contracts...
        ===========================
        > Everything is up to date, there is nothing to compile.

        Starting migrations...
        ======================
        > Network name:    'ropsten'
        > Network id:      3
        > Block gas limit: 22668699 (0x159e59b)

        2_token_migration.js
        ====================
        /Users/Mark/Documents/BlockChain/IvanOnTechAcademy/Bootcamp/KittyMasters/node_modules/safe-event-emitter/index.js:74
            throw err
            ^

        Error: PollingBlockTracker - encountered an error while attempting to update latest block:
        Error: ESOCKETTIMEDOUT
            at ClientRequest.<anonymous> (/Users/Mark/Documents/BlockChain/IvanOnTechAcademy/Bootcamp/KittyMasters/node_modules/request/request.js:816:19)
            at Object.onceWrapper (events.js:421:28)
            at ClientRequest.emit (events.js:315:20)
            at TLSSocket.emitRequestTimeout (_http_client.js:784:9)

            etc, etc.
        
    See for potential solutions to this issue: https://github.com/trufflesuite/truffle/issues/3356
    RESOLVED for me by switching off my VPN.
    Summary for migration:
    =======
    > Total deployments:   5
    > Final cost:          0.008366625871716212 ETH


    FULL DEPLOYMENT DETAILS:

        truffle(ropsten)> migrate

        Compiling your contracts...
        ===========================
        > Everything is up to date, there is nothing to compile.



        Starting migrations...
        ======================
        > Network name:    'ropsten'
        > Network id:      3
        > Block gas limit: 22020126 (0x150001e)


        2_token_migration.js
        ====================

        Deploying 'KittyContract'
        -------------------------
        > transaction hash:    0xf77cbb464ad01c36992517cbe0f556f8b860f7f759584d13a491525cb8950acd
        > Blocks: 2            Seconds: 12
        > contract address:    0xe9F881eFcB894cF16c20DB1020693FeBC7974Fe1
        > block number:        10515046
        > block timestamp:     1624702992
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             0.995748253503913583
        > gas used:            3913583 (0x3bb76f)
        > gas price:           1.009999999 gwei
        > value sent:          0 ETH
        > total cost:          0.003952718826086417 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 10515049)
        > confirmation number: 2 (block: 10515050)

        Deploying 'ProxyAdmin'
        ----------------------
        > transaction hash:    0x7322431ea983d12eb1eb08e814249e96ced0be15294c07db7c4b662f459ea2c5
        > Blocks: 0            Seconds: 12
        > contract address:    0x3f62AbF91e53123077e069022694f98c5eC4dF6a
        > block number:        10515051
        > block timestamp:     1624703041
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             0.995259393304397603
        > gas used:            484020 (0x762b4)
        > gas price:           1.009999999 gwei
        > value sent:          0 ETH
        > total cost:          0.00048886019951598 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 10515053)
        > confirmation number: 2 (block: 10515054)

        Deploying 'TransparentUpgradeableProxy'
        ---------------------------------------
        > transaction hash:    0x3409384b619c3b3faaba79eaaf0c8d02e22c92a34ebd35775029ee7da964600d
        > Blocks: 1            Seconds: 8
        > contract address:    0xd25e3d27344284A6637EbC124831beE0fc86432b
        > block number:        10515055
        > block timestamp:     1624703084
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             0.994238576205408313
        > gas used:            1010710 (0xf6c16)
        > gas price:           1.009999999 gwei
        > value sent:          0 ETH
        > total cost:          0.00102081709898929 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 10515056)
        > confirmation number: 2 (block: 10515057)

        > Saving migration to chain.
        > Saving artifacts
        -------------------------------------
        > Total cost:     0.005462396124591687 ETH


        3_market_migration.js
        =====================

        Deploying 'KittyMarketplace'
        ----------------------------
        > transaction hash:    0x52721458ee06198a1ba3160274c7bc875380d50faa04784cad207c0bd6780ead
        > Blocks: 0            Seconds: 4
        > contract address:    0x090A2baC4DA5852600aCF998a97e88211A1B898b
        > block number:        10515062
        > block timestamp:     1624703139
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             0.991978988047645529
        > gas used:            2208403 (0x21b293)
        > gas price:           1.009999999 gwei
        > value sent:          0 ETH
        > total cost:          0.002230487027791597 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 10515063)
        > confirmation number: 2 (block: 10515064)

        Deploying 'TransparentUpgradeableProxy'
        ---------------------------------------
        > transaction hash:    0x0703e0f0c6049ba203043a54e03845d90d84da09024209212b555698ff6a826a
        > Blocks: 1            Seconds: 4
        > contract address:    0x33018792B8eb4022bD60650928c3CBd59cefA912
        > block number:        10515066
        > block timestamp:     1624703170
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             0.991305245328312601
        > gas used:            667072 (0xa2dc0)
        > gas price:           1.009999999 gwei
        > value sent:          0 ETH
        > total cost:          0.000673742719332928 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 10515067)
        > confirmation number: 2 (block: 10515068)

        > Saving migration to chain.
        > Saving artifacts
        -------------------------------------
        > Total cost:     0.002904229747124525 ETH


        Summary
        =======
        > Total deployments:   5
        > Final cost:          0.008366625871716212 ETH


        - Blocks: 0            Seconds: 0
        - Blocks: 0            Seconds: 0
        - Blocks: 0            Seconds: 0
        - Saving migration to chain.
        - Blocks: 0            Seconds: 0
        - Blocks: 0            Seconds: 0
        - Saving migration to chain.

        truffle(ropsten)> 

19. Connect our website (front-end) to the contracts on the Ropsten Testnet
    a. Copy our 'TransparentUpgradeableProxy' contract addresses for our
    KittyContract and the KittyMarketplace contract (from Truffle console 
    output) and paste these addresses into the address constants in:
    client/assets/contractInterface/interface.js file, ie.

        const KITTY_CONTRACT_ADDRESS = "0xd25e3d27344284A6637EbC124831beE0fc86432b"
        const MARKETPLACE_ADDRESS = "0x33018792B8eb4022bD60650928c3CBd59cefA912"

    b. Commit all changes to git and gitHub (for steps 14-19 above).  Upon GitHub
    commit () this should trigger an (automatic) update to our website code
    (hosted by netify). And we should now be able to use our Kitty Masters website:
    https://reverent-mirzakhani-acd298.netlify.app
    With our deployed contracts (on Ropsten network) and our MetaMask (Ropsten)
    wallet.
    [   Note The Truffle accounts[]0 will be the contract owner (and will have
        the access to the Kitty-Factory to create new Gen0 kitties). From
        truffle console we can find the accounts that are available:
            truffle(ropsten)> accounts
            [
            '0x55ebCd51fb6ca806889d9632b03c6d8b6738742f',
            '0x6323e230aA62d473B7ebBE987F547D2305A7d062',
            '0x1CB34ecE74DE387dF91706e2F2A59F6fF85E4e49',
            '0x65f6c9DDbC3BEae63C8967c5ED40dD26d0944467',
            '0x4afA3515D1453177a5662DAE2dF75919620D8C0d',
            '0x9d8E58BAe55126480Bc1cbd561190267c39C4C2a',
            '0x637867dfDDDFD61aEE4C64BE0E67c51dF214206B',
            '0x6Ad1F76Fa4d261E1615e010C2f1AcfeB0DAf38eB',
            '0xAA1f34c4C24bFb2D8447E57C4E4B5931752Ab151',
            '0x5a095175bcde85b66A5447a6CBC5D616D0AF412a'
            ]
            truffle(ropsten)> 

        To change the accounts[0] default address that truffle uses for
        deployment, add the alternative default address to truffle-config.js
        file (within the Ropsten network configuration object), ie. Add:
            from: "ADDRESS"
        with ADDRESS being the address to be used as the default account
        (ie. one of the truffle accounts listed above).  See commentted-out
        line (added to truffle-config.js)
    ]

    NOTE: MetaMask didn't connect upon completining the above steps and then
    opening the website (https://reverent-mirzakhani-acd298.netlify.app).
    I traced this to an issue in initiateConnection() function in the file 
    client/assets/contractInterface/interface.js
    The User was not being set to an account (accounts[0]) because the 
    following line was returning an empty accounts array:
        let accounts = await window.ethereum.request({ method: 'eth_accounts' })
    Despite reseting MetMask account (under settings->Advanced), restarting 
    my Mac etc. I repeatidly got the same error.  I also used the browser  
    console to enter the above line manually which also resulted in an empty 
    accounts array. However, while experimenting with trying to get the 
    accounts to return, I entered the following command (not used in my code)
    into the browser console:
        web3.eth.requestAccounts().then(console.log);
    MM immediately asked for permission to connect and then sucessfully
    connected to the website - all now functioning correctly!?  Stranger still
    I was unable to reproduce the initial empty accounts array issue - I closed
    the browser tab, reset my MM account, restarted my Mac, logged back into MM
    and brought back up the website in a new tab).  Therefore, I currently
    don't know what the underlying issue was with web3/MM or why the above 
    command entered via the console (but not used in the code) resolved the 
    issue!?

20. Minor refactor of secret file reading
    a. Amend truffle-config.js, to read projectId from secret json file
    b. Amend .secret file to use json format (and rename secrets.json)

21. Minor refactor of website's getting of user's wallet account
    Now uses:
        let accounts = await web3.eth.getAccounts()
    Instead of:
        let accounts = await window.ethereum.request({method: 'eth_accounts'})
    The window.ethereum.request call may have been a factor in the issue 
    experienced where accounts were being requrned as a empty array (see
    NOTE under 19 above).
    [ Background Source for conencting to testnet:
        https://docs.openzeppelin.com/learn/connecting-to-public-test-networks
    ]


GNOSIS SAFE AS THE ADMINISTRATOR OF OUR CONTRACTS PROXYADMIN
(Allowing the owners of the 'Gnosis Safe' to make contract upgrades) 

Guide: "Transfer control of upgrades to a Gnosis Safe": 
https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-truffle/3579

Note: Gnosis Safe is not currently on Ropsten but only Rinkerby (and Mainnet).
    Therefore first I need to deploy a version of KittyMasters contracts to
    the Rinkerby testnet. See step 23 below (ie. after we set up Gnosis safe).

22. Create a Gnosis Safe for ourselves on Rinkerby network
    Follow the steps below, as given in this article:
    https://help.gnosis-safe.io/en/articles/3876461-create-a-gnosis-safe-account
    (NB don't create on mainnet, instead use link below for Rinkerby network)
    a. Obtained 3 (Rinkeby) Test ETH for Account1: https://faucet.rinkeby.io/
    b. Open the web app at https://rinkeby.gnosis-safe.io
    c. Connect wallet (in app), ie. connect to MetaMask (on Rinkerby network)
    d. Create safe controlled by 3 user accounts:
        i) Name of Safe: 'KittyMasters-Rinkeby'
        ii) Owners:
            1. MM Account1: 0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
            2. MM Account2: 0x6323e230aA62d473B7ebBE987F547D2305A7d062
            3. MM Account3: 0x4afA3515D1453177a5662DAE2dF75919620D8C0d
        iii) Any transaction requires: 2 out 3 owners
        iv) Create safe, address: 0x7bE70cbBED2b059fa6231AB7918C4F101169B607
    Access via:
    https://rinkeby.gnosis-safe.io/app/#/safes/0x7bE70cbBED2b059fa6231AB7918C4F101169B607


23. Testnet Deployment to Rinkeby, using existing Infura KittyMasters project
    a. Add an entry for the rinkeby network into the truffle.config.js file
    (that will use same infura project id and MM wallet seed phrase), ie.

        rinkeby: {
            provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${projectId}`),

            network_id: 4,       // Rinkeby's id
            gas: 5500000,        // Ropsten has a lower block limit than mainnet
            confirmations: 2,    // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets )
            // from: "ADDRESS"     // To specify a different default account (instead of truffle's accounts[0])
        },

    b. Switch off VPN to avoid migrate throw / PollingBlockTracker error
        (as also experiecned under 18 above)
    c. Deploy to the Rinkeby network, using truffle consile, ie.
        $ truffle console --network rinkeby
        truffle(rinkeby)> migrate

        Compiling your contracts...
        ===========================
        > Everything is up to date, there is nothing to compile.

        Starting migrations...
        ======================
        > Network name:    'rinkeby'
        > Network id:      4
        > Block gas limit: 10019366 (0x98e226)


        2_token_migration.js
        ====================

        Deploying 'KittyContract'
        -------------------------
        > transaction hash:    0xe6d52a09b4723168e91b17b5a7db68d21d6beb034707f965d084840ae263ffc3
        > Blocks: 3            Seconds: 40
        > contract address:    0x3f62AbF91e53123077e069022694f98c5eC4dF6a
        > block number:        8842261
        > block timestamp:     1624870600
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             2.995466673
        > gas used:            3913583 (0x3bb76f)
        > gas price:           1 gwei
        > value sent:          0 ETH
        > total cost:          0.003913583 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 8842262)
        > confirmation number: 2 (block: 8842263)

        Deploying 'ProxyAdmin'
        ----------------------
        > transaction hash:    0x60778d605ee1532d4da8c9a3e568427d2fa0e04540bba1d824802c6a02cffb90
        > Blocks: 0            Seconds: 8
        > contract address:    0xd25e3d27344284A6637EbC124831beE0fc86432b
        > block number:        8842264
        > block timestamp:     1624870645
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             2.994982653
        > gas used:            484020 (0x762b4)
        > gas price:           1 gwei
        > value sent:          0 ETH
        > total cost:          0.00048402 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 8842265)
        > confirmation number: 2 (block: 8842266)

        Deploying 'TransparentUpgradeableProxy'
        ---------------------------------------
        > transaction hash:    0xeb6caf4c2ef1fa6aff422fdcea229edeb2d99bbc958cf6508ff7bab967d3cbbf
        > Blocks: 2            Seconds: 40
        > contract address:    0xE52b75B7201C8AcDa96407f92Ba27ab2ce252ae1
        > block number:        8842269
        > block timestamp:     1624870720
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             2.993971943
        > gas used:            1010710 (0xf6c16)
        > gas price:           1 gwei
        > value sent:          0 ETH
        > total cost:          0.00101071 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 8842270)
        > confirmation number: 2 (block: 8842271)

        > Saving migration to chain.
        > Saving artifacts
        -------------------------------------
        > Total cost:         0.005408313 ETH


        3_market_migration.js
        =====================

        Deploying 'KittyMarketplace'
        ----------------------------
        > transaction hash:    0x5b3125bbefc27875befc4caf60b468aaafc89f19922594f9b88e6aa585539757
        > Blocks: 1            Seconds: 24
        > contract address:    0x33018792B8eb4022bD60650928c3CBd59cefA912
        > block number:        8842275
        > block timestamp:     1624870810
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             2.991734727
        > gas used:            2208403 (0x21b293)
        > gas price:           1 gwei
        > value sent:          0 ETH
        > total cost:          0.002208403 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 8842276)
        > confirmation number: 2 (block: 8842277)

        Deploying 'TransparentUpgradeableProxy'
        ---------------------------------------
        > transaction hash:    0x2a79a7ae28d23e70b841ce39d47fedc54de0333edebee45703c5eebd109a3fbf
        > Blocks: 0            Seconds: 8
        > contract address:    0x823c8b731B3e07A9310853de418F54FeE22f76b1
        > block number:        8842278
        > block timestamp:     1624870855
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             2.991067643
        > gas used:            667084 (0xa2dcc)
        > gas price:           1 gwei
        > value sent:          0 ETH
        > total cost:          0.000667084 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 8842279)
        > confirmation number: 2 (block: 8842280)

        > Saving migration to chain.
        > Saving artifacts
        -------------------------------------
        > Total cost:         0.002875487 ETH


        Summary
        =======
        > Total deployments:   5
        > Final cost:          0.0082838 ETH


        - Blocks: 0            Seconds: 0
        - Blocks: 0            Seconds: 0
        - Blocks: 0            Seconds: 0
        - Saving migration to chain.
        - Blocks: 0            Seconds: 0
        - Blocks: 0            Seconds: 0
        - Saving migration to chain.

        truffle(rinkeby)> 

    d) Confirm accounts are as expected (same as in MM wallet):

        truffle(rinkeby)> let accounts = await web3.eth.getAccounts()
        undefined
        truffle(rinkeby)> accounts
        [
        '0x55ebCd51fb6ca806889d9632b03c6d8b6738742f',
        '0x6323e230aA62d473B7ebBE987F547D2305A7d062',
        '0x1CB34ecE74DE387dF91706e2F2A59F6fF85E4e49',
        '0x65f6c9DDbC3BEae63C8967c5ED40dD26d0944467',
        '0x4afA3515D1453177a5662DAE2dF75919620D8C0d',
        '0x9d8E58BAe55126480Bc1cbd561190267c39C4C2a',
        '0x637867dfDDDFD61aEE4C64BE0E67c51dF214206B',
        '0x6Ad1F76Fa4d261E1615e010C2f1AcfeB0DAf38eB',
        '0xAA1f34c4C24bFb2D8447E57C4E4B5931752Ab151',
        '0x5a095175bcde85b66A5447a6CBC5D616D0AF412a'
        ]
        truffle(rinkeby)> 

24. Transfer control of contract upgrades to Gnosis Safe (KittyMasters-Rinkeby)
    (ie. change the owner of the proxy's Admin contract from the truffle
    deployer (acccounts[0]) to our Gnosis Safe contract)
    a. Write migration script to transfer control of the (rinkeby) proxyAdmin 
        to our (rinkeby) Gnosis Safe, see new migrations file:
        '4_transfer-ownership_proxyAdmin.js'
    b. Execute script to transfer proxyAdmin ownership to our 'Gnosis Safe'
        contract (at 0x7bE70cbBED2b059fa6231AB7918C4F101169B607), ie.

        $ npx truffle migrate --network rinkeby

        Compiling your contracts...
        ===========================
        > Everything is up to date, there is nothing to compile.

        Starting migrations...
        ======================
        > Network name:    'rinkeby'
        > Network id:      4
        > Block gas limit: 10000000 (0x989680)

        4_transfer_ownership_proxyAdmin.js
        ==================================
        ✔ 0xE52b75B7201C8AcDa96407f92Ba27ab2ce252ae1 (transparent) proxy ownership transfered through admin proxy
        ✔ 0x823c8b731B3e07A9310853de418F54FeE22f76b1 (transparent) proxy ownership transfered through admin proxy
        Transfered ProxyAdmin ownership to 'Gnosis Safe' on rinkeby.
        (Rinkeby) Gnosis Safe' address: 0x7bE70cbBED2b059fa6231AB7918C4F101169B607

        > Saving migration to chain.
        -------------------------------------
        > Total cost:                   0 undefined

        Summary
        =======
        > Total deployments:   0
        > Final cost:          0 

25. Deploy the V2 contract implementations (on Rinkeby) of the
    KittyContract and the KittyMarketplace (in prep for upgrade)
    a. Write migrations for each new (V2) contract, that validates and
    deploys the V2 contracts, using truffle-upgrades' prepareUpgrade().
    See new migration files:
        5_prepare_upgrade_kittyContractV2.js
        6_prepare_upgrade_kittyMarketplaceV2.js
    b. Execute these migration to deploy the V2 contracts:
        $ npx truffle migrate --network rinkeby

        Compiling your contracts...
        ===========================
        > Everything is up to date, there is nothing to compile.


        Starting migrations...
        ======================
        > Network name:    'rinkeby'
        > Network id:      4
        > Block gas limit: 10000000 (0x989680)


        5_prepare_upgrade_kittyContractV2.js
        ====================================

        Deploying 'KittyContractV2'
        ---------------------------
        > transaction hash:    0x8996e34776a74da7c6438f4897c85608618c1b504bb916a0d7c677c4431bf5bc
        > Blocks: 1            Seconds: 16
        > contract address:    0x7d519941ecC45FD3b27571594d9385B2C68f67D8
        > block number:        8844569
        > block timestamp:     1624905256
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             2.986720333
        > gas used:            4261014 (0x410496)
        > gas price:           1 gwei
        > value sent:          0 ETH
        > total cost:          0.004261014 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 8844570)
        > confirmation number: 2 (block: 8844571)

        > Saving migration to chain.
        > Saving artifacts
        -------------------------------------
        > Total cost:         0.004261014 ETH


        6_prepare_upgrade_kittyMarketplaceV2.js
        =======================================

        Deploying 'KittyMarketplaceV2'
        ------------------------------
        > transaction hash:    0x64d3cb35309e91daf17dbef18469b9d8324fc8008bc2a3f584835a2f42e56799
        > Blocks: 0            Seconds: 8
        > contract address:    0x749acc358F71f4207B228FFD7B805118CEd30be0
        > block number:        8844573
        > block timestamp:     1624905316
        > account:             0x55ebCd51fb6ca806889d9632b03c6d8b6738742f
        > balance:             2.984132811
        > gas used:            2558709 (0x270af5)
        > gas price:           1 gwei
        > value sent:          0 ETH
        > total cost:          0.002558709 ETH

        Pausing for 2 confirmations...
        ------------------------------
        > confirmation number: 1 (block: 8844574)
        > confirmation number: 2 (block: 8844575)

        > Saving migration to chain.
        > Saving artifacts
        -------------------------------------
        > Total cost:         0.002558709 ETH


        Summary
        =======
        > Total deployments:   2
        > Final cost:          0.006819723 ETH


26. How to upgrade contracts using Gnosis Safe
    [ Note: We're going to use Defender (as a layer above our "Gnosis Safe") to 
      upgrade our contracts.  However, this documents how to use "Gnosis Safe"
      directly to perform a contract upgrade (i.e. without Defender) ]
    a. Open up webpage to our "KittyMasters-Rinkeby" Gnosis Safe:
        https://rinkeby.gnosis-safe.io/app/#/safes/0x7bE70cbBED2b059fa6231AB7918C4F101169B607
    b. (optionally) Click on 'ADDRESS BOOK' (left-hand side menu) and
        'create entry' for the contract proxies, eg:
        KittyContractProxy: 0xE52b75B7201C8AcDa96407f92Ba27ab2ce252ae1
        KittyMarketplaceProxy: 0x823c8b731B3e07A9310853de418F54FeE22f76b1
    c. Click 'APPS' (lefthand-side menu on 'KittyMasters-Rinkeby' Gnosis Safe page)
    d. Click on 'OpenZeppelin' app, that opens up an 'Upgrade a contract' page and enter:
         i. Contract address: <address of the proxy></address>
                                0xE52b75B7201C8AcDa96407f92Ba27ab2ce252ae1
                                <KittyContract's proxy address>
        ii. New implementation address: <address new implementation contract>
                                0x7d519941ecC45FD3b27571594d9385B2C68f67D8
                                <KittyContractV2's address>
        (Note address book doesn't work here- need to paste in actual addreses)
    e. Click 'Upgrade' to create a transaction and sign it with your
        connected Metamask wallet
    f. Once the transaction is created it will need to be confirmed by other
        owners of the Gnosis Safe 'KittyMasters-Rinkerby' to get 2/3 approvals 
        (before the transaction is submitted).  Such transactions awaiting
        confirmation can be viewed when clicking 'TRANSACTIONS (leftside-menu),
        and be confirmed or rejected.


DEFENDER ADMIN - Managing Upgrades

27. Add the KittyContract to Defender

Guide: "Workshop Recap: Managing Smart Contract Upgrades":
https://forum.openzeppelin.com/t/workshop-recap-managing-smart-contract-upgrades/7423

    a. Sign up for a defender, create an account and login:
        https://defender.openzeppelin.com
    b. Click 'Add a contract' and enter for the contract to be managed:
          i) Name: Give the proxy contract a name (any name),
                    e.g. "KittyContract (proxy)"
         ii) Network: Where the contract is deployed,
                in our case: 'Rinkeby'
        iii) Address of the proxy contract,
                in our case: 0xE52b75B7201C8AcDa96407f92Ba27ab2ce252ae1
                (ie. KittyContract's proxy address)
        iv) ABI: If contract has been verified on Etherscan then ABI will be
            pulled into Defender and displayed in the ABI text box. Otherwise,
            manually copy and paste the contract's ABI into the text box.
        
        Defender will analyse the contract, pulling information from etherscan
        including the contract's: 
        - ABI (if contract has previously been verified on etherscan),
        - if it's upgradeable and beneath this:
            - address of the current implementation contract,
            - address of the ProxyAdmin contract (for upgrades),
            - address of the controlling Gnosis Safe contract, and
        - if it is pausable, ie. ABI defines a pause() function.

        In our case Defender gives (under confirmation its upgradeable):
            ABI - Blank.  We must paste in contracts ABI since we haven't 
                verified our contract on etherscan - see see iv above and
                the note below on 'Verifying Smart Contracts'.
            Upgradeable (EIP1967) - confirmed; under which we have:
                Current implementation address:
                0x3f62AbF91e53123077e069022694f98c5eC4dF6a
                Upgrades proxy admin:
                0xd25e3d27344284A6637EbC124831beE0fc86432b
                Controlled by Gnosis Safe at:
                0x7bE70cbBED2b059fa6231AB7918C4F101169B607
            Not pausible - since no pause() function is defined in this version
                of the KittyContract.

        Note: Verifying Smart Contracts: Multi-file verification is recommended 
        (over creating a single flattened file) and can be performed with a
        truffle plugin, for details see:
        https://forum.openzeppelin.com/t/verify-smart-contract-inheriting-from-openzeppelin-contracts/4119
        Background on licencing and single or multi-file verification and licensing, see:
        https://forum.openzeppelin.com/t/solidity-0-6-8-introduces-spdx-license-identifiers/2859

        To view our contracts verification status:
        https://rinkeby.etherscan.io/address/0xe52b75b7201c8acda96407f92ba27ab2ce252ae1#code
        [ To manually verify: Select 'verify' (top left menu 'Misc' -> 'verify')
         and enter the requested details.]

           v) Click 'Add' to add the contract to Defender Admin

        The contract should now be displayed on its contract page (with space below
        the contract information where any proposals will be displyed).

28. Upgrade the KittyContract to KittyContractV2

    a. From Defender's KittyContract contract page, click '+ New Proposal' then
        select 'Upgrade', and complete the fields in the proposal form, ie:
        - New implementation address: 0x7d519941ecC45FD3b27571594d9385B2C68f67D8
            [ Note: Click on entered address to add to address book:
                'KittyContractV2 (implementation)'
            ]
        - Title: 'Upgrade KittyContract implementation to KittyContractV2'
        - Description: 'Add functionality to ....'
        And then click "Create Upgrade Proposal" (and confirm with MM), 
        which will display the proposal summary page (showing approval pending)
    b. Click 'Approve' (assuming MM is switched to one of the GnosisSafe
        owning accounts) and sign the message with MM (to provide the first of
        the 2/3 required approvals
    c. Switch MM Account to another owner account (Account2). From the Admin
        dashboard click on the 'Active proposal' for the Upgrade, then 
        click: 'Approve' (to provide second 2/3 required approvals)
    d. Click 'Execute' and sign the transaction with MM to execute it.
        The transaction will execute the upgrade!  Note: May check the
        trasaction on Etherscan - click the symbol next to the 'EXECUTED'
        label (above the proposal name) to view the transaction
    e.

    Note: This can also be done from a script using Defender upgrade plug-in
    (defender.proposeUpgrade(...) that uses Defender Admin API under the hood.

29. From Defender call KittContractV2 setVersion() function
        On how to do this (and issue I originally faced) refer to my posts here:
        https://forum.openzeppelin.com/t/new-admin-action-error-could-not-validate-transaction-cannot-estimate-gas-transaction-may-fail-or-may-require-manual-gas-limit/10582/9

30. Upgrade compiler version to 0.8.6, that eliminates the v0.8.5 compiler's
    bug of giving 'unreachable code' warnings.  Corrected a git/GitHub issue
    that was causeing a git clone and subsequent migrate to fail - see issue
    and solution detailed here: https://forum.openzeppelin.com/t/deployproxy-using-truffle-migrate-reset-errors-with-requested-contract-was-not-found/5349/6 


31. Refactor KittyContract to use OZ ERC721Upgradeable contracts function where
    appropropirate (instead of overriding them all and defining my own functions
    as is the current case)
    a. Refactor to use ERC721Upgradeable variables & functions for name()
        and symbol()
    b. Update supportsInterface() to call parent ERC721Upgradeable's
    supportInterface() function
    c. Add OZ ERC721EnumerableUpgradeable as inherrited contract
    d. Rename state variables (to be the same as OZ variable naming)
    e. Remove ERC721 standard functions and instead use OZ ERC721 functions
        (the OZ ERC721 functions are inheritted but currently overriden by
        my own functions developed under my Cryto-Kitties project)

32. Refactor website logic to:
    a. Remove remaining direct contract call (to KittyContract's
    createKittyGen0(dna) function.  Adding new createCat(dna) function
    to the interface.js
    b. Rename constants for proxy addreses (and delete redundant console output)

33. Refactor KittyContract's gen0Limit to become initializer parameter



___________________________________________________________________________________________________
**********************
COULD DO NEXT .... BUT WON"T UNDER THIS PROJECT
**********************

xx. Add the Marketplace contract to Defender (verifying contract first)

    a. Use the truffle plug-in to verify the Rinkerby deployed Marketplace
        contract, following the guide:
        https://forum.openzeppelin.com/t/verify-smart-contract-inheriting-from-openzeppelin-contracts/4119
        

    b. From the Defender Admin dashboard, repeat the steps from 27b (above)
        but this time adding the KittyContract.