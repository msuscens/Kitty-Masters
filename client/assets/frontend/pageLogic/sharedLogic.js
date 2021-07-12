/*
function getKittyDna(genes){
    try {
        if (genes.length != 16) throw `genes string ('${genes}') should be 16 characters (not ${genes.length})`

        const kittyDna = {
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
        return(kittyDna)
    }
    catch(error) {
        console.log("Error from getKittyDna(genes): " + error)
    }
}
*/


function getHtmlForKitty(id){
    try {
        let html = `
          <div class="col-lg-4">
          <div id="kitty${id}" class="catBoxLarger mt-4 light-b-shadow">

            <div class="priceDiv">
                <span id="catPrice"></span>
            </div>

            <div class="statusDiv">
                <span id="catStatus"></span>
            </div>

            <div id="checkboxControl${id}" class="catCheckBox custom-control custom-checkbox checkbox-xl">
                <input type="checkbox" class="custom-control-input" id="CheckBoxCat-${id}">
                <label class="custom-control-label" for="CheckBoxCat-${id}"></label>
            </div>
        
            <div id="cat" class="cat">
                <div class="cat__ear">
                    <div id="leftEar" class="cat__ear--left">
                        <div class="cat__ear--left-inside"></div>
                    </div>
                    <div id="rightEar" class="cat__ear--right">
                        <div class="cat__ear--right-inside"></div>
                    </div>
                </div>

                <div id="head" class="cat__head">
                    <div id="midDot" class="cat__head-dots">
                        <div id="leftDot" class="cat__head-dots_first"></div>
                        <div id="rightDot" class="cat__head-dots_second"></div>
                    </div>
                    <div id="eyes" class="cat__eye">
                        <div class="cat__eye--left">
                            <span class="pupil-left"></span>
                        </div>
                        <div class="cat__eye--right">
                            <span class="pupil-right"></span>
                        </div>
                    </div>
                    <div id="nose" class="cat__nose"></div>

                    <div class="cat__mouth-contour"></div>
                    <div class="cat__mouth-left"></div>
                    <div class="cat__mouth-right"></div>

                    <div id="leftWhiskers" class="cat__whiskers-left"></div>
                    <div id="rightWhiskers" class="cat__whiskers-right"></div>
                </div>

                <div class="cat__body">

                    <div class="cat__chest"></div>
                    <div class="cat__chest_inner"></div>

                    <div id="leftRearPaw" class="cat__paw-left_rear"></div>
                    <div id="leftFrontPaw" class="cat__paw-left_front"></div>

                    <div id="rightFrontPaw" class="cat__paw-right_front"></div>
                    <div id="rightRearPaw" class="cat__paw-right_rear"></div>

                    <div id="tail" class="cat__tail"></div>
                </div>
            </div>
            <br>
            <div class="genDiv">
                <p><b>GEN: <span id="catGenNum"></span></b></p>
            </div>
            <div class="dnaDiv" id="catDNA">
                <b>
                    DNA:
                    <!-- Colors -->
                    <span id="dnabody"></span>
                    <span id="dnamouth"></span>
                    <span id="dnaeyes"></span>
                    <span id="dnaears"></span>
                    
                    <!-- Cattributes -->
                    <span id="dnashape"></span>
                    <span id="dnadecoration"></span>
                    <span id="dnadecorationMid"></span>
                    <span id="dnadecorationSides"></span>
                    <span id="dnaanimation"></span>
                    <span id="dnaspecial"></span>
                </b>
            </div>
          </div>
          </div>`
        return(html)
    }
    catch (error) {
        console.log("In getHtmlForKitty(id): " + error)
    }
}


function toggleCheckBox(id){
    $(id).prop("checked") ? $(id).prop("checked", false) : $(id).prop("checked",true)
}


function getSelectedCatIds(catIds){
    try {
        let IdsSelectedCats = []
        for (i=0; i<catIds.length; i++){
            let idCheckBox = "#CheckBoxCat-" + catIds[i]
            if ($(idCheckBox).prop("checked"))
                IdsSelectedCats.push(catIds[i])
        }
        return IdsSelectedCats
    }
    catch(error) {
        console.log("Error from getSelectedCatIds(catIds): " + error)
    }
}

function isNumberOfKitties(numRequired, numSelected, idErrorElement) {
    const kittyWord = (numRequired == 1)? "kitty" : "kitties"

    if (numSelected < numRequired) {
        $("#"+idErrorElement).text(`Use checkboxes to select ${numRequired} ${kittyWord}!`)
        $("#"+idErrorElement).css({'color': 'red', 'font-weight': 'bold'})
        return false
    }
    if (numSelected > numRequired) {
        $("#"+idErrorElement).text(`Too many! Please select only ${numRequired} ${kittyWord}!`)
        $("#"+idErrorElement).css({'color': 'red', 'font-weight': 'bold'})
        return false
    }
    // Correct number selected
    clearErrorMessage(idErrorElement)
    return true
}


function clearErrorMessage(idErrorElement) {
    $("#"+idErrorElement).text("")
    $("#"+idErrorElement).css({'color': 'black', 'font-weight': 'normal'})
}


function putAllCatsOnPage(cats, withCheckBoxes=false) {
    for (let i = 0; i < cats.length; i++) {
        const catId = cats[i].id
        const htmlKitty = getHtmlForKitty(catId) 
        $('#rowOfCats').append(htmlKitty)
        render(cats[i], `#kitty${catId}`)

        if (withCheckBoxes) {
            // Enable cat selection (toggle) on click
            const catElement = document.getElementById(`kitty${catId}`) 
            catElement.addEventListener("click", function(){
                toggleCheckBox(`#CheckBoxCat-${catId}`)
            }, false)
        }
        else {
            $(`#checkboxControl${catId}`).hide()
        }

    }
}


// Event Handler for birth event (i.e. upon a SC event)

function displayBirth(newborn) {
    try {
        $("#kittyCreation").css("display", "block")
        $("#kittyCreation").text("A new kitty is born!  Kitty ID:" + newborn.kittenId +
                                "\nGenes:" + newborn.genes +
                                "\nMum's ID:" + newborn.mumId +
                                " Dad's ID:" + newborn.dadId +
                                " Generation:" + newborn.generation +
                                "\nOwner:" + newborn.owner)
    }
    catch (error) {
        console.log("Error from displayBirthEvent(newborn): " + error)

    }
}




function displayTransaction(newTx){
    try {
        $("#kittyTransaction").css("display", "block")
        $("#kittyTransaction").text("New market event: " + newTx.TxType + 
            "\nKitty ID:" + newTx.tokenId + " Owner:" + newTx.owner)
    }
    catch (error) {
        console.log("Error from displayTransaction(): " + error)
    }
}


function showFactoryLink() {
    try {
        const factoryLink = document.getElementById('factoryNavLink')
        factoryLink.removeAttribute("hidden")
    }
    catch (error) {
        console.log("Error from showFactoryLink(): " + error)
    }
}


function hideFactoryLink() {
    try {
        const factoryLink = document.getElementById('factoryNavLink')
        factoryLink.setAttribute("hidden", true)
    }
    catch (error) {
        console.log("Error from hideFactoryLink(): " + error)
    }
}

