pragma solidity 0.5.12;

library ArrayUtils {
    
    function removeFrom(uint256[] storage array, uint256 value) public{
    // Finds and removes given value from an array (NB. array order not maintained) 
        for (uint256 i = 0; i < array.length; i++){
            if (array[i] == value){
                array[i] = array[array.length-1];
                array.pop();
                break;
            }
        }
    }
}