let myCatIds = [];  // All the kitties (kitty ids) that a user owns

// When page loads
$(document).ready(async function(){

    // Connect website to user's metamask (to allow interaction with Kittie SC)
    const connected = await initiateConnection()
    if (connected != true) console.log("Not connected to contract")

    displayAllOwnedKities()

    // Register for marketplace transaction events
    onMarketplaceEvent(updateCatPenPage)

    // Make Kitty-Factory accessable only to KittyContract owner
    await isOwnerOfKittyContract() ? showFactoryLink() : hideFactoryLink()
})


async function displayAllOwnedKities(){
    try {
        const catIds = await getAllYourCatIds()
        const cats = await getDetailsAllCats(catIds)

        // Collect offer details of kitties on sale in the marketplace
        for (let i = 0; i < catIds.length; i++) {
            const catOnSale = await isCatOnSale(catIds[i])
            if (catOnSale) {
                const forSaleDetails =  await getForSaleDetails(catIds[i])
                cats[i] = {...cats[i], ...forSaleDetails}
            }
        }

        putAllCatsOnPage(cats, true)

        myCatIds = catIds
    }
    catch(error){
        console.log("In displayAllOwnedKities(): " + error)
    }
}


function updateCatPenPage(newTx){
    try {
        switch (newTx.TxType) {
            case "Create offer":
                displayTransaction(newTx)

                // Add price to kitty that is now on sale
                setTimeout(()=>{location.reload(true)},1.5*1000)
                break
            case "Buy":
                displayTransaction(newTx)

                // (Possibly) indicate which kitty has been bought here! ???

                // Remove sold kitty from the pen
                setTimeout(()=>{location.reload(true)},2*1000)

                break
            case "Remove offer":
                displayTransaction(newTx)

                // Remove price from kitty that's been withdrawn from sale
                setTimeout(()=>{location.reload(true)},1.5*1000)
                break
            default:
                throw new Error("Unknown tx value: "+newTx.TxType)
        }
    }
    catch (error) {
        console.log("Error from updateCatPenPage(newTx): " + error)
    }
}


function breeding(){
    try {
        // Validate 2 cats are selected
        let catIds = getSelectedCatIds(myCatIds)
        if (!isNumberOfKitties(2, catIds.length, "breedError")) return

        // Go to the Breed page
        window.location.href =
            `breed.html?firstCatId=${catIds[0]}&secondCatId=${catIds[1]}`
    }
    catch(error){
        console.log("Error from breeding(): " + error)
    }
}


async function advertiseCat(){
    try {
        // Validate 1 cat is selected
        let catIds = getSelectedCatIds(myCatIds)
        if (!isNumberOfKitties(1, catIds.length, "sellError")) return

        // Validate not already advertised for sale
        const catOnSale = await isCatOnSale(catIds[0])
        if (catOnSale) {
            $("#sellError").text("Kitty is already for sale! To relist at diferent price, please first withdraw current advertisement!")
            $("#sellError").css({'color': 'red', 'font-weight': 'bold'})
            return
        }

        // Validate user entered sale price
        const salePrice = $("#salePrice").val()
        const salePriceFigure = parseFloat(salePrice)
        if (!Number.isFinite(salePriceFigure) && (salePriceFigure > 0)) {
            $("#sellError").text("Invalid price! Please enter a positive number!")
            $("#sellError").css({'color': 'red', 'font-weight': 'bold'})
            return
        }
        
        // Ensure marketplace is set as an operator
        await setMarketplaceApproval()

        // Create a sell order in the marketplace
        const salePriceInWei = BigInt(web3.utils.toWei(salePrice, 'ether'))
        setForSale(catIds[0], salePriceInWei)
    }
    catch(error){
        console.log("Error from advertiseCat(): " + error)
        $("#sellError").text("Failed to create marketplace 'for sale' advertisement!")
    }
}


async function removeAdvert() {
    try {
        // Validate 1 cat is selected
        let catIds = getSelectedCatIds(myCatIds)
        if (!isNumberOfKitties(1, catIds.length, "sellError")) return 
        
        // Validate selected cat is currently up for sale
        const catOnSale = await isCatOnSale(catIds[0])
        if (!catOnSale) {
            $("#sellError").text("There's no 'for sale' advertisement to remove for this kitty!")
            $("#sellError").css({'color': 'red', 'font-weight': 'bold'})
            return
        }

        // Remove the cat from sale (in the marketplace)
        withdrawFromSale(catIds[0])
    }
    catch (error) {
        console.log("Error from removeAdvert(): " + error)
        $("#sellError").text("Failed to remove 'for sale' advertisement from the marketplace!")
    }
}
