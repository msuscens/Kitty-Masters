// When page loads
$(document).ready(async function(){
    // Connect website to user's metamask (to allow interaction with Kittie SC)
    const connected = await initiateConnection()
    if (connected != true) console.log("Not connected to contract")

    // Ensure Kitty-Factory accessable only to KittyContract owner
    if (await isOwnerOfKittyContract()) showFactoryLink() 
    else location.href = "index.html"

    getDefaultKittie()
    onBirthEvent(displayBirth)
})


function getDefaultKittie() {
  try {
    render(defaultCat)
    updateSliders(defaultCat.dna)
  }
  catch (error)
  {
    console.log(`Error In getDefaultKittie(): ${error}`)
  }
}


function getRandomKittie() {
  try {
    const randomCat = {
      id: "",
      gen: "",
      dna: {
        "headColor" : getRandomIntegerBetween(10, 98),
        "mouthColor" : getRandomIntegerBetween(10, 98),
        "eyesColor" : getRandomIntegerBetween(10, 98),
        "earsColor" : getRandomIntegerBetween(10, 98),
        //Cattributes
        "eyesShape" : getRandomIntegerBetween(0, 9),
        "decorationPattern" : getRandomIntegerBetween(0, 9),
        "decorationMidColor" : getRandomIntegerBetween(10, 98),
        "decorationSidesColor" : getRandomIntegerBetween(10, 98),
        "animation" :  getRandomIntegerBetween(0, 9),
        "lastNum" :  getRandomIntegerBetween(0, 9)
      }
    }

    render(randomCat)
    updateSliders(randomCat.dna)
  }
  catch (error)
  {
    console.log(`Error In getRandomKittie(): ${error}`)
  }
}


function createKittie(){
  try {
    const dna = getDna()
    createCat(dna)
  }
  catch(error){
    console.log(`Error In createKittie: ${error}`)
  }
}