// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";

contract DragonToken is
    OwnableUpgradeable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721PausableUpgradeable
{
    struct Dragon {
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
    uint256 private _gen0DragonCount;
    uint256[] private _dnaFormat;   //Used by _exactRandomMixDna()
    Dragon[] private _dragons;  

    event Birth(
        address owner,
        uint256 babyDragonId,
        uint256 mumId,
        uint256 dadId,
        uint256 genes,
        uint256 generation
    );


// Public functions
    // Initializer for the upgradeable contract (instead of constructor) 
    // that can only be executed once (that must be done upon deployment)
    function init_DragonToken(
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

    // Functions to pause or unpause all functions that have
    // the whenNotPaused or whenPaused modify applied on them
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyOwner whenPaused {
        _unpause();
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


// External functions

    function createDragonGen0(uint256 genes)
        external
        onlyOwner
    {
        require(_gen0DragonCount < _gen0Limit, "Hit Gen0 creation limit!");
        _gen0DragonCount++;
        _createDragon( 0, 0, 0, genes, msg.sender);
    }


    function breed(uint256 mumId, uint256 dadId) 
        external
        returns (uint256)
    {
        // Ensure that the breeder is owner or guardian of parent dragons
        require(
            _isApprovedOrOwner(
                msg.sender,
                mumId
            ),
            "Must have access to mother dragon!"
        );
        require(
            _isApprovedOrOwner(
                msg.sender,
                dadId
            ),
            "Must have access to father dragon!"
        );
        // Determine new Dragon's DNA
        uint256 newDna = _exactRandomMixDna(_dragons[mumId].genes, _dragons[dadId].genes);

        // Calculate new dragon's Generation
        uint256 mumGen = _dragons[mumId].generation;
        uint256 dadGen = _dragons[dadId].generation;
        uint256 newGen = ((mumGen + dadGen) / 2) + 1;

        // Create the new dragon (with breeder becoming the owner)
        uint256 newDragonId = _createDragon(
            mumId,
            dadId,
            newGen,
            newDna,
            msg.sender
        );
        return newDragonId;
    }


    function getDragon(uint256 dragonId)
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
        require(_exists(dragonId), "No such dragon id!");
        return (
            _dragons[dragonId].genes, 
            _dragons[dragonId].birthTime,
            _dragons[dragonId].mumId, 
            _dragons[dragonId].dadId, 
            _dragons[dragonId].generation
        );
    }


    function getAllYourDragonIds() 
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


// Private functions

    function _createDragon(
        uint256 mumId,
        uint256 dadId,
        uint256 generation,
        uint256 genes,
        address owner
    ) 
        private
        returns (uint256)
    {
        Dragon memory babyDragon = Dragon(
            {
                genes: genes,
                birthTime: uint64(block.timestamp),
                mumId: uint64(mumId),
                dadId: uint64(dadId),
                generation: uint64(generation)
            }
        );
        _dragons.push(babyDragon);
        uint256 babyDragonId = _dragons.length - 1;
        emit Birth(owner, babyDragonId, mumId, dadId, genes, generation);
        _safeMint(owner, babyDragonId);
        return babyDragonId;
    }


    // Randomy mix parent dna, gene-by-gene, with a one random gene value.
    // This accounts for two-digit gene values (eg. head colour).
    // After creating new DNA, a single 'target' gene value is randomised.
    // This 'target' gene is specified by the last gene (single digit of dna).
    // Eg. If last dna digit==0, randomise most-sig digits 1&2 (2-digit gene);
    // If last digit is 4, randomise digit 9 (as it's a 1-digit gene); and
    // If last digit is 9, randomise last (least-sig) digit (also 1-digit gene).
    function _exactRandomMixDna(uint256 mumDna, uint256 dadDna)
        private
        view
        returns (uint256)
    {
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


    function _getHashAsInteger(uint value) internal pure returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(value));
        return uint256(hash);
    }
}