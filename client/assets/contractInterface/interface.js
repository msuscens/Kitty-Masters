// Contract Proxy Addresses for the KittyContract and Marketplace contracts
// Set each contract's proxy addresses below, ie.
//      Obtain proxy addresses from console upon performing :
//          truffle migrate --reset' --network <network type>
//      Eg. For local development network:
//          truffle migrate --reset' --network development
//
//      KittyContract's proxy contract address: Copy & paste from console output
//      under: '2_token_migration' and then under 'TransparentUpgradeableProxy'
//
//      KittyMarketplace's proxy contract address: Copy & paste from console 
//      under '3_market_migration' and then under 'TransparentUpgradeableProxy'
//
// Local Network (e.g. ganace-cli)
const LOCAL_KITTY_TOKEN_PROXY = "0xeC5712cCEFC64eBf00865fE3229dC3a7e7c17170"
const LOCAL_MARKETPLACE_PROXY = "0x05F7B04E8ED850A6377Cfdc7Bc19aFAa7404437E"

// Ropsten Network: ONLY UPDATE AFTER RE-DEPLOY TO ROPSTEN
const ROPSTEN_KITTY_TOKEN_PROXY = "0x702D6DB6630737CCFf48c69b55b70C6a39be51b1"
const ROPSTEN_MARKETPLACE_PROXY = "0x04e07e85B7FC67D61338446f66F56f470E60cBB0"
// const ROPSTEN_KITTY_TOKEN_PROXY = "0xd25e3d27344284A6637EbC124831beE0fc86432b"
// const ROPSTEN_MARKETPLACE_PROXY = "0x33018792B8eb4022bD60650928c3CBd59cefA912"

// Rinkeby Network: ONLY UPDATE AFTER RE-DEPLOY TO RINKEBY
const RINKEBY_KITTY_TOKEN_PROXY = "0xE52b75B7201C8AcDa96407f92Ba27ab2ce252ae1"
const RINKEBY_MARKETPLACE_PROXY = "0x823c8b731B3e07A9310853de418F54FeE22f76b1" 

const web3 = new Web3(Web3.givenProvider)
console.log("Web3 version: ", web3.version)

let Token_Proxy_Address
let Maketplace_Proxy_Address
let Instance_Of_KittyContract
let Instance_Of_Marketplace
let User

async function initiateConnection(){
    try {
        // Get (proxy) contract addresses for the (MetaMask connected) network
        const networkType = await web3.eth.net.getNetworkType()
        console.log(`Network detected: ${networkType}`)
        const proxies = getProxyAddresses(networkType)
        Token_Proxy_Address = proxies.tokenProxy
        Maketplace_Proxy_Address = proxies.marketplaceProxy

        // Get accounts from MetaMask
        const accounts = await web3.eth.getAccounts()
        if (accounts.length == 0) throw "Unable to get accounts from MetaMask!"
        User = accounts[0]

        // Connect to the (proxy) contracts
        Instance_Of_KittyContract = new web3.eth.Contract(abi.kittyContract, Token_Proxy_Address, {from: accounts[0]})
        if (Instance_Of_KittyContract.options.address == null) throw "Unable to connect to KittyContract proxy"
        Instance_Of_Marketplace = new web3.eth.Contract(abi.marketplace, Maketplace_Proxy_Address, {from: accounts[0]})
        if (Instance_Of_Marketplace.options.address == null) throw "Unable to connect to Marketplace proxy"

        console.log("Connected to KittyContract Proxy address:", Instance_Of_KittyContract.options.address)
        console.log("Connected to Marketplace Proxy address:", Instance_Of_Marketplace.options.address)
        console.log("Connected with user account:" + User)

        return true
    }
    catch (err) {
         console.log("Error from initiateConnection(): " + err)
         return false
    }
}

function getProxyAddresses(network) {
    try {
        let tokenProxy
        let marketplaceProxy

        switch (network) {
            case "private":  // Local network
                tokenProxy = LOCAL_KITTY_TOKEN_PROXY
                marketplaceProxy = LOCAL_MARKETPLACE_PROXY
                break
            case "rinkeby":
                tokenProxy = RINKEBY_KITTY_TOKEN_PROXY
                marketplaceProxy = RINKEBY_MARKETPLACE_PROXY
                break
            case "ropsten":
                tokenProxy = ROPSTEN_KITTY_TOKEN_PROXY
                marketplaceProxy = ROPSTEN_MARKETPLACE_PROXY
                break
            case "main":
                throw "Not currently supported on Ethereum main net!"
            default:
                throw `Unknown Ethereum network type: ${networkType}!`
        }
        return {tokenProxy, marketplaceProxy}
    }
    catch (err) {
        console.log("Error from getProxyAddresses: " + err)
    }
}


function isUser(address) {
    try {
        if (String(address).toLowerCase() !== String(User).toLowerCase()) return false
        return true
    }
    catch (err) {
        console.log("Error from isUser(address): " + err)
    }
}


// KittyContract Events

function onBirthEvent(uiCallbackFunc) {
    Instance_Of_KittyContract.events.Birth().on('data', function(event){
        uiCallbackFunc(event.returnValues)
    })
    .on('error', function(error, receipt) {
        console.log("Birth Event Error:")
        console.log("error:", error)
        console.log("receipt:", receipt)
    })
}


// KittyContract Interface functions

async function isOwnerOfKittyContract() {
    try {
        let isOwner; 
        await Instance_Of_KittyContract.methods.owner().call({}, function(err, contractOwner){
            if (err) throw "Error from owner().call(): " + err
            isOwner = String(contractOwner).toLowerCase() === String(User).toLowerCase()
        })
        return isOwner
    }
    catch (error) {
        console.log("In isOwnerOfKittyContract(): " + error)
    }
}


async function getAllYourCatIds() {
    try {
        let catIds = []
        await Instance_Of_KittyContract.methods.getAllYourKittyIds().call({}, function(err, idsTokens){
            if (err) throw "Error from getAllYourKittyIds().call(): " + err
            catIds = idsTokens
        })
        return catIds
    }
    catch (error) {
        console.log("In getAllYourCatIds(): " + error)
    }
}


async function getDetailsAllCats(catIds) { 
    try {
        let allCats = []
        for (let i = 0; i < catIds.length; i++) {
            const cat = await getCatDetails(catIds[i])
            allCats.push(cat)
        }
        return allCats
    }
    catch (error) {
        console.log("Error from getDetailsAllCats(catIds): " + error)
    }
}


async function getCatDetails(catId) {
    try {
        const cat = {
            id: catId,
            genes: undefined,
            gen: undefined,
            mumId: undefined,
            dadId: undefined,
            birthTime: undefined,
            dna: undefined  // added dna object (required by front-end)
        }

        await Instance_Of_KittyContract.methods.getKitty(catId).call({}, function(errMsg, kitty){
            if (errMsg) throw "Error from getKitty(catId).call(): " + errMsg
            cat.genes = kitty.genes
            cat.birthTime = kitty.birthTime
            cat.mumId = kitty.mumId
            cat.dadId = kitty.dadId
            cat.gen = kitty.generation
        })
        // Add further info as required by UI
        cat.dna = getKittyDna(cat.genes)

        return cat
    }
    catch (error) {
        console.log("Error from getCatDetails(catId): " + error)
    }
}


async function createCat(dna){
    try {
        await Instance_Of_KittyContract.methods.createKittyGen0(dna).send({}, function(err, txHash){
            if (err) throw "Error returned from 'Instance_Of_KittyContract.methods.createKittyGen0(dna).send({}': " + err
            else {
                console.log("createCats Tx:",txHash)
                return txHash
            }
        })
    }
    catch (error) {
        console.log("In createCat(): " + error)
    }        
}


async function breedCats(mumId, dadId){
    try {
        await Instance_Of_KittyContract.methods.breed(mumId, dadId).send({}, function(err, txHash){
            if (err) throw "Error returned from 'Instance_Of_KittyContract.methods.breed(mumId, dadId).send({}': " + err
            else {
                console.log("breedCats Tx:",txHash)
                return txHash
            }
        })
    }
    catch (error) {
        console.log("In breedCats(): " + error)
    }        
}



// Marketplace Contract Events

function onMarketplaceEvent(uiCallbackFunc) {
    Instance_Of_Marketplace.events.MarketTransaction().on('data', function(event){
        uiCallbackFunc(event.returnValues)
    })
    .on('error', function(error, receipt) {
        console.log("Market Transaction Event Error:")
        console.log("error:", error)
        console.log("receipt:", receipt)
    })
}


// Marketplace Contract Interface functions

async function getAllCatIdsOnSale() {
    try {
        let catIdsOnSale = []
        await Instance_Of_Marketplace.methods.getAllTokenOnSale().call({}, function(err, idsTokensOnSale){
            if (err) throw "Error from getAllTokenOnSale().call(): " + err
            catIdsOnSale = idsTokensOnSale
        })
        return catIdsOnSale
    }
    catch (error) {
        console.log("In getAllCatIdsOnSale(): " + error)
    }
}


async function getDetailsOfAllCatsForSale(catIds) {
    try {
        let allCatsForSale = []

        for (let i = 0; i < catIds.length; i++) {
            const cat = await getCatDetails(catIds[i])
            const forSale = await getForSaleDetails(catIds[i])
            const catForSale = {...cat, ...forSale}
            allCatsForSale.push(catForSale)
        }
        return allCatsForSale
    }
    catch (error) {
        console.log("Error from getDetailsOfAllCatsForSale(catIds): " + error)
    }
}


async function isCatOnSale(catId) {
    try {
        let isOnSale
        await Instance_Of_Marketplace.methods.isTokenOnSale(catId).call({}, function(errMsg, onSale){
            if (errMsg) throw new Error(errMsg)
            isOnSale = onSale
        })
        return isOnSale
    }
    catch (error) {
        console.log("Error from isCatOnSale(catId): " + error)
        console.log("Defaulting to returning false ... continuing")
        return false
    }
}


async function getForSaleDetails(catId) {
    try {
        const forSaleDetails = {
            id: undefined,
            sellerAddress: undefined,
            priceInWei: undefined,
            active: undefined,
            price: undefined
        }

        await Instance_Of_Marketplace.methods.getOffer(catId).call({}, function(errMsg, offer){
                if (errMsg) throw new Error(errMsg)
                if (catId != offer.tokenId ) throw new Error(`Internal error - tokenId (${offer.tokenId}) returned by getOffer(catId) doesn't match catId (${catId})!?`)

                forSaleDetails.id = offer.tokenId
                forSaleDetails.sellerAddress = offer.seller
                forSaleDetails.priceInWei = offer.price
                forSaleDetails.active = offer.active

                // Convert wei price to ether
                forSaleDetails.price = web3.utils.fromWei(offer.price, 'ether')
        })
        return forSaleDetails
    }
    catch (error) {
        console.log("Error from getForSaleDetails(catId): " + error)    
    }
}


async function setMarketplaceApproval(){
    try {
        const isMarketplaceAnOperator = await Instance_Of_KittyContract.methods.isApprovedForAll(User, Maketplace_Proxy_Address).call()

        if (isMarketplaceAnOperator == false) {
            await Instance_Of_KittyContract.methods.setApprovalForAll(Maketplace_Proxy_Address, true).send({}, function(err, txHash){
                if (err) console.log(err)
                else console.log("setMarketplaceApproval Tx:",txHash)
            })
        }
    }
    catch (err) {
         console.log("Error from setMarketplaceApproval(): " + err)
         return false
    }
}


async function setForSale(catId, salePriceInWei) {
    try {
        await Instance_Of_Marketplace.methods.setOffer(salePriceInWei, catId).send({}, function(err, txHash){
            if (err) {
                throw(err)
            }
            else {
                console.log("setForSale Tx:",txHash)
            }
        })
    }
    catch (err) {
        console.log("Error from setForSale(catId, salePriceInWei): " + err)
    }
}


async function withdrawFromSale(catId) {
    try {
        await Instance_Of_Marketplace.methods.removeOffer(catId).send({}, function(err, txHash){
            if (err) {
                throw(err)
            }
            else {
                console.log("WithdrawFromSale Tx:",txHash)
            }
        })
    }
    catch (err) {
        console.log("Error from withdrawFromSale(catId): " + err)
    }
}


async function buyKitty(tokenId, priceInWei) {
    try {
        await Instance_Of_Marketplace.methods.buyKitty(tokenId).send({value: priceInWei}, function(err, txHash){
            if (err) {
                throw(err)
            }
            else {
                console.log("BuyKitty Tx:", txHash)
            }
        })
    }
    catch (err) {
        console.log("Error from buyKitty(tokenId): " + err)
    }
}