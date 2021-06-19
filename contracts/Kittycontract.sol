pragma solidity 0.5.12;

import "./IERC721.sol";
import "./IERC721Receiver.sol";

import "./Safemath.sol";
import "./Ownable.sol";
import "./ArrayUtils.sol";

contract KittyContract is IERC721, Ownable {

    using SafeMath for uint256;
    using ArrayUtils for uint256[];

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

    uint64 private constant _GEN0_LIMIT = 10;
    uint256[] private _dnaFormat = [2,2,2,2,1,1,2,2,1,1];   //Used by _exactRandomMixDna()

    uint256 private _gen0KittiesCount;
    string private _name;
    string private _symbol;

    Kitty[] private _kitties;  
    mapping(uint256 => address) private _kittiesOwner;
    mapping(address => uint256) private _ownersKittyCount;
    mapping(address => uint256[]) private _ownersKittyIds;

    mapping(uint256 => address) private _kittiesApprovedOperator;
    mapping(address => mapping(address => bool)) private _ownersApprovedOperators;

    event Birth(
        address owner,
        uint256 kittenId,
        uint256 mumId,
        uint256 dadId,
        uint256 genes,
        uint256 generation
    );


// Public & external functions

    constructor(string memory name, string memory symbol) public {
        _name = name;
        _symbol = symbol;
    }


    function createKittyGen0(uint256 genes) public onlyOwner {
        require(_gen0KittiesCount < _GEN0_LIMIT, "Hit Gen0 creation limit!");
        _gen0KittiesCount = _gen0KittiesCount.add(1);
        _createKitty( 0, 0, 0, genes, msg.sender);
    }


    function breed(uint256 mumId, uint256 dadId) public returns (uint256)
    {
        // Ensure that the breeder is owner or guardian of parent cats
        require(
            _isOwnerOrApproved(
                msg.sender,
                _kittiesOwner[mumId],
                msg.sender,
                mumId
            ),
            "Must have access to mother cat!"
        );
        require(
            _isOwnerOrApproved(
                msg.sender,
                _kittiesOwner[dadId],
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
        uint256 newGen = mumGen.add(dadGen).div(2).add(1);

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


    function getKitty(uint256 kittyId) external view returns (
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


    function getAllYourKittyIds() external view returns(uint256[] memory) {
        // Set pointer to owners array of kitty Ids
        return _ownersKittyIds[msg.sender];
    }


    // IERC165 function implementations
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return (
            interfaceId == _INTERFACE_ID_ERC721 ||
            interfaceId == _INTERFACE_ID_ERC165
        );
    }


    // IERC721 function implementations

    function balanceOf(address owner) external view returns (uint256) {
        return _ownersKittyCount[owner];
    }


    function totalSupply() external view returns (uint256) {
        return _kitties.length;
    }


    function name() external view returns (string memory) {
        return _name;
    }


    function symbol() external view returns (string memory) {
        return _symbol;
    }


    function ownerOf(uint256 tokenId) external view returns (address) {
        require(_isInExistance(tokenId), "Token does not exist!");

        return _kittiesOwner[tokenId];
    }


    function transfer(address to, uint256 tokenId) external {
        // Checks
        require(_isNotZero(to), "Recipient's address is zero!");
        require(to != address(this), "Recipient is contract address!");
        require(_isOwner(msg.sender, tokenId), "Sender is not token owner!");

        // Effects: Transfer token
        _transfer(msg.sender, to, tokenId);
    }


    function approve(address approved, uint256 tokenId) external {
        require(
            _isOwner(msg.sender, tokenId) ||
            _isOperator(_kittiesOwner[tokenId], msg.sender),
            "Not token owner, nor operator!"
        );
        require(_isNotZero(approved), "0 address can't be an approver!");   // Additional check

        _approve(msg.sender, approved, tokenId);
    }


    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender);
        _setApprovalForAll(msg.sender, operator, approved);
    }


    function getApproved(uint256 tokenId) external view returns (address) {
        require(_isInExistance(tokenId), "Token does not exist!");

        return _kittiesApprovedOperator[tokenId];
    }


    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool)
    {
        return _isOperator(owner, operator);
    }


    function safeTransferFrom(
        address from, 
        address to, 
        uint256 tokenId, 
        bytes calldata data
    )
        external
    {  
        _safeTransferFrom(msg.sender, from, to, tokenId, data);
    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    )
        external
    {
        _safeTransferFrom(msg.sender, from, to, tokenId, "");
    }


    function transferFrom(address from, address to, uint256 tokenId) external {
        require(
            _isOwnerOrApproved(msg.sender, from, to, tokenId),
            "No authority to transfer token!"
        );
        _transfer(from, to, tokenId);
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
            _isOperator(_kittiesOwner[tokenId], sender) ||
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
        return (_kittiesOwner[tokenId] == claimer);
    }


    function _isOperator(address owner, address candidate)
        internal
        view
        returns (bool)
    {
        return _ownersApprovedOperators[owner][candidate];
    }


    function _isApproved(address candidate, uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return (candidate == _kittiesApprovedOperator[tokenId]);
    }


    function _isInExistance(uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return (tokenId < _kitties.length);
    }


    function _transfer(address from, address to, uint256 tokenId) internal {

        if (_isNotZero(from)){
            // Remove kittie token from the sender
            delete _kittiesApprovedOperator[tokenId];
            _ownersKittyIds[from].removeFrom(tokenId);
            _ownersKittyCount[from] = _ownersKittyCount[from].sub(1);
        }

        // Give token to the receiver
        _ownersKittyIds[to].push(tokenId);
        _ownersKittyCount[to] = _ownersKittyCount[to].add(1);
        _kittiesOwner[tokenId] = to;

        emit Transfer(from, to, tokenId);
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
        _kittiesApprovedOperator[tokenId] = approved;
        emit Approval(grantor, approved, tokenId);
    }


    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    )
        internal
    {
        _ownersApprovedOperators[owner][operator] = approved;
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
        bytes4 response = IERC721Receiver(to).onERC721Received(
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
                birthTime: uint64(now),
                mumId: uint64(mumId),
                dadId: uint64(dadId),
                generation: uint64(generation)
            }
        );
        uint256 newKittenId = (_kitties.push(newKitty)).sub(1);
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
        uint8 random = uint8(now.mod(256));
        uint256 index = 8; // counter for 8 x 2-digit pairs (that make up dna)

        // Create gene array (for each 2-digit pair of the 16-digit dna)
        uint256 i;
        for (i = 1; i <= 128; i= i.mul(2) ) {
            index = index.sub(1); // move back one 2-digit pair
            // DNA 16 digits
            if (random & i != 0) {
                newGenes[index] = uint8(mumDna.mod(100));  // get last 2 digits
            } else {
                newGenes[index] = uint8(dadDna.mod(100));  
            }
            // remove last two digits of the dna
            mumDna = mumDna.div(100);
            dadDna = dadDna.div(100);
        } 
        assert(index == 0);            // processed all 8 dna digit-pairs
        assert(newGenes.length == 8);  // correct number of new dna digit-pairs

        uint256 dnaSequence;
        for (i = 0; i < 8; i++) {   // i==0 gives the 2 most-sig gene digits
            dnaSequence = dnaSequence.add(newGenes[i]);  
            if (i != 7) dnaSequence = dnaSequence.mul(100);
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
        uint256 value = _getHashAsInteger(now); 
        uint8 random = uint8(value.mod(256));  //8 least-sig digits (2^8 = 256)
        
        uint256 index = 8; // counter for 8 x 2-digit pairs (that make up dna)

        // Create gene array (for each 2-digit pair of the 16-digit dna)
        uint256 i;
        for (i = 1; i <= 128; i = i.mul(2)) {
            index = index.sub(1);  // move back one 2-digit pair
            if (random & i != 0) {
                newGenes[index] = uint8(mumDna.mod(100));  // Take last 2 digits
            } else {
                newGenes[index] = uint8(dadDna.mod(100));  
            }
            // remove last two digits of the dna
            mumDna = mumDna.div(100);
            dadDna = dadDna.div(100);
        } 
        assert(index == 0);            // processed all 8 dna digit-pairs
        assert(newGenes.length == 8);  // correct number of new dna digit-pairs

        // Construct the new (16-digit) dna number (from 8 x 2-digit genes)
        uint256 dnaSequence;
        for (i = 0; i < 8; i++) {   // i==0 gives the 2 most-sig gene digits
            dnaSequence = dnaSequence.add(newGenes[i]);  
            if (i != 7) dnaSequence = dnaSequence.mul(100);
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
        uint256 value = _getHashAsInteger(now);
        uint16 random = uint16(value.mod(65536)); //Last 16 digits (2^&16==65536)
        
        uint256 index = 16; // counter for 16 digit dna digits

        // Determine which genes comes from each parent (for each of 16-digits)
        // Note: most-sig digit's value of 16-digit binary num = 2^15 = 32,768
        //      (most-sign digit's value of 8-digit binary number = 2^7 = 128)
        uint256 i;
        for (i = 1; i <= 32768; i= i.mul(2)) {
            index = index.sub(1);
            if (random & i != 0) {                   // Select mum's dna digit
                newGenes[index] = uint16(mumDna.mod(10)); 
            } else {                                 // Select dad's dna digit
                newGenes[index] = uint16(dadDna.mod(10)); 
            }
            
            // Remove the processed least-sig digit
            mumDna = mumDna.div(10);
            dadDna = dadDna.div(10);
        } 
        assert(index == 0);            // processed all 16 dna digits
        assert(newGenes.length == 16); // correct number of new dna digits

        // Construct the (16-digit) dna number (from gene digits)
        uint256 dnaSequence;
        for (i = 0; i < 16; i++) {
            dnaSequence = dnaSequence.add(newGenes[i]); // i==0 is most-sig gene digit
            if (i != 15) dnaSequence = dnaSequence.mul(10);
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
        uint256 value = _getHashAsInteger(now);
        uint16 random = uint16(value.mod(65536)); //Last 16 digits (2^&16==65536)
        
        // initialise counters for processing dna
        uint256 index = 16;         // counter for 16 digit dna digits
        uint256 geneNumber = 10;    // counter for 10 genes in dna
        
        // Mix dna of parents, from least-significant dna digit, gene by gene
        uint256 i = 1;      
        for (i = 1; i <= 32768; i= i.mul(2)) {
            index = index.sub(1);
            geneNumber = geneNumber.sub(1);
            if (random & i != 0) {                    // Select mum's dna gene
                newGenes[index] = uint16(mumDna.mod(10)); 
                if (_dnaFormat[geneNumber] == 2) {    // Process 2nd gene digit
                    // Move on past processed first digit (of 2-digit value)
                    i = i.mul(2);
                    index = index.sub(1); 
                    mumDna = mumDna.div(10);
                    dadDna = dadDna.div(10);
                    // Store second digit of mum's gene value
                    newGenes[index] = uint16(mumDna.mod(10));
                }
            } else {                                   // Select dad's dna gene
                newGenes[index] = uint16(dadDna.mod(10));
                if (_dnaFormat[geneNumber] == 2) {     // Process 2nd gene digit
                    // Move on past processed first digit (of 2-digit value)
                    i = i.mul(2);
                    index = index.sub(1); 
                    mumDna = mumDna.div(10);
                    dadDna = dadDna.div(10);
                    // Store second digit of dad's gene value
                    newGenes[index] = uint16(dadDna.mod(10));
                }
            }
            
            // Move past the last processed digit, ready for next gene value
            mumDna = mumDna.div(10);
            dadDna = dadDna.div(10);
        }
        assert(geneNumber == 0);       // processed all 10 dna genes
        assert(index == 0);            // processed all 16 dna digits
        assert(newGenes.length == 16); // correct number of new dna digits
        
        
        // Randomise one 'target' gene - as specified by last gene (single digit)
        uint256 targetGene = newGenes[15];
        
        // Find this 'target' gene in the dna
        uint256 dnaPos = 0;
        for (i = 0; i < targetGene; i++) {
           dnaPos = dnaPos.add(_dnaFormat[i]);
        }
        uint256 geneDigits = _dnaFormat[targetGene];
        
        // Get next random digit (discarding previously used 16 random digits)
        uint256 unusedDigits = value.div(65536);       // 2^&16 = 65,536
        uint256 randomDigit = unusedDigits.mod(10);
        
        // Randomise the digit(s) of this target gene
        newGenes[dnaPos] = randomDigit;
        if (geneDigits == 2) { 
            unusedDigits = unusedDigits.div(10);
            randomDigit = unusedDigits.mod(10);
            newGenes[dnaPos+1] = randomDigit;
        }

        // Construct new (16-digit) dna (from individual gene digits)
        uint256 dnaSequence;
        for (i = 0; i < 16; i++) {
            dnaSequence = dnaSequence.add(newGenes[i]);  // i==0 is most-sig gene digit
            if (i != 15) dnaSequence = dnaSequence.mul(10);
        }

        return dnaSequence;
    }


    function _basicMixDna(uint256 mumDna, uint256 dadDna)
        internal
        pure
        returns (uint256)
    {
    // Create new dna from first half of mum's dna and second half of dad's dna      
        uint256 firstEightDigits = mumDna.div(100000000);
        uint256 lastEightDigits = dadDna.mod(100000000);
        uint256 newDna = (firstEightDigits.mul(100000000)).add(lastEightDigits);
        return newDna;
    }
}

