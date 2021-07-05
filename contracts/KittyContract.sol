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

    uint64 private _GEN0_LIMIT;
    uint256[] private _dnaFormat;   //Used by _exactRandomMixDna()

    uint256 private _gen0KittiesCount;

    Kitty[] private _kitties;  
/*
    mapping(uint256 => address) private _kittiesOwner;      // _owners == _kittiesOwner
    mapping(address => uint256) private _ownersKittyCount;  // _balances == _ownersKittyCount
    mapping(address => uint256[]) private _ownersKittyIds;  //_ownedTokens == _ownersKittyIds
    mapping(uint256 => address) private _kittiesApprovedOperator;   // _tokenApprovals == _kittiesApprovedOperator
    mapping(address => mapping(address => bool)) private _ownersApprovedOperators; // _operatorApprovals == _ownersApprovedOperators
*/

    mapping(uint256 => address) private _owners;      // _owners == _kittiesOwner
    mapping(address => uint256) private _balances;  // _balances == _ownersKittyCount
    mapping(address => uint256[]) private _ownedTokens;  //_ownedTokens == _ownersKittyIds

    mapping(uint256 => address) private _tokenApprovals;   // _tokenApprovals == _kittiesApprovedOperator
    mapping(address => mapping(address => bool)) private _operatorApprovals; // _operatorApprovals == _ownersApprovedOperators


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
        string memory tokenSymbol
    )
        public
        initializer
    {
        OwnableUpgradeable.__Ownable_init();
        ERC721Upgradeable.__ERC721_init(tokenName, tokenSymbol);
        ERC721PausableUpgradeable.__ERC721Pausable_init();

        _GEN0_LIMIT = 10;
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
    {
        super._beforeTokenTransfer(from, to, amount);
    }


    function createKittyGen0(uint256 genes)
        external
        onlyOwner
    {
        require(_gen0KittiesCount < _GEN0_LIMIT, "Hit Gen0 creation limit!");
        _gen0KittiesCount++;
        _createKitty( 0, 0, 0, genes, msg.sender);
    }


    function breed(uint256 mumId, uint256 dadId) 
        external
        returns (uint256)
    {
        // Ensure that the breeder is owner or guardian of parent cats
        require(
            _isOwnerOrApproved(
                msg.sender,
                _owners[mumId],
                msg.sender,
                mumId
            ),
            "Must have access to mother cat!"
        );
        require(
            _isOwnerOrApproved(
                msg.sender,
                _owners[dadId],
                msg.sender,
                dadId
            ),
            "Must have access to father cat!"
        );

        // Determine new kitty's DNA
        // (Alternative dna mixing functions commented out below)
        // uint256 newDna = _basicMixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        // uint256 newDna = _mixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        // uint256 newDna = _improvedMixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        // uint256 newDna = _completeMixDna(_kitties[mumId].genes, _kitties[dadId].genes);
        uint256 newDna = _exactRandomMixDna(_kitties[mumId].genes, _kitties[dadId].genes);

        // Calculate new kitties Generation
        uint256 mumGen = _kitties[mumId].generation;
        uint256 dadGen = _kitties[dadId].generation;
        uint256 newGen = ((mumGen + dadGen) / 2) + 1;
        // uint256 newGen = mumGen.add(dadGen).div(2).add(1);

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
        require(_isInExistance(kittyId), "No such kitty id!");
        
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
        // Set pointer to owners array of kitty Ids
        return _ownedTokens[msg.sender];
    }


    // IERC165 function implementations
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


    // IERC721 function implementations

    function totalSupply() public view override returns (uint256) {
        return _kitties.length;
    }

/* *** TODO REFACTOR THIS CONTRACT - FUNCTIONS AND STATE VAIRABLES
/* *** As it declares same functions and corresponding state variables
        as in ERC721Upgradeable contract, e.g.
        balanceOf(): with mapping _ownersKittyCount === _balances mapping
        name(): with _name === _name (declared in ERC721Upgradeable)
        symbol(): with _symbol === _symbol (declared in ERC721Upgradeable)
        _name and _symbol

        approve(address approved, uint256 tokenId) === approve(address to, uint256 tokenId)
        etc,
        etc...
******/

    function balanceOf(address owner)
        public
        view
        override
        returns (uint256)
    {
        return _balances[owner];    // _balances == _ownersKittyCount
    }


    function ownerOf(uint256 tokenId)
        public
        view
        override
        returns (address)
    {
        require(_isInExistance(tokenId), "Token does not exist!");
        return _owners[tokenId];  // _owners == _kittiesOwner
    }


    function approve(address approved, uint256 tokenId) public override {
        require(
            _isOwner(msg.sender, tokenId) ||
            _isOperator(_owners[tokenId], msg.sender),
            "Not token owner, nor operator!"
        );
        require(_isNotZero(approved), "0 address can't be an approver!");   // Additional check
        _approve(msg.sender, approved, tokenId);
    }


    function getApproved(uint256 tokenId)
        public
        view
        override
        returns (address)
    {
        require(_isInExistance(tokenId), "Token does not exist!");
        return _tokenApprovals[tokenId];   // _tokenApprovals == _kittiesApprovedOperator
    }


    function setApprovalForAll(address operator, bool approved)
        public
        override
    {
        require(operator != msg.sender);
        _setApprovalForAll(msg.sender, operator, approved);
    }


    function isApprovedForAll(address owner, address operator)
        public
        view
        override
        returns (bool)
    {
        return _isOperator(owner, operator);
    }


    function transferFrom(address from, address to, uint256 tokenId)
        public
        override
    {
        require(
            _isOwnerOrApproved(msg.sender, from, to, tokenId),
            "No authority to transfer token!"
        );
        _transfer(from, to, tokenId);
    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    )
        public
        override
    {
        _safeTransferFrom(msg.sender, from, to, tokenId, "");
    }


    function safeTransferFrom(
        address from, 
        address to, 
        uint256 tokenId, 
        bytes calldata data
    )
        public
        override
    {  
        _safeTransferFrom(msg.sender, from, to, tokenId, data);
    }


    function transfer(address to, uint256 tokenId) external {
        // Checks
        require(_isNotZero(to), "Recipient's address is zero!");
        require(to != address(this), "Recipient is contract address!");
        require(_isOwner(msg.sender, tokenId), "Sender is not token owner!");

        // Effects: Transfer token
        _transfer(msg.sender, to, tokenId);
    }


// Internal & private functions

    function _isOwnerOrApproved(
        address sender,
        address from,
        address to,
        uint256 tokenId
    )
        internal
        view
        returns (bool)
    {
        require(_isInExistance(tokenId), "Token doesn't exist!");
        require(_isOwner(from, tokenId), "'from' doesn't own token!");
        require(_isNotZero(to), "Recipient's address is zero!");

        return (
            _isOwner(sender, tokenId) ||
            _isOperator(_owners[tokenId], sender) ||
            _isApproved(sender, tokenId)
        );
    }


    function _isNotZero(address candidate)
        internal
        pure
        returns (bool)
    {
        return (candidate != address(0));
    }


    function _isOwner(address claimer, uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return (_owners[tokenId] == claimer);
    }


    function _isOperator(address owner, address candidate)
        internal
        view
        returns (bool)
    {
        return _operatorApprovals[owner][candidate];
    }


    function _isApproved(address candidate, uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return (candidate == _tokenApprovals[tokenId]);
    }


    function _isInExistance(uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return (tokenId < _kitties.length);
    }


/* *** TODO - AS ABOVE REVIEW AND REFACTOR THESE FUNCTIONS AS THEY 
                NOW OVERRIDE THOSE FUNCTIONS IN ERC721Upgradeable !!
***  */

    function _transfer(address from, address to, uint256 tokenId)
        internal
        override
    {
        if (_isNotZero(from)){
            // Remove kittie token from the sender
            delete _tokenApprovals[tokenId];
            _removeFrom(_ownedTokens[from], tokenId);
            _balances[from]--;
        }

        // Give token to the receiver
        _ownedTokens[to].push(tokenId);
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _removeFrom(uint256[] storage array, uint256 value) internal {
    // Finds and removes given value from an array (NB. array order is not maintained) 
        for (uint256 i = 0; i < array.length; i++){
            if (array[i] == value){
                array[i] = array[array.length-1];
                array.pop();
                break;
            }
        }
    }


    function _safeTransferFrom(
        address sender, 
        address from, 
        address to, 
        uint256 tokenId, 
        bytes memory data
    )
        internal
    {
        require(
            _isOwnerOrApproved(sender, from, to, tokenId),
            "No authority to transfer token!"
        );
        
        _safeTransfer(from, to, tokenId, data);
    }


    function _safeTransfer(
        address from, 
        address to, 
        uint256 tokenId, 
        bytes memory data
    )
        internal
        override
    {
        _transfer(from, to, tokenId);
        require(_checkERC721Support(from, to, tokenId, data));
    }


    function _approve(
        address grantor,
        address approved,
        uint256 tokenId
    )
        internal
    {
        _tokenApprovals[tokenId] = approved;
        emit Approval(grantor, approved, tokenId);
    }


    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    )
        internal
    {
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }


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
        
        // bytes4 response = IERC721Receiver(to).onERC721Received(
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
        _safeTransfer(address(0), owner, newKittenId, "");
        return newKittenId;
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

}