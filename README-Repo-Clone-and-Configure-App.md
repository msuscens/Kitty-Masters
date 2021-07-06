
HOW TO CLONE THE GITHUB REPO AND CONFIGURE APPLICATION TO RUN LOCALLY

1. Created a new local directory for the application (e.g. Kitty-Masters)

2. Open terminal and enter:
    $ cd <your Kitty-Masters directory>
    $ git clone https://github.com/msuscens/Kitty-Masters
    $ cd Kitty-Masters
    $ npm i
    $ npm install @truffle/hdwallet-provider --save

    Note on 'npm i' : May take several minutes to install.  You may get many 
        Warnings about depreciated packages and reported vulnerabilities.
        Ignore these warnings and carry on to the next step.

3. OPTIONALLY Load into VsCode: Open the VS code workspace file in .../Test-Repo-Pull/Kitty-Masters

4. Create a file: 'secrets.json', containing:
    {
        "projectId": "a78925685d7246ef89300dd57aee7c14",
        "mnemonic": "<Insert your MetaMask seed phrase here>"
    }

5. Open a new terminal window and start up ganache-cli, with the
    seed phrase of your choise.  E.g:

    $ ganache-cli -h 127.0.0.1 -p 8545 -m "<your choosen mneumonic seed phrase>"

    You should get:

    Ganache CLI v6.12.2 (ganache-core: 2.13.2)

        Available Accounts
        ==================
        (0) 0x........................................ (100 ETH)
        (1) 0x........................................ (100 ETH)
        (2) 0x........................................ (100 ETH)
        (3) 0x........................................ (100 ETH)
        etc (address will be specific to your mneumonic seed phrase)

        Private Keys
        ==================
        (0) 0x................................................................
        (1) 0x................................................................
        (2) 0x................................................................
        (3) 0x................................................................
        etc (private keys will be specific to your mneumonic seed phrase)

        etc, etc.

        Listening on 127.0.0.1:8545

    Note: You may use whatever mneumonic seed phrase that you desire for ganache-cli initiation.
    But if you haven't previously used this seed phrase and imported the first/some of the
    ganachie-cli accounts (private key) into your MetaMask as a new account (MM to be set to 
    Ganache-cli network) then you'll need to:
        i) import the generated private key from account[0] into your MetaMask (set to use the
        Ganchie-cli network).   Note gamache-cli's account[0] is the owner account for the contracts
        and when accessing the DAPP/website with this account the Kitty-Factory will be available to
        the user.  If MM is set to use a different account then the Kitty-Factory tab will not appear
        on the website)
        ii) Import a second ganache-cli generated account (private key) into another new MM account
        (note gamache-cli's account[0] will be the owner account)


6. Migrate the contracts
    $ truffle migrate --reset --network development

7. OPTIONALLY: Check that tests scripts run as expected:
    $ truffle test

    Note: These test will check that the contracts are upgradable.
    The tests of the contract's functionality are currently skipped
    (and hence are reported as pending). All other tests should pass,
    ie. there should be no reported fails.

8. Add the contract proxy address (output to console from the truffle migrate)
    into the file: Kitty-Masters/client/assets/contractInterface/interface.js
    ie. on lines 15 & 66:

    const LOCAL_KITTY_TOKEN_PROXY = "0x....................................."
    const LOCAL_MARKETPLACE_PROXY = "0x....................................."

    NB: These contract addresses can be found in the console output from the 
        migration.
        i) The first contract address is under '2_token_migration',
        under the sub-section: "Deploying 'TransparentUpgradeableProxy'"  
        Copy & past this contract address to LOCAL_KITTY_TOKEN_PROXY.
        ii) The second contract address is under '3_market_migration', again
        under the sub-section: "Deploying 'TransparentUpgradeableProxy'".
        Copy & past this contract address to LOCAL_MARKETPLACE_PROXY.

9. Start up a local server.  For example:
    Use VSCode to start up 'Live Server' (by clicking 'Go Live'), 
    (Alternatively start a python server: $ python3 -m http.server)

10. Open MetaMask and switch to Ganache-cli network
    (Thius assumes that you have MetaMask browser plugin installed for
    Chrome or Firefox) and it's configured for ganache-cli network (that
    you've started in a terminal window - under step 5 above).

11. Invoke index.html file (e.g. in VSCode right click the file and select 
    'Open with LiveServer').  The homepage of the app should now open in
    your browser.  MetaMask (assuming it's withed to the local Network:
    ganace-cli) should connect to the website site.

    Troubleshhoting if MetaMask doesn't connect:
    Open the browser console and check the output - if it hasn't
    connected to the (private) network, with contract addresses and
    User address output, then try entering the following into the
    browser console to see if it makes MM connect:
    window.ethereum.enable().then(async function(accounts){consol.log(accounts)}


