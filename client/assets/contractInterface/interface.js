// Contract Proxy Addresses for the DragonToken and Marketplace contracts
// Set each contract's proxy addresses below, ie.
//      Obtain proxy addresses from console upon performing :
//          truffle migrate --reset' --network <network type>
//      Eg. For local development network:
//          truffle migrate --reset' --network development
//
//      DragonToken's proxy contract address: Copy & paste from console output
//      under: '2_dragon_token_migration' and then under the subsection:
//      'TransparentUpgradeableProxy'
//
//      Marketplace's proxy contract address: Copy & paste from console 
//      under '3_marketplace_migration' and then under the subsection:
//      'TransparentUpgradeableProxy'
//
// Local Network (e.g. ganace-cli)
const LOCAL_DRAGON_TOKEN_PROXY = "0xeC5712cCEFC64eBf00865fE3229dC3a7e7c17170"
const LOCAL_MARKETPLACE_PROXY = "0x05F7B04E8ED850A6377Cfdc7Bc19aFAa7404437E"

// Ropsten Network: ONLY UPDATE AFTER DEPLOY/RE-DEPLOY TO ROPSTEN
const ROPSTEN_DRAGON_TOKEN_PROXY = ""
const ROPSTEN_MARKETPLACE_PROXY = ""

// Rinkeby Network: ONLY UPDATE AFTER DEPLOY/RE-DEPLOY TO RINKEBY
const RINKEBY_DRAGON_TOKEN_PROXY = ""
const RINKEBY_MARKETPLACE_PROXY = "" 

const web3 = new Web3(Web3.givenProvider)
console.log("Web3 version: ", web3.version)

let DragonToken_Proxy_Address
let Maketplace_Proxy_Address
let Instance_Of_DragonToken
let Instance_Of_Marketplace
let User

async function initiateConnection(){
    try {
        // Get (proxy) contract addresses for the (MetaMask connected) network
        const networkType = await web3.eth.net.getNetworkType()
        console.log(`Network detected: ${networkType}`)
        const proxies = getProxyAddresses(networkType)
        DragonToken_Proxy_Address = proxies.dragonTokenProxy
        Maketplace_Proxy_Address = proxies.marketplaceProxy

        // Get accounts from MetaMask
        const accounts = await web3.eth.getAccounts()
        if (accounts.length == 0) throw "Unable to get accounts from MetaMask!"
        User = accounts[0]

        // Connect to the (proxy) contracts
        Instance_Of_DragonToken = new web3.eth.Contract(abi.dragonToken, DragonToken_Proxy_Address, {from: accounts[0]})
        if (Instance_Of_DragonToken.options.address == null) throw "Unable to connect to DragonToken proxy"
        Instance_Of_Marketplace = new web3.eth.Contract(abi.marketplace, Maketplace_Proxy_Address, {from: accounts[0]})
        if (Instance_Of_Marketplace.options.address == null) throw "Unable to connect to Marketplace proxy"

        console.log("Connected to DragonToken Proxy address:", Instance_Of_DragonToken.options.address)
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
        let dragonTokenProxy
        let marketplaceProxy

        switch (network) {
            case "private":  // Local network
                dragonTokenProxy = LOCAL_DRAGON_TOKEN_PROXY
                marketplaceProxy = LOCAL_MARKETPLACE_PROXY
                break
            case "rinkeby":
                dragonTokenProxy = RINKEBY_DRAGON_TOKEN_PROXY
                marketplaceProxy = RINKEBY_MARKETPLACE_PROXY
                break
            case "ropsten":
                dragonTokenProxy = ROPSTEN_DRAGON_TOKEN_PROXY
                marketplaceProxy = ROPSTEN_MARKETPLACE_PROXY
                break
            case "main":
                throw "Not currently supported on Ethereum main net!"
            default:
                throw `Unknown Ethereum network type: ${networkType}!`
        }
        return {dragonTokenProxy, marketplaceProxy}
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


// DragonToken Events

function onBirthEvent(uiCallbackFunc) {
    Instance_Of_DragonToken.events.Birth().on('data', function(event){
        uiCallbackFunc(event.returnValues)
    })
    .on('error', function(error, receipt) {
        console.log("Birth Event Error:")
        console.log("error:", error)
        console.log("receipt:", receipt)
    })
}


// DragonToken Contract Interface functions

async function isOwnerOfKittyContract() {
    try {
        let isOwner; 
        await Instance_Of_DragonToken.methods.owner().call({}, function(err, contractOwner){
            if (err) throw "Error from owner().call(): " + err
            isOwner = String(contractOwner).toLowerCase() === String(User).toLowerCase()
        })
        return isOwner
    }
    catch (error) {
        console.log("In isOwnerOfDragonToken(): " + error)
    }
}


async function getAllYourCatIds() {
    try {
        let dragonIds = []
        await Instance_Of_DragonToken.methods.getAllYourDragonIds().call({}, function(err, idsTokens){
            if (err) throw "Error from getAllYourDragonIds().call(): " + err
            dragonIds = idsTokens
        })
        return dragonIds
    }
    catch (error) {
        console.log("In getAllYourCatIds(): " + error)
    }
}


async function getDetailsAllCats(tokenIds) { 
    try {
        let allDragons = []
        for (let i = 0; i < tokenIds.length; i++) {
            const dragon = await getCatDetails(tokenIds[i])
            allDragons.push(dragon)
        }
        return allDragons
    }
    catch (error) {
        console.log("Error from getDetailsAllCats(tokenIds): " + error)
    }
}


async function getCatDetails(tokenId) {
    try {
        const dragon = {
            id: tokenId,
            genes: undefined,
            gen: undefined,
            mumId: undefined,
            dadId: undefined,
            birthTime: undefined,
            dna: undefined  // added dna object (required by front-end)
        }

        await Instance_Of_DragonToken.methods.getDragon(tokenId).call({}, function(errMsg, drgn){
            if (errMsg) throw "Error from getDragon(tokenId).call(): " + errMsg
            dragon.genes = drgn.genes
            dragon.birthTime = drgn.birthTime
            dragon.mumId = drgn.mumId
            dragon.dadId = drgn.dadId
            dragon.gen = drgn.generation
        })
        // Add further info as required by UI
        dragon.dna = getDragonDna(dragon.genes)   // Kenneth: originally getKittyDna(cat.genes) 
                                                  // [in: client/assests/frontend/sharedLogic.js]
                                                  // Now renamed to getDragonDna(genes) and moved
                                                  // into this file (from shardLogic.js)
        return dragon
    }
    catch (error) {
        console.log("Error from getCatDetails(tokenId): " + error)
    }
}


function getDragonDna(genes){
    try {
        if (genes.length != 16) throw `genes string ('${genes}') should be 16 characters (not ${genes.length})`

        const dna = {
            "headColor" : genes.substring(0, 2),
            "mouthColor" : genes.substring(2, 4),
            "eyesColor" : genes.substring(4, 6),
            "earsColor" : genes.substring(6, 8),
            "eyesShape" : parseInt( genes.substring(8, 9) ),
            "decorationPattern" : parseInt( genes.substring(9, 10) ),
            "decorationMidColor" : genes.substring(10, 12),
            "decorationSidesColor" : genes.substring(12, 14),
            "animation" : parseInt( genes.substring(14, 15) ),
            "lastNum" : parseInt( genes.substring(15, 16) )
        }
        return(dna)
    }
    catch(error) {
        console.log("Error from getDragonDna(genes): " + error)
    }
}


async function createCat(dna){
    try {
        await Instance_Of_DragonToken.methods.createDragonGen0(dna).send({}, function(err, txHash){
            if (err) throw "Error returned from 'Instance_Of_DragonToken.methods.createDragonGen0(dna).send({}': " + err
            else {
                console.log("createCats Tx:",txHash)
                return txHash
            }
        })
    }
    catch (error) {
        console.log("In createCat(dna): " + error)
    }        
}


async function breedCats(mumId, dadId){
    try {
        await Instance_Of_DragonToken.methods.breed(mumId, dadId).send({}, function(err, txHash){
            if (err) throw "Error returned from 'Instance_Of_DragonToken.methods.breed(mumId, dadId).send({}': " + err
            else {
                console.log("breed Tx:",txHash)
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
        let dragonIdsOnSale = []
        await Instance_Of_Marketplace.methods.getAllTokenOnSale().call({}, function(err, idsTokensOnSale){
            if (err) throw "Error from getAllTokenOnSale().call(): " + err
            dragonIdsOnSale = idsTokensOnSale
        })
        return dragonIdsOnSale
    }
    catch (error) {
        console.log("In getAllCatIdsOnSale(): " + error)
    }
}


async function getDetailsOfAllCatsForSale(tokenIds) {
    try {
        let allDragonsForSale = []

        for (let i = 0; i < tokenIds.length; i++) {
            const dragon = await getCatDetails(tokenIds[i])
            const forSale = await getForSaleDetails(tokenIds[i])
            const dragonForSale = {...dragon, ...forSale}
            allDragonsForSale.push(dragonForSale)
        }
        return allDragonsForSale
    }
    catch (error) {
        console.log("Error from getDetailsOfAllCatsForSale(tokenIds): " + error)
    }
}


async function isCatOnSale(tokenId) {
    try {
        let isOnSale
        await Instance_Of_Marketplace.methods.isTokenOnSale(tokenId).call({}, function(errMsg, onSale){
            if (errMsg) throw new Error(errMsg)
            isOnSale = onSale
        })
        return isOnSale
    }
    catch (error) {
        console.log("Error from isCatOnSale(tokenId): " + error)
        console.log("Defaulting to returning false ... continuing")
        return false
    }
}


async function getForSaleDetails(tokenId) {
    try {
        const forSaleDetails = {
            id: undefined,
            sellerAddress: undefined,
            priceInWei: undefined,
            active: undefined,
            price: undefined
        }

        await Instance_Of_Marketplace.methods.getOffer(tokenId).call({}, function(errMsg, offer){
                if (errMsg) throw new Error(errMsg)
                if (tokenId != offer.tokenId ) throw new Error(`Internal error - tokenId (${offer.tokenId}) returned by getOffer(tokenId) doesn't match tokenId (${tokenId})!?`)

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
        console.log("Error from getForSaleDetails(tokenId): " + error)    
    }
}


async function setMarketplaceApproval(){
    try {
        const isMarketplaceAnOperator = await Instance_Of_DragonToken.methods.isApprovedForAll(User, Maketplace_Proxy_Address).call()

        if (isMarketplaceAnOperator == false) {
            await Instance_Of_DragonToken.methods.setApprovalForAll(Maketplace_Proxy_Address, true).send({}, function(err, txHash){
                if (err) throw(err)
                else console.log("setMarketplaceApproval Tx:",txHash)
            })
        }
    }
    catch (err) {
         console.log("Error from setMarketplaceApproval(): " + err)
         return false
    }
}

// NEW FUNCTION - Not used by my Kitty-Master UI
async function setMarketplaceApprovalForDragon(tokenId){
    try {
        const approvedOperator = await Instance_Of_DragonToken.methods.getApproved(tokenId).call() 

        if (approvedOperator != User) {
            await Instance_Of_DragonToken.methods.approve(Maketplace_Proxy_Address, tokenId).send({}, function(err, txHash){
                if (err) throw(err)
                else console.log(`setMarketplaceApprovalForDragon(tokenId:${tokenId}) Tx:`, txHash)
            })
        }
        else console.log(`Marketplace is already approved for tokenid ${tokenId}`)
    }
    catch (err) {
         console.log("Error from setMarketplaceApprovalForDragon(tokenId): " + err)
         return false
    }
}


async function setForSale(tokenId, salePriceInWei) {
    try {
        await Instance_Of_Marketplace.methods.setOffer(salePriceInWei, tokenId).send({}, function(err, txHash){
            if (err) {
                throw(err)
            }
            else {
                console.log("setForSale Tx:",txHash)
            }
        })
    }
    catch (err) {
        console.log("Error from setForSale(tokenId, salePriceInWei): " + err)
    }
}


async function withdrawFromSale(tokenId) {
    try {
        await Instance_Of_Marketplace.methods.removeOffer(tokenId).send({}, function(err, txHash){
            if (err) {
                throw(err)
            }
            else {
                console.log("WithdrawFromSale Tx:",txHash)
            }
        })
    }
    catch (err) {
        console.log("Error from withdrawFromSale(tokenId): " + err)
    }
}


async function buyKitty(tokenId, priceInWei) {
    try {
        await Instance_Of_Marketplace.methods.buyDragon(tokenId).send({value: priceInWei}, function(err, txHash){
            if (err) {
                throw(err)
            }
            else {
                console.log("BuyDragon Tx:", txHash)
            }
        })
    }
    catch (err) {
        console.log("Error from buyKitty(tokenId): " + err)
    }
}