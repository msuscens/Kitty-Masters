
function getDna(){
  try {
    let dna = ''
    dna += $('#dnabody').html()
    dna += $('#dnamouth').html()
    dna += $('#dnaeyes').html()
    dna += $('#dnaears').html()
    dna += $('#dnashape').html()
    dna += $('#dnadecoration').html()
    dna += $('#dnadecorationMid').html()
    dna += $('#dnadecorationSides').html()
    dna += $('#dnaanimation').html()
    dna += $('#dnaspecial').html()

    if (dna.length !== 16 ) throw `DNA string ('${dna}') length should be 16 (not ${dna.length} digits)`

    return BigInt(dna)
  }
  catch (error) {
    console.log(`Error In getDna(): ${error}`)
  }
}


function render(cat, idCat=""){
  try {
    headColor(cat.dna.headColor, idCat)
    mouthChestTailColor(cat.dna.mouthColor, idCat)
    eyesColor(cat.dna.eyesColor, idCat)
    earsPawsColor(cat.dna.earsColor, idCat)
    eyeVariation(cat.dna.eyesShape, idCat)
    decorationVariation(cat.dna.decorationPattern, idCat)
    innerDecorationColor(cat.dna.decorationMidColor, idCat)
    outerDecorationColor(cat.dna.decorationSidesColor, idCat)
    animationVariation(cat.dna.animation, idCat)

    // Display Special DNA digit  
    $(`${idCat} #dnaspecial`).html(cat.dna.lastNum) // Update DNA display (below cat)

    // Display Cats' Generation
    $(`${idCat}`).find('#catGenNum').html(cat.gen)

    // Display Cats' Price (if it has one)
    if (cat.price) $(`${idCat}`).find('#catPrice').html("PRICE: " + cat.price + " ETH")

    // Display Cats' status
//    $(`${idCat}`).find('#catStatus').html("TEST")

  }
  catch (error){
    console.log(`Error In render(cat, idCat=""): ${error}`)
  }
}


function updateSliders(dna){
  try {
    $('#bodycolor').val(dna.headColor)             //Update slider's value
    $('#headcode').html('code: '+dna.headColor)    //Update slider's badge

    $('#mouthcolor').val(dna.mouthColor)
    $('#mouthcode').html('code: '+dna.mouthColor)

    $('#eyecolor').val(dna.eyesColor)
    $('#eyescode').html('code: '+dna.eyesColor)

    $('#earcolor').val(dna.earsColor)
    $('#earscode').html('code: '+dna.earsColor)

    $('#eyeshape').val(dna.eyesShape)
    $('#eyeName').html(eyeVariations[dna.eyesShape].name)

    $('#decorativepattern').val(dna.decorationPattern)
    $('#decorationName').html(decorationVariations[dna.decorationPattern].name)

    $('#innerDecorationColor').val(dna.decorationMidColor)
    $('#innerDecorationCode').html('code: '+dna.decorationMidColor)

    $('#outerDecorationColor').val(dna.decorationSidesColor)
    $('#outerDecorationCode').html('code: '+dna.decorationSidesColor)

    $('#animation').val(dna.animation)
    $('#animationName').html(animationVariations[dna.animation].name)
  }
  catch (error){
    console.log(`Error In updateSliders(dna): ${error}`)
  }
}


// Slider changing cat attributes (colors, eyes, patterns)
$('#bodycolor').change(()=>{
    const colorVal = $('#bodycolor').val()
    $('#headcode').html('code: '+colorVal)    // Update slider's badge
    headColor(colorVal)      // Update cat
})

$('#mouthcolor').change(()=>{
  const colorVal = $('#mouthcolor').val()
  $('#mouthcode').html('code: '+colorVal)
  mouthChestTailColor(colorVal)
})

$('#eyecolor').change(()=>{
  const colorVal = $('#eyecolor').val()
  $('#eyescode').html('code: '+colorVal)
  eyesColor(colorVal)
})

$('#earcolor').change(()=>{
  const colorVal = $('#earcolor').val()
  $('#earscode').html('code: '+colorVal)
  earsPawsColor(colorVal)
})

$('#eyeshape').change(()=>{
  const shape = parseInt($('#eyeshape').val())
  $('#eyeName').html(eyeVariations[shape].name)
  eyeVariation(shape)
})

$('#decorativepattern').change(()=>{
  const pattern = parseInt($('#decorativepattern').val())
  $('#decorationName').html(decorationVariations[pattern].name)
  decorationVariation(pattern)
})

$('#innerDecorationColor').change(()=>{
  const colorVal = $('#innerDecorationColor').val()
  $('#innerDecorationCode').html('code: '+colorVal)
  innerDecorationColor(colorVal)
})

$('#outerDecorationColor').change(()=>{
  const colorVal = $('#outerDecorationColor').val()
  $('#outerDecorationCode').html('code: '+colorVal)
  outerDecorationColor(colorVal)
})

$('#animation').change(()=>{
  const animationValue = parseInt($('#animation').val())
  $('#animationName').html(animationVariations[animationValue].name)
  animationVariation(animationValue)
})
