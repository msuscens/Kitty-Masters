KITTY MASTERS

PROJECT AIM:

A conversion of my CryptoKitties-Clone project so that the contracts are
upgradable and pausable.  Specific updates to my CryptoKitties-Clone 
contract code will be to:

i) Convert contract code to Solidity v0.8.5

ii) Convert each contract to make them 'upgradeable' by employing the 
OpenZeppelein 'transaparent proxy' pattern and associated openeZeppelin
upgradable contract library

iii) Add the (OpenZeppelin) 'pausable' capability to each contract, so
that the 'pausable' modifiers can be applied to functions as required

iv) Add some basic Truffle test scripts to each contract (to support
this development work)

v) Stretch goal (if time permits): 
    a) Deploy to a testnet
    b) Employ 'Gnosis Safe' to hold each (proxy contratcs) Admin contract
    c) Set up Defender to help manage the Dev/Sec Ops of the contracts

Once complete this project will then form a basis (base upgradeable/pausable
contract) for the planned 'Dragon Masters' project (ie. a team project that 
will follow on form this one).

Note: Kitty Masters will not add further user functionality (above that already 
present in my CryptoKitties-Clone project) and will employ the same UI.
(https://github.com/msuscens/CryptoKitties-Clone)



RECORD OF IMPLEMENTAION STEPS
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

5. Update to use (latest) OpenZeppelin contracts
    a. Install OpenZeppelin contracts (v4.1.0):
        $ npm install @openzeppelin/contracts
    b. Replace local versions of IERC721.sol, IERC721Receiver.sol, and
        Ownable.sol (in KittyMasters/contracts) with @openZeppelin versions
        of each of these interfaces/contracts (in the directory:
        node_modules/@openzeppelin/contracts).
        This required improving (correcting!) the inherritence structure 
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
    b. Test structure for functionality - specific test not yet written
    c. Tests for upgrade (commented-out/skipped until contract refactored)
    Note: To link libraries to contracts within my Truffle Test script, used
    the method given here:
    https://forum.openzeppelin.com/t/trouble-linking-library-contracts-with-openzeppelin-test-environment/2235/3

7. Refactor KittyContract to an upgradeable contract
   (i.e. to follow OpenZeppelin's "transparent upgradeable proxy" pattern)
    a. Replace constructor with 'initialize()' function, adding 'intializer'
        modifier (from OZ 'Initializable' base contract).  (And taking care
        to mannually call the initialzers of all parent contracts.)
    b. Reworked the KittyContract's inherritence hierarchy (and interface) to
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





 
