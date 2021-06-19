
function headColor(code, idCat="") {
    $(`${idCat} .cat__head, ${idCat} .cat__chest`).css('background', '#' + colors[code])
    $(`${idCat} #dnabody`).html(code)   // Update DNA display (below the cat)
}

function mouthChestTailColor(code, idCat="") {
    $(`${idCat} .cat__mouth-contour, ${idCat} .cat__chest_inner, ${idCat} .cat__tail`).css(
        'background', '#' + colors[code]
    )
    $(`${idCat} #dnamouth`).html(code)
}

function eyesColor(code, idCat="") {
    $(`${idCat} [class^="pupil-"]`).css('background', '#' + colors[code])  
    $(`${idCat} #dnaeyes`).html(code)
}

function earsPawsColor(code, idCat="") {
    $(`${idCat} [id$="Ear"], ${idCat} [class^="cat__paw"]`).css('background', '#' + colors[code])
    $(`${idCat} #dnaears`).html(code)
}

function innerDecorationColor(code, idCat="") {
    $(`${idCat} .cat__head-dots`).css('background', '#' + colors[code]) 
    $(`${idCat} #dnadecorationMid`).html(code)
}

function outerDecorationColor(code, idCat="") {
    $(`${idCat} [class^="cat__head-dots_"]`).css('background', '#' + colors[code])     
    $(`${idCat} #dnadecorationSides`).html(code)
}

function eyeVariation(num, idCat="") {
    normalEyes(idCat) //Reset eyes
    $(`${idCat} #dnashape`).html(num)   // Update DNA display (below cat)
    eyeVariations[num].setEyesFunc(idCat)
}

function normalEyes(idCat) {
    // Reset eye lids to fully open
    $(`${idCat} .cat__eye`).find('span').css('border', 'none')

    // Reset pupil to round and centered
    $(`${idCat} .cat__eye`).find('span').css('width', '42px') 
    $(`${idCat} .pupil-left`).css('left', '42px')    
    $(`${idCat} .pupil-right`).css('left', '166px') 
}

function eyesType1(idCat) {  // Look down
    $(`${idCat} .cat__eye`).find('span').css('border-top', '15px solid')
}

function eyesType2(idCat) {  // Look up
    $(`${idCat} .cat__eye`).find('span').css('border-bottom', '15px solid')
}

function eyesType3(idCat) {  // Narrow pupils (straight ahead)
    $(`${idCat} .cat__eye`).find('span').css('width', '22px')  // Wide-42, Narrow-22 
    $(`${idCat} .pupil-left`).css('left', '52px')    // Recentre left & right pupils (ie. compensate for
    $(`${idCat} .pupil-right`).css('left', '176px')  // 20px width change by moving pupils left +10px)
}

function eyesType4(idCat) {  // Narrow pupils looking left
    eyesType3(idCat) //Narrow pupils 
    $(`${idCat} .pupil-left`).css('left', '42px')    
    $(`${idCat} .pupil-right`).css('left', '166px') 
}

function eyesType5(idCat) {    // Narrow pupils looking right
    eyesType3(idCat) //Narrow pupils 
    $(`${idCat} .pupil-left`).css('left', '62px')
    $(`${idCat} .pupil-right`).css('left', '186px')
}

function eyesType6(idCat) {  // Cross-eyed
    eyesType3(idCat) //Narrow pupils
    $(`${idCat} .pupil-left`).css('left', '62px') 
    $(`${idCat} .pupil-right`).css('left', '166px')
}

function eyesType7(idCat) {  // Lazy left-eye
    eyesType3(idCat) //Narrow pupils
    $(`${idCat} .pupil-left`).css('left', '42px')
}

function eyesType8(idCat) {  // Lazy right eye
    eyesType3(idCat) //Narrow pupils
    $(`${idCat} .pupil-right`).css('left', '186px')
}

function eyesType9(idCat) {  // Two lazy eyes
    eyesType3(idCat) //Narrow pupils 
    $(`${idCat} .pupil-left`).css('left', '42px') 
    $(`${idCat} .pupil-right`).css('left', '186px')
}


function decorationVariation(num, idCat="") {
    normaldecoration(idCat) //Reset decoration
    $(`${idCat} #dnadecoration`).html(num)   // Update DNA display (below cat)
    decorationVariations[num].setDecorationFunc(idCat)
}

function normaldecoration(idCat) {
    //Remove all style from other decorations (to reset)
    $(`${idCat} .cat__head-dots`).css({ "transform": "rotate(0deg)", "height": "48px", "width": "14px",
                                        "top": "1px", "border-radius": "0 0 50% 50%", "left": "101" })
    $(`${idCat} .cat__head-dots_first`).css({ "transform": "rotate(0deg)", "height": "35px", "width": "14px",
                                        "top": "1px", "border-radius": "50% 0 50% 50%", "left": "-20px"})
    $(`${idCat} .cat__head-dots_second`).css({ "transform": "rotate(0deg)", "height": "35px", "width": "14px",
                                        "top": "1px", "border-radius": "0 50% 50% 50%", "left": "20px" })
}

function patternType1(idCat) {  // Long stripes up
    $(`${idCat} .cat__head-dots`).css({ "transform": "rotate(180deg)", "height": "95px"})
    $(`${idCat} [class^="cat__head-dots_"]`).css('height', '80px')
}

function patternType2(idCat) {  //Angle stripes
    $(`${idCat} .cat__head-dots`).css({ "transform": "rotate(-25deg)", "top":"-6px"})
    $(`${idCat} .cat__head-dots_first`).css('top','-5px')
    $(`${idCat} .cat__head-dots_second`).css({ "top":"8px", "border-radius":"0px 40% 50% 50%"})
}

function patternType3(idCat) {  //'Bald' patch
    $(`${idCat} .cat__head-dots`).css({ "height":"40px", "width":"100px", "left": "60px",
                                        "border-radius": "50% 50% 30px 30px" })
    $(`${idCat} [class^="cat__head-dots_"]`).css('width', '0px')
}

function patternType4(idCat) {  //3-prong leaf
    $(`${idCat} .cat__head-dots_first`).css({ "transform":"rotate(36deg)", "border-radius":"50% 0px 50% 50%" })
    $(`${idCat} .cat__head-dots_second`).css({ "transform":"rotate(-36deg)", "border-radius":"0px 50% 50% 50%" })
}

function patternType5(idCat) {  //Stripe with side blobs
    $(`${idCat} .cat__head-dots`).css({ "width":"20px", "left": "98px" })
    $(`${idCat} .cat__head-dots_first`).css({ "width":"35px", "left":"-38px", "border-radius":"25px 0px 50% 50%"})
    $(`${idCat} .cat__head-dots_second`).css({ "width":"35px", "left":"23px", "border-radius":"0px 25px 50% 50%" })
}

function patternType6(idCat) {  //Two stripes
    $(`${idCat} .cat__head-dots`).css('width', '0px')
}

function patternType7(idCat) {  //One stripe 
    $(`${idCat} [class^="cat__head-dots_"]`).css('width', '0px')
}

function patternType8(idCat) {  //Spikey hair
    $(`${idCat} .cat__head-dots`).css({ "transform": "rotate(180deg)", "top": "-40px" })
}

function patternType9(idCat) {  //No pattern
    $(`${idCat} .cat__head-dots`).css('width', '0px')
    $(`${idCat} [class^="cat__head-dots_"]`).css('width', '0px')
}


function animationVariation(num, idCat="") {
    removeAllAnimations(idCat) //Reset animations
    $(`${idCat} #dnaanimation`).html(num)   // Update DNA display (below cat)
    animationVariations[num].setAnimationFunc(idCat)
}


function removeAllAnimations(idCat) { 
    $(`${idCat} #head`).attr("class", "cat__head")
    $(`${idCat} #leftEar`).attr("class", "cat__ear--left")
    $(`${idCat} #rightEar`).attr("class", "cat__ear--right")
    $(`${idCat} #tail`).attr("class", "cat__tail")

    $(`${idCat} #nose`).attr("class", "cat__nose")
    $(`${idCat} #leftWhiskers`).attr("class", "cat__whiskers-left")
    $(`${idCat} #rightWhiskers`).attr("class", "cat__whiskers-right")

    $(`${idCat} #eyes`).attr("class", "cat__eye")
    $(`${idCat} #cat`).attr("class", "cat")

    $(`${idCat} #leftFrontPaw`).attr("class", "cat__paw-left_front")
    $(`${idCat} #rightFrontPaw`).attr("class", "cat__paw-right_front")
    $(`${idCat} #leftRearPaw`).attr("class", "cat__paw-left_rear")
    $(`${idCat} #rightRearPaw`).attr("class", "cat__paw-right_rear")
}

function animationType1(idCat) {  // Roll Head
    $(`${idCat} #head`).addClass("movingHead")
    $(`${idCat} #leftEar`).addClass("movingLeftEar")
    $(`${idCat} #rightEar`).addClass("movingRightEar")
}

function animationType2(idCat) {  // Swish Tail
    $(`${idCat} #tail`).addClass("movingTail")
}

function animationType3(idCat) {  // Wiggle left ear
    $(`${idCat} #leftEar`).addClass("wiggleLeftEar")
}

function animationType4(idCat) {  // Wiggle right ear
    $(`${idCat} #rightEar`).addClass("wiggleRightEar")
}

function animationType5(idCat) {  // Wiggle both ears
    $(`${idCat} #leftEar`).addClass("wiggleLeftEar")
    $(`${idCat} #rightEar`).addClass("wiggleRightEar")
}

function animationType6(idCat) {  // Alert ears
    $(`${idCat} #leftEar`).addClass("alertingLeftEar")
    $(`${idCat} #rightEar`).addClass("alertingRightEar")
}

function animationType7(idCat) {  // Twitch nose & whiskers
    $(`${idCat} #nose`).addClass("twitchingNose")
    $(`${idCat} #leftWhiskers`).addClass("twitchingLeftWhiskers")
    $(`${idCat} #rightWhiskers`).addClass("twitchingRightWhiskers")
}

function animationType8(idCat) {  // Wandering eyes
    $(`${idCat} #eyes`).addClass("wanderingEyes")
}

function animationType9(idCat) {  // Stand up
    $(`${idCat} #cat`).addClass("catRising")
    $(`${idCat} #leftRearPaw, ${idCat} #rightRearPaw`).addClass("extendingRearLeg")
    $(`${idCat} #leftFrontPaw, ${idCat} #rightFrontPaw`).addClass("raisingFrontLeg")
}

function animationType10(idCat) {  // Hyperactive
    animationType1(idCat)     // Roll head
    animationType2(idCat)     // Swish Tail
    animationType5(idCat)    // Wiggle both ears
    animationType7(idCat)    // Twitch nose & whiskers
    animationType8(idCat)   // Wandering eyes
    animationType9(idCat)   // Standing up
}
