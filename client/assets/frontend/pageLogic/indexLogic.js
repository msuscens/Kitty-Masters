// When page loads
$(document).ready(async function() {
    render(defaultCat)

    // Connect website to user's metamask (to allow interaction with Kittie SC)
    const connected = await initiateConnection()
    if (connected != true) console.log("Not connected to contract")
    else console.log("Contract connection successful!")

    // Make Kitty-Factory accessable only to KittyContract owner
    await isOwnerOfKittyContract() ? showFactoryLink() : hideFactoryLink()  
})
