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

    



    


 
