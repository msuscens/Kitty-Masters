const colors = Object.values(allColors())

const defaultDNA = {
    "headColor" : 10,
    "mouthColor" : 13,
    "eyesColor" : 96,
    "earsColor" : 10,
    //Cattributes
    "eyesShape" : 1,
    "decorationPattern" : 1,
    "decorationMidColor" : 13,
    "decorationSidesColor" : 13,
    "animation" : 0,
    "lastNum" : 1
    }
    
const defaultCat = {
    id: "",
    dna: defaultDNA,
    gen: ""
}

const eyeVariations = [
    {
      "name" : "Big Round Eyes",
      "setEyesFunc" : normalEyes
    },
    {
      "name" : "Look Down",
      "setEyesFunc" : eyesType1
    },
    {
        "name" : "Look Up",
        "setEyesFunc" : eyesType2
    },
    {
        "name" : "Narrow pupils",
        "setEyesFunc" : eyesType3
    },
    {
        "name" : "Narrow pupils, looking left",
        "setEyesFunc" : eyesType4
    },
    {
        "name" : "Narrow pupils, looking right",
        "setEyesFunc" : eyesType5
    },
    {
        "name" : "Cross-eyed",
        "setEyesFunc" : eyesType6
    },
    {
        "name" : "Lazy left-eye",
        "setEyesFunc" : eyesType7
    },
    {
        "name" : "Lazy right-eye",
        "setEyesFunc" : eyesType8
    },
    {
        "name" : "Two lazy eyes",
        "setEyesFunc" : eyesType9
    }
  ]

const decorationVariations = [
    {
        "name" : "Short stripes downs",
        "setDecorationFunc" : normaldecoration
    },
    {
        "name" : "Long stripes up",
        "setDecorationFunc" : patternType1
    },
    {
        "name" : "Angle stripes",
        "setDecorationFunc" : patternType2
    },
    {
        "name" : "'Bald' patch",
        "setDecorationFunc" : patternType3
    },
    {
        "name" : "3-prong Leaf",
        "setDecorationFunc" : patternType4
    },      
    {
        "name" : "Stripe with side blobs",
        "setDecorationFunc" : patternType5
    },
    {
        "name" : "Two stripes",
        "setDecorationFunc" : patternType6
    },      
    {
        "name" : "One strip",
        "setDecorationFunc" : patternType7
    },      
    {
        "name" : "Spikey hair",
        "setDecorationFunc" : patternType8
    },
    {
        "name" : "No pattern",
        "setDecorationFunc" : patternType9
    }
]

const animationVariations = [
    {
        "name" : "Roll head",
        "setAnimationFunc" : animationType1
    },
    {
        "name" : "Swish tail",
        "setAnimationFunc" : animationType2
    },
    {
        "name" : "Wiggle left ear",
        "setAnimationFunc" : animationType3
    },
    {
        "name" : "Wiggle right ear",
        "setAnimationFunc" : animationType4
    },
    {
        "name" : "Wiggle both ears",
        "setAnimationFunc" : animationType5
    },      
    {
        "name" : "Alert ears",
        "setAnimationFunc" : animationType6
    },
    {
        "name" : "Twitch nose & whiskers",
        "setAnimationFunc" : animationType7
    },      
    {
        "name" : "Wandering eyes",
        "setAnimationFunc" : animationType8
    },
    {
        "name" : "Standing up",
        "setAnimationFunc" : animationType9
    },
    {
        "name" : "Hyperactive",
        "setAnimationFunc" : animationType10
    }
]


