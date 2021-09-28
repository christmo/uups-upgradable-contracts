//SPDX-License-Identifier: UNLICENSED

pragma solidity >0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract VolcanoToken is Ownable, ERC721("Token NFT Christian Mora", "VTCM") {
    uint256 public tokenId = 1;
    uint256 public marketCap = 0;
	uint public constant VERSION = 1;

    mapping(address => Metadata[]) public ownership;
    //mapping(address => uint256[]) public tokenIdsByAddress;
    mapping(uint256 => uint256) public tokenIdToPrice;
    mapping(uint8 => VisualToken[]) listTokensCirculating; //Only used for visual porpuses

    event NftBought(address _seller, address _buyer, uint256 _price);
    event NftMinted(address _owner, uint256 _tokenId);

    struct Metadata {
        uint256 timestamp;
        uint256 tokenId;
        string tokenURI;
    }

    struct VisualToken {
        uint256 tokenId;
        string tokenURL;
        address owner;
    }

    function getOwnership(address _user)
        public
        view
        returns (Metadata[] memory)
    {
        return ownership[_user];
    }

    /*function getTokenIdsByAddress(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return tokenIdsByAddress[_user];
    }*/

    function mint(string memory uri) public {
        _safeMint(_msgSender(), tokenId);
        Metadata[] storage tokens = ownership[_msgSender()];
        tokens.push(
            Metadata({
                timestamp: block.timestamp,
                tokenId: tokenId,
                tokenURI: uri
            })
        );
        ownership[_msgSender()] = tokens;
        //tokenIdsByAddress[_msgSender()].push(tokenId);
        marketCap++;
        listTokensCirculating[0].push(VisualToken(tokenId, uri, _msgSender()));
        emit NftMinted(_msgSender(), tokenId);
        tokenId++;
    }

    function burn(uint256 _tokenId) public onlyOwner {
        require(
            _msgSender() == ERC721.ownerOf(_tokenId),
            "Only Token owner can burn the token"
        );
        _burn(_tokenId);
        _remove(_msgSender(), _tokenId);
        marketCap--;
        for (uint256 i = 0; i < listTokensCirculating[0].length; i++) {
            if (listTokensCirculating[0][i].tokenId == _tokenId) {
                delete listTokensCirculating[0][i];
                break;
            }
        }
    }

    function getListTokensCirculating()
        public
        view
        returns (VisualToken[] memory)
    {
        return listTokensCirculating[0];
    }

    function _remove(address _owner, uint256 _tokenId) internal onlyOwner {
        Metadata[] storage array = ownership[_owner];
        uint256 j = 0;
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i].tokenId != _tokenId) {
                array[j] = array[i];
                j++;
            }
        }
        array.pop();
        ownership[_owner] = array;
    }

    function transfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) public {
        require(
            _from == ERC721.ownerOf(_tokenId),
            "Only Token owner can transfer ownership the token"
        );

        safeTransferFrom(_from, _to, _tokenId);
        _transferOwnership(_from, _to, _tokenId);
    }

    function _transferOwnership(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal {
        require(_to != address(0), "Cannot transfer ownership to 0x0");
        require(
            _to == ERC721.ownerOf(_tokenId),
            "Only Token owner can transfer ownership the token"
        );
        Metadata[] storage arrayFrom = ownership[_from];
        Metadata[] storage arrayTo = ownership[_to];
        uint256 j = 0;
        for (uint256 i = 0; i < arrayFrom.length; i++) {
            if (arrayFrom[i].tokenId == _tokenId) {
                arrayTo.push(arrayFrom[i]);
            } else {
                arrayFrom[j] = arrayFrom[i];
                j++;
            }
        }
        arrayFrom.pop();
        ownership[_to] = arrayTo;
        ownership[_from] = arrayFrom;
        _updateOwnerVisualToken(_tokenId, _to);
    }

    function _updateOwnerVisualToken(uint256 _tokenId, address _to) private {
        VisualToken[] storage list = listTokensCirculating[0];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i].tokenId == _tokenId) {
                VisualToken storage token = list[i];
                token.owner = _to;
                break;
            }
        }
    }

    function allowBuy(
        uint256 _tokenId,
        uint256 _price,
        address buyer
    ) external {
        require(
            _msgSender() == ERC721.ownerOf(_tokenId),
            "Not owner of this token"
        );
        require(_price > 0, "Price zero");
        tokenIdToPrice[_tokenId] = _price;
        approve(buyer, _tokenId);
    }

    function disallowBuy(uint256 _tokenId) external {
        require(_msgSender() == ownerOf(_tokenId), "Not owner of this token");
        tokenIdToPrice[_tokenId] = 0;
    }

    function buy(uint256 _tokenId) external payable {
        uint256 price = tokenIdToPrice[_tokenId];
        require(price > 0, "Token is not for sale");
        //require(msg.value == price, "Price of token is not correct");
        address buyer = _msgSender();
        address seller = ownerOf(_tokenId);
        require(buyer != seller, "Seller cannot be the buyer");
        transfer(seller, buyer, _tokenId);
        tokenIdToPrice[_tokenId] = 0; // not for sale anymore
        payable(seller).transfer(msg.value); // send the ETH to the seller

        emit NftBought(seller, buyer, msg.value);
    }
}
