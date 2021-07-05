
let marketplaceCatIds = [];  // All kitties (kitty ids) for sale in the marketplace

// When page loads
$(document).ready(async function(){
    // Connect website to user's metamask (to allow interaction with Kittie SC)
    const connected = await initiateConnection()
    if (connected != true) console.log("Not connected to contract")

    displayMarketplaceKitties()

    // Register for marketplace transaction events (with event handler to update page)
    onMarketplaceEvent(updateMarketPage)

    // Make Kitty-Factory only accessable to KittyContract owner
    await isOwnerOfKittyContract() ? showFactoryLink() : hideFactoryLink()  
})


async function displayMarketplaceKitties(){
    try {
        const catIds = await getAllCatIdsOnSale()
        const catsOnSale = await getDetailsOfAllCatsForSale(catIds)

        putAllCatsOnPage(catsOnSale)

        marketplaceCatIds = catIds

        // Add buy button (to all cats in marketplace except users own)
        for (i = 0; i < catsOnSale.length; i++) {
            const cat = catsOnSale[i]
            // Add buy option for all kitties that are not yours already
            if (isUser(cat.sellerAddress)) { 
                $(`#kitty${cat.id}`).find('#catStatus').html("YOUR KITTY!")
            }
            else {
                $(`#kitty${cat.id}`).find('#catStatus').html(
                    `<button id="buyButton${cat.id}" type="button" class="btn btn-success" onclick="buyKittyToken('${cat.id}', '${cat.priceInWei}')">BUY</button>`)
            }
        }
    }
    catch(error){
        console.log("In DisplayMarketplaceKitties(): " + error)
    }
}


function updateMarketPage(newTx){
    try {
        switch (newTx.TxType) {
            case "Create offer":
                displayTransaction(newTx)
                break
            case "Buy":
                displayTransaction(newTx)

                // Indicate kitty that is now sold 
                $(`#buyButton${newTx.tokenId}`).addClass("btn-danger");
                $(`#buyButton${newTx.tokenId}`).removeClass("btn-success");
                $(`#buyButton${newTx.tokenId}`).text("SOLD!")
                break
            case "Remove offer":
                displayTransaction(newTx)

                // Show kitty that has just been withdrawn from sale
                $(`#buyButton${newTx.tokenId}`).prop("disabled", true);
                $(`#buyButton${newTx.tokenId}`).addClass("btn-danger");
                $(`#buyButton${newTx.tokenId}`).removeClass("btn-success");
                $(`#buyButton${newTx.tokenId}`).text("WITHDRAWN FROM MARKET!")
                break
            default:
                throw new Error("Unknown tx value: "+newTx.TxType)
        }
    }
    catch (error) {
        console.log("Error from updateMarketPage(newTx): " + error)
    }
}


function buyKittyToken(id, priceInWei){
    try {
        // Buy the kitty (via the marketplace Contract)
        buyKitty(id, priceInWei)

        // Prevent user clicking buy again whilst purchase is being procesed
        $(`#buyButton${id}`).prop("disabled", true);
    }
    catch(error){
        console.log("Error from buyKittyToken(id): " + error)
    }
}
