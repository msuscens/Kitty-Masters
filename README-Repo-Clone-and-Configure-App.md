
HOW TO CLONE REPO, SWITCH TO DRAGONS BRANCH AND CONFIGURE DAPP TO RUN LOCALLY

1. Created a new local directory for the application (e.g. Dragon-Masters)

2. Open terminal and enter:
    $ cd <your Dragon-Masters directory>
    $ git clone https://github.com/msuscens/Kitty-Masters
    $ cd Kitty-Masters
    $ git checkout dragons
    $ npm i
    $ npm install @truffle/hdwallet-provider --save

    Note on 'npm i' : May take several minutes to install.  You may get many 
        Warnings about depreciated packages and reported vulnerabilities.
        Ignore these warnings and carry on to the next step.

3. OPTIONALLY Load into VSCode (i.e. open the DragonMasters.code-workspace file)

4. Open a new terminal window and start up ganache-cli, with the
    seed phrase of your choice.  It's reccomended that we all use the same 
    ganache-cli seed phrase (see below) so that we each generate the same
    account numbers and upon first migrate the same contract addresses.
    This means that we don't each have to update interface.js PROXY address
    constants (see step 7 below) each time we pull down the interface.js file.

    $ ganache-cli -h 127.0.0.1 -p 8545 -m "quick brown fox jumped over the lazy dog"

    You should get:

    Ganache CLI v6.12.2 (ganache-core: 2.13.2)

        Available Accounts
        ==================
        (0) 0xfC1d4eA100c57A6D975eD8182FaAcFD17871a1e4 (100 ETH)
        (1) 0x68F8F71A19b06d425edD180A6Bd9a741CA3C485C (100 ETH)
        (2) 0xd9B822DA7B6f936f85114A5d2D1584741751cb22 (100 ETH)
        etc (address will be specific to ganache-cli mneumonicseed phrase used)

        Private Keys
        ==================
        (0) 0xc7ae89b0f36d2298fe70667153838092abd2fb77d0aa83e97852f45e982db0d7
        (1) 0x0db70481234d0630777bfda324208170712ffca56db40024d26c6e4354500827
        (2) 0xaab894296c415ce2327c59a57e2835bb9465a7614ec5a264dfebe26d453ff881
        etc (private keys will be specific to ganache mneumonic seed phrase)

        etc, etc.

        Listening on 127.0.0.1:8545

    Note: If you haven't previously used this seed phrase and imported at least
     one of the ganachie-cli accounts (private key) into your MetaMask as a new
     account then you'll need to:
        i) import the generated private key from account[0] into your MetaMask
        (set to use the Ganchie-cli network).
        Note ganache-cli's account[0] is the owner account for the contracts
        and when accessing DAPP/website with this account the "Kitty-Factory"
        (on legacy UI) will be available to the user.  If MM is set to use a
        different account then the "Kitty-Factory" tab will not appear on UI).
        ii) Import a second ganache-cli generated account (private key) into
        another MM account.  Useful for testing UI as a user that is not the
        contract owner.

5. Migrate the contracts
    $ truffle migrate --reset

6. Check that tests scripts run as expected:
    $ truffle test

    Note: These test will check that the contracts are upgradable.
    Some tests of the contract's functionality are currently skipped
    as they are unimplemented (and hence are reported as pending).
    All other tests should pass, ie. no reported test fails.

7. Add the contract proxy address (output to console from the truffle migrate)
    into the file: DragonMasters/client/assets/contractInterface/interface.js
    ie. on lines 15 & 66:

    const LOCAL_DRAGON_TOKEN_PROXY = "0x....................................."
    const LOCAL_MARKETPLACE_PROXY = "0x....................................."

    NB: These contract addresses can be found in the console output from the 
        migration.
        i) The first contract address is under '2_dragon_token_migration',
        under the sub-section: "Deploying 'TransparentUpgradeableProxy'"  
        Copy & past this contract address to LOCAL_DRAGON_TOKEN_PROXY.
        ii) The second contract address is under '3_marketplace_migration',
        again under sub-section: "Deploying 'TransparentUpgradeableProxy'.
        Copy & past this contract address to LOCAL_MARKETPLACE_PROXY.

8. Start up a local server.  For example:
    Use VSCode to start up 'Live Server' (by clicking 'Go Live'), 
    (Alternatively start a python server: $ python3 -m http.server)

9. Open MetaMask and switch to Ganache-cli network
    (This assumes that you have MetaMask browser plugin installed for
    Chrome or Firefox) and it's configured for local ganache-cli network 
    (that you've started in a terminal window - under step 4 above).

10. Invoke index.html file (e.g. in VSCode right click the file and select 
    'Open with LiveServer').  The homepage of the app should now open in
    your browser.  MetaMask (assuming it's set to the local network:
    ganace-cli) should connect to the website site.

    NOTE: Troubleshoting if MetaMask doesn't connect:
    Open the browser console and check the output - if it hasn't
    connected to the (private) network, with contract addresses and
    User address output, then try entering the following into the
    browser console (to see if it makes MM connect):

    window.ethereum.enable().then(async function(accounts){console.log(accounts)})
    OR:
    web3.eth.requestAccounts().then(console.log)
    
    MM will hopefully then respond by asking you for confirmation of
    connection/access and then connect to the website.
