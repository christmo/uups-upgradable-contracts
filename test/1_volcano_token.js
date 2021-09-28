const VolcanoToken = artifacts.require('VolcanoToken');
const { assert, expect } = require('chai');
//const truffleAssert = artifacts.require('truffle-assertions');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('VolcanoToken', function(accounts) {
  it('should mint a token NFT 1', async function() {
    const contract = await VolcanoToken.deployed();
    await contract.mint(
      'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
      { from: accounts[0] }
    );
    let metadata = await contract.getOwnership(accounts[0]);
    assert.equal(metadata[0].tokenId, 1, 'Token Id minted');
  });

  it('should mint a token NFT 2', async function() {
    const contract = await VolcanoToken.deployed();
    await contract.mint(
      'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
      { from: accounts[0] }
    );
    let metadata = await contract.getOwnership(accounts[0]);
    assert.equal(metadata[1].tokenId, 2, 'Token Id minted');
  });

  it('should mint a token NFT 3', async function() {
    const contract = await VolcanoToken.deployed();
    await contract.mint(
      'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
      { from: accounts[0] }
    );
    let metadata = await contract.getOwnership(accounts[0]);
    assert.equal(metadata[2].tokenId, 3, 'Token Id minted');
  });

  it('should mint a token NFT 4', async function() {
    const contract = await VolcanoToken.deployed();
    await contract.mint(
      'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
      { from: accounts[0] }
    );
    let metadata = await contract.getOwnership(accounts[0]);
    assert.equal(metadata[3].tokenId, 4, 'Token Id minted');
  });

  it('should burn one token NFT - 1', async function() {
    const contract = await VolcanoToken.deployed();
    const from = accounts[0];

    await contract.burn(1, { from: from });
    //await contract.burn(3, { from: accounts[0] });
    let metadata = await contract.getOwnership(from);

    assert.equal(metadata.length, 3, 'Tokens availables');
    assert.equal(metadata[0].tokenId, 2, 'Token 2 is correct');
    assert.equal(metadata[1].tokenId, 3, 'Token 2 is correct');
    assert.equal(metadata[2].tokenId, 4, 'Token 2 is correct');

    //expect().to.throw(new Error("Returned error: VM Exception while processing transaction: revert ERC721: owner query for nonexistent token -- Reason given: ERC721: owner query for nonexistent token."));
    //await expect(() =>
    //  contract
    //    .burn(tokenId, { from: accounts[0] })
    //    .to.be.revertedWith('caller is not the owner')
    //);
    /*await truffleAssert.fails(
      contract.tokenId(),
      truffleAssert.ErrorType.REVERT,
      'ERC721: owner query for nonexistent token'
    );*/
    //assert.equal(tokenId.toNumber(), 1, 'Token 1 minted');
  });

  it('should transfer NFT 2 from account 0 to 1', async function() {
    const contract = await VolcanoToken.deployed();
    const from = accounts[0];
    const tokenId = 2;

    let tokenOwner = await contract.ownerOf(tokenId);
    assert.equal(tokenOwner, from, 'Token Owner is from address');
    const newOwner = accounts[1];

    await contract.transfer(tokenOwner, newOwner, tokenId, { from: from });

    tokenOwner = await contract.ownerOf(tokenId);
    assert.equal(tokenOwner, newOwner, 'New Token Owner is second address');

    let metadataTo = await contract.getOwnership(newOwner);
    assert.equal(metadataTo[0].tokenId, tokenId, 'Token 2 is of address 1');
  });

  it('should transfer NFT 4 from account 0 to 2', async function() {
    const contract = await VolcanoToken.deployed();
    const from = accounts[0];
    const tokenId = 4;

    let tokenOwner = await contract.ownerOf(tokenId);
    assert.equal(tokenOwner, from, 'Token Owner is from address');
    const newOwner = accounts[2];

    await contract.transfer(tokenOwner, newOwner, tokenId, { from: from });

    tokenOwner = await contract.ownerOf(tokenId);
    assert.equal(tokenOwner, newOwner, 'New Token Owner is second address');

    let metadataTo = await contract.getOwnership(newOwner);
    assert.equal(metadataTo[0].tokenId, tokenId, 'Token 4 is of address 2');
  });

  it('should allow buy token', async function() {
    const contract = await VolcanoToken.deployed();
    const tokenId = 4;
    const price = 10;
    const seller = accounts[2];
    const buyer = accounts[3];
    let tokenOwner = await contract.ownerOf(tokenId);
    assert.equal(tokenOwner, seller, 'Token Owner is from address');

    await contract.allowBuy(tokenId, price, buyer, { from: seller });

    assert.equal(
      await contract.tokenIdToPrice(tokenId),
      price,
      'Buy for 10 wei'
    );
  });

  it('should acount 2 buy the token', async function() {
    let BN = web3.utils.BN;
    const tokenToBuy = 4;
    const contract = await VolcanoToken.deployed();
    const seller = accounts[2];
    const buyer = accounts[3];

    let balanceBuyerIn = new BN(await web3.eth.getBalance(buyer));
    let balanceSellerIn = new BN(await web3.eth.getBalance(seller));

    let owner = await contract.ownerOf(tokenToBuy);
    assert.equal(owner, seller, 'Token should be owned by seller');

    //await contract.setApprovalForAll(buyer, true, { from: seller });
    //await contract.approve(buyer, tokenToBuy, { from: seller });
    await contract.buy(tokenToBuy, {
      from: buyer,
      value: web3.utils.fromWei('10', 'wei')
    });
    assert.equal(
      await contract.tokenIdToPrice(tokenToBuy),
      0,
      'Token is not in sell'
    );

    owner = await contract.ownerOf(tokenToBuy);
    assert.equal(owner, buyer, 'Token should be owned by buyer');

    let metadataSeller = await contract.getOwnership(seller);
    let metadataBuyer = await contract.getOwnership(buyer);
    assert.equal(metadataSeller.length, 0, 'Token 2 is correct');
    assert.equal(metadataBuyer.length, 1, 'Token 2 is correct');

    let balanceSellerOut = new BN(await web3.eth.getBalance(seller));
    let balanceBuyerOut = new BN(await web3.eth.getBalance(buyer));

    /*assert.equal(
      balanceSellerIn.add(new BN(web3.utils.fromWei('10', 'wei'))).toString(),
      balanceSellerOut.toString(),
      'Seller final balance'
    );
    assert.equal(
      balanceBuyerIn.sub(web3.utils.fromWei('10', 'wei')).toString(),
      balanceBuyerOut.toString(),
      'Buyer final balance'
    );*/
  });

  it('should show the marketcap global', async function() {
    const contract = await VolcanoToken.deployed();
    let marketCap = await contract.marketCap();
    assert.equal(marketCap.toNumber(), 3, 'Token Owner is from address');
  });

  it('should show list tokens circulating', async function() {
    const contract = await VolcanoToken.deployed();
    let listTokens = await contract.getListTokensCirculating();
    assert.equal(listTokens.length, 4, 'Token Owner is from address');
    for (token in listTokens) {
      assert.isNotTrue(token.tokenId == 1, "Token 1 is burnt");
    }
  });

  it('should get the list of tokens by address', async function() {
    const contract = await VolcanoToken.deployed();
	let ids = await contract.getOwnership(accounts[0]);
    assert.equal(ids.length, 1, 'Token of address 0');
  });
});
