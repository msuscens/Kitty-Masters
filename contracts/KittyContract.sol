// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";

contract KittyContract is
    OwnableUpgradeable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721PausableUpgradeable
{
    struct Kitty {
        uint256 genes;
        uint64 birthTime;
        uint64 mumId;
        uint64 dadId;
        uint64 generation;
    }

    bytes4 internal constant _ERC721_RECEIVED =
        bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;
    // Note: bytes4(keccak256('supportsInterface(bytes4) == 0x01ffc9a7'));

    uint256 private _gen0Limit;
    uint256 private _gen0KittiesCount;
    uint256[] private _dnaFormat;   //Used by _exactRandomMixDna()
    Kitty[] private _kitties;  

    event Birth(
        address owner,
        uint256 kittenId,
        uint256 mumId,
        uint256 dadId,
        uint256 genes,
        uint256 generation
    );

// Public & external functions

    function init_KittyContract(
        string memory tokenName, 
        string memory tokenSymbol,
        uint256 gen0Limit
    )
        public
        initializer
    {
        OwnableUpgradeable.__Ownable_init();
        ERC721Upgradeable.__ERC721_init(tokenName, tokenSymbol);
        ERC721PausableUpgradeable.__ERC721Pausable_init();
        _gen0Limit = gen0Limit;
        _dnaFormat = [2,2,2,2,1,1,2,2,1,1];   //Used by _exactRandomMixDna()
    }


    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            ERC721PausableUpgradeable
        )
        whenNotPaused   // make _transfer() pausible
    {
        super._beforeTokenTransfer(from, to, amount);
    }


    // Functions to pause or unpause all functions that have
    // the whenNotPaused or whenPaused modify applied on them
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyOwner whenPaused {
        _unpause();
    }


    function createKittyGen0(uint256 genes)
        external
        onlyOwner
    {
        require(_gen0KittiesCount < _gen0Limit, "Hit Gen0 creation limit!");
        _gen0KittiesCount++;
        _createKitty( 0, 0, 0, genes, msg.sender);
    }


    function breed(uint256 mumId, uint256 dadId) 
        external
        returns (uint256)
    {
        // Ensure that the breeder is owner or guardian of parent cats
        require(
            _isApprovedOrOwner(
                msg.sender,
                mumId
            ),
            "Must have access to mother cat!"
        );
        require(
            _isApprovedOrOwner(
                msg.sender,
                dadId
            ),
            "Must have access to father cat!"
        );
        // Determine new kitty's DNA
        uint256 newDna = _exactRandomMixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        
        // Alternative dna mixing functions below:
        // uint256 newDna = _basicMixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        // uint256 newDna = _mixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        // uint256 newDna = _improvedMixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        // uint256 newDna = _completeMixDna(_kitties[mumId].genes, _kitties[dadId].genes);

        // Calculate new kitties Generation
        uint256 mumGen = _kitties[mumId].generation;
        uint256 dadGen = _kitties[dadId].generation;
        uint256 newGen = ((mumGen + dadGen) / 2) + 1;

        // Create the new kitty (with breeder becoming new kitties owner)
        uint256 newKittyId = _createKitty(
            mumId,
            dadId,
            newGen,
            newDna,
            msg.sender
        );
        return newKittyId;
    }


    function getKitty(uint256 kittyId)
        external
        view
        returns (
            uint256 genes,
            uint64 birthTime, 
            uint64 mumId,
            uint64 dadId,
            uint64 generation
        )
    {
        require(_exists(kittyId), "No such kitty id!");
        return (
            _kitties[kittyId].genes, 
            _kitties[kittyId].birthTime,
            _kitties[kittyId].mumId, 
            _kitties[kittyId].dadId, 
            _kitties[kittyId].generation
        );
    }


    function getAllYourKittyIds() 
        external 
        view 
        returns(uint256[] memory) 
    {
        uint256 totalOwned = balanceOf(msg.sender);
        uint256[] memory tokenIds = new uint[](totalOwned);

        for (uint256 index=0; index < totalOwned; index++) {
            tokenIds[index] = tokenOfOwnerByIndex(msg.sender, index);
        }
        return tokenIds;
    }


    // IERC165 
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable
        )
        returns (bool)
    {
      return (
        interfaceId == _INTERFACE_ID_ERC721 ||
        interfaceId == _INTERFACE_ID_ERC165 ||
        super.supportsInterface(interfaceId)
      );
    }

// Internal  functions

    function _checkERC721Support(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    )
        internal
        returns (bool)
    {
        if (!_isContract(to)) return true;

        // Call onERC721Received in the _to contract
        bytes4 response = IERC721ReceiverUpgradeable(to).onERC721Received(
            msg.sender,
            from,
            tokenId,
            data
        );
        return (response == _ERC721_RECEIVED);
    }

    function _isContract(address to) internal view returns (bool) {
        uint32 codeSize;
        assembly{
            codeSize := extcodesize(to)
        }
        return (codeSize > 0);
    }


// Private functions

    function _createKitty(
        uint256 mumId,
        uint256 dadId,
        uint256 generation,
        uint256 genes,
        address owner
    ) 
        private
        returns (uint256)
    {
        Kitty memory newKitty = Kitty(
            {
                genes: genes,
                birthTime: uint64(block.timestamp),
                mumId: uint64(mumId),
                dadId: uint64(dadId),
                generation: uint64(generation)
            }
        );
        _kitties.push(newKitty);
        uint256 newKittenId = _kitties.length - 1;
        emit Birth(owner, newKittenId, mumId, dadId, genes, generation);
        _safeMint(owner, newKittenId);
        return newKittenId;
    }


    // *** DNA Mixing Functions  - 5 versions ****
    // Simplest to most sophisticated/complex they are:
    //      _basicMixDna
    //      _mixDna
    //      _improvedMixDna
    //      _completeMixDna
    //      _exactRandomMixDna
    //
    function _basicMixDna(uint256 mumDna, uint256 dadDna)
        internal
        pure
        returns (uint256)
    {
    // Create new dna from first half of mum's dna and second half of dad's dna      
        uint256 firstEightDigits = mumDna / 100000000;
        uint256 lastEightDigits = dadDna % 100000000;
        uint256 newDna = (firstEightDigits * 100000000) + lastEightDigits;
        return newDna;
    }


    function _mixDna(uint256 mumDna, uint256 dadDna)
        internal
        view
        returns (uint256)
    {
        uint256[8] memory newGenes;
        uint8 random = uint8(block.timestamp % 256);
        uint256 index = 8; // counter for 8 x 2-digit pairs (that make up dna)

        // Create gene array (for each 2-digit pair of the 16-digit dna)
        uint256 i;
        for (i = 1; i <= 128; i *= 2) {
            index--; // move back one 2-digit pair
            // DNA 16 digits
            if (random & i != 0) {
                newGenes[index] = uint8(mumDna % 100);  // get last 2 digits
            } else {
                newGenes[index] = uint8(dadDna % 100);  
            }
            // remove last two digits of the dna
            mumDna /= 100;
            dadDna /= 100;
        } 
        assert(index == 0);            // processed all 8 dna digit-pairs
        assert(newGenes.length == 8);  // correct number of new dna digit-pairs

        uint256 dnaSequence;
        for (i = 0; i < 8; i++) {   // i==0 gives the 2 most-sig gene digits
            dnaSequence += newGenes[i];  
            if (i != 7) dnaSequence *= 100;
        }
        return dnaSequence;
    }


    function _improvedMixDna(uint256 mumDna, uint256 dadDna)
        internal
        view
        returns (uint256)
    {
    // Mix 16 digits of parent's dna, 2-digits at a time, to make new dna.
    // Note: This doesn't cause any gene mutation, each gene value will always 
    // come from either the mum or dad.  However, single-digit adjacent genes
    // (ie. genes 5&6 and 9&10) will always come from only one parent.
        uint256[8] memory newGenes;
        
        // Get 8-digit pseudo-random integer (assumes 1+ secs since last get)
        uint256 value = _getHashAsInteger(block.timestamp); 
        uint8 random = uint8(value % 256);  //8 least-sig digits (2^8 = 256)
        
        uint256 index = 8; // counter for 8 x 2-digit pairs (that make up dna)

        // Create gene array (for each 2-digit pair of the 16-digit dna)
        uint256 i;
        for (i = 1; i <= 128; i *= 2) {
            index--;  // move back one 2-digit pair
            if (random & i != 0) {
                newGenes[index] = uint8(mumDna % 100);  // Take last 2 digits
            } else {
                newGenes[index] = uint8(dadDna % 100);  
            }
            // remove last two digits of the dna
            mumDna /= 100;
            dadDna /= 100;
        } 
        assert(index == 0);            // processed all 8 dna digit-pairs
        assert(newGenes.length == 8);  // correct number of new dna digit-pairs

        // Construct the new (16-digit) dna number (from 8 x 2-digit genes)
        uint256 dnaSequence;
        for (i = 0; i < 8; i++) {   // i==0 gives the 2 most-sig gene digits
            dnaSequence += newGenes[i];  
            if (i != 7) dnaSequence *= 100;
        }
        return dnaSequence;
    }    
    

    function _getHashAsInteger(uint value) internal pure returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(value));
        return uint256(hash);
    }


    function _completeMixDna(uint256 mumDna, uint256 dadDna)
        internal
        view
        returns (uint256)
    {
    // Mixes all 16 digit dna, digit-by-digit (irrespective of gene size).
    // Note: For two-digit gene values (eg. colour) there's a 50% chance of
    // inheritance from either mother or father and 50% chance of a mutated 
    // 2-digit value. This mutated 2-digit value is composed of the most-sig 
    // digit from the one parent's 2-digit gene, and the least-sig digit from
    // the other parent's 2-digit gene - eg. mum 52, dad 93 may give 53 or 92).
        uint256[16] memory newGenes;

        // Get 16-digit pseudo-random number (assumes 1+ secs since last get)
        uint256 value = _getHashAsInteger(block.timestamp);
        uint16 random = uint16(value % 65536); //Last 16 digits (2^&16==65536)
        
        uint256 index = 16; // counter for 16 digit dna digits

        // Determine which genes comes from each parent (for each of 16-digits)
        // Note: most-sig digit's value of 16-digit binary num = 2^15 = 32,768
        //      (most-sign digit's value of 8-digit binary number = 2^7 = 128)
        uint256 i;
        for (i = 1; i <= 32768; i *= 2) {
            index--;
            if (random & i != 0) {                   // Select mum's dna digit
                newGenes[index] = uint16(mumDna % 10); 
            } else {                                 // Select dad's dna digit
                newGenes[index] = uint16(dadDna % 10); 
            }
            
            // Remove the processed least-sig digit
            mumDna /= 10;
            dadDna /= 10;
        } 
        assert(index == 0);            // processed all 16 dna digits
        assert(newGenes.length == 16); // correct number of new dna digits

        // Construct the (16-digit) dna number (from gene digits)
        uint256 dnaSequence;
        for (i = 0; i < 16; i++) {
            dnaSequence += newGenes[i]; // i==0 is most-sig gene digit
            if (i != 15) dnaSequence *= 10;
        }
        return dnaSequence;
    }
    

    function _exactRandomMixDna(uint256 mumDna, uint256 dadDna)
        internal
        view
        returns (uint256)
    {
    // Randomy mix parent dna, gene-by-gene, with a one random gene value.
    // This accounts for two-digit gene values (eg. head colour).
    // After creating new DNA, a single 'target' gene value is randomised.
    // This 'target' gene is specified by the last gene (single digit of dna).
    // Eg. If last dna digit==0, randomise most-sig digits 1&2 (2-digit gene);
    // If last digit is 4, randomise digit 9 (as it's a 1-digit gene); and
    // If last digit is 9, randomise last (least-sig) digit (also 1-digit gene).

        uint256[16] memory newGenes;

        // Get pseudo-random 16-digit number 
        uint256 value = _getHashAsInteger(block.timestamp);
        uint16 random = uint16(value % 65536); //Last 16 digits (2^&16==65536)
        
        // initialise counters for processing dna
        uint256 index = 16;         // counter for 16 digit dna digits
        uint256 geneNumber = 10;    // counter for 10 genes in dna
        
        // Mix dna of parents, from least-significant dna digit, gene by gene
        uint256 i = 1;      
        for (i = 1; i <= 32768; i *= 2) {
            index--;
            geneNumber--;
            if (random & i != 0) {                    // Select mum's dna gene
                newGenes[index] = uint16(mumDna % 10); 
                if (_dnaFormat[geneNumber] == 2) {    // Process 2nd gene digit
                    // Move on past processed first digit (of 2-digit value)
                    i *= 2;
                    index--; 
                    mumDna /= 10;
                    dadDna /= 10;
                    // Store second digit of mum's gene value
                    newGenes[index] = uint16(mumDna % 10);
                }
            } else {                                   // Select dad's dna gene
                newGenes[index] = uint16(dadDna % 10);
                if (_dnaFormat[geneNumber] == 2) {     // Process 2nd gene digit
                    // Move on past processed first digit (of 2-digit value)
                    i *= 2;
                    index--; 
                    mumDna /= 10;
                    dadDna /= 10;
                    // Store second digit of dad's gene value
                    newGenes[index] = uint16(dadDna % 10);
                }
            }
            
            // Move past the last processed digit, ready for next gene value
            mumDna /= 10;
            dadDna /= 10;
        }
        assert(geneNumber == 0);       // processed all 10 dna genes
        assert(index == 0);            // processed all 16 dna digits
        assert(newGenes.length == 16); // correct number of new dna digits
        
        // Randomise one 'target' gene - as specified by last gene (single digit)
        uint256 targetGene = newGenes[15];
        
        // Find this 'target' gene in the dna
        uint256 dnaPos = 0;
        for (i = 0; i < targetGene; i++) {
           dnaPos += _dnaFormat[i];
        }
        uint256 geneDigits = _dnaFormat[targetGene];
        
        // Get next random digit (discarding previously used 16 random digits)
        uint256 unusedDigits = value / 65536;       // 2^&16 = 65,536
        uint256 randomDigit = unusedDigits % 10;
        
        // Randomise the digit(s) of this target gene
        newGenes[dnaPos] = randomDigit;
        if (geneDigits == 2) { 
            unusedDigits /= 10;
            randomDigit = unusedDigits % 10;
            newGenes[dnaPos+1] = randomDigit;
        }

        // Construct new (16-digit) dna (from individual gene digits)
        uint256 dnaSequence;
        for (i = 0; i < 16; i++) {
            dnaSequence += newGenes[i];  // i==0 is most-sig gene digit
            if (i != 15) dnaSequence *= 10;
        }
        return dnaSequence;
    }

}