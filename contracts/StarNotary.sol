pragma solidity >=0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";


contract StarNotary is ERC721 {

    // name: Is a short name to your token
    string public  contractName;

    // symbol: Is a short string like 'USD' -> 'American Dollar'
    string public  contractSymbol;

    //creator
    address public  contractCreator;

    constructor (string memory name, string memory symbol) public {
        contractName = name;
        contractSymbol = symbol;
        contractCreator = msg.sender;
    }


    struct Star {
        string name;
        bool exists;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;


    // function ooks up the stars using the Token ID, and then returns the name of the star
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        string memory name = tokenIdToStarInfo[_tokenId].name ;
        //console.log("lookUptokenIdToStarInfo star name for tokenId: " + _tokenId + " is : " + name );
        return name;  // returns the star name
    }

    // Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        require(tokenIdToStarInfo[_tokenId1].exists);
        require(tokenIdToStarInfo[_tokenId2].exists);

        Star memory star1 = tokenIdToStarInfo[_tokenId1];
        Star memory star2 = tokenIdToStarInfo[_tokenId2];

        tokenIdToStarInfo[_tokenId1] = star2;
        tokenIdToStarInfo[_tokenId2] = star1;
    }

    // transfer a star from the address of the caller to the to address given in the function
    function transferStar(address _to1, uint256 _tokenId) public {
        require(_to1 != address(0));
        require(ownerOf(_tokenId) == msg.sender, "You can't transfer the star you dont own");

        safeTransferFrom(msg.sender, _to1, _tokenId);
    }


    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name, true); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting a Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sell the Star you don't own");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

}
