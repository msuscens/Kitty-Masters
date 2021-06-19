function getRandomIntegerBetween(low, high){
    try {
      if (low<0) throw "Error: Only supports positive integers - low is negative!"
      if (low>high) throw "Error: low is greater than high!"
  
      const rangeInclusive = high - low + 1 
      const RandomValue = Math.floor(Math.random() * rangeInclusive) + low
  
      return RandomValue
    }
    catch(error) {
      throw(`In getRandomIntegerBetween(${low}, ${high}): ${error}`)
    }
  }


  function getParamFromUrl(url, paramId) {
    try {
      const startParamIdPos = url.lastIndexOf(paramId)
      if (startParamIdPos == -1) {
          throw new Error(`Parameter: "${paramId}" not present in url: "${url}"`)
      }
      const startParamValPos = startParamIdPos + paramId.length
  
      const endDelimPos = url.indexOf("&", startParamValPos)
      const endParamValPos = (endDelimPos > -1)? endDelimPos: url.length 
  
      const param = url.substring( startParamValPos, endParamValPos )
      
      return param
    }
    catch(error) {
      throw("HelperFunctions.js: In getParamFromUrl(url, paramId): " + error)
    }
  }
  