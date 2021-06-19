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


 
