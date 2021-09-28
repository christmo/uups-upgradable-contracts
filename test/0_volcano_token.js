const VolcanoToken = artifacts.require('VolcanoToken');
const { assert, expect } = require('chai');
//const truffleAssert = artifacts.require('truffle-assertions');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('VolcanoToken', function(accounts) {
  it('should mint and sell the token', async function() {
    const contract = await VolcanoToken.deployed();
    const seller = accounts[5];
    const buyer = accounts[6];

    await contract.mint(
      'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
      { from: seller }
    );
    let tokenId = 1;
    let metadata = await contract.getOwnership(seller);
    assert.equal(metadata[0].tokenId, 1, 'Token Id minted');
    let tokens = await contract.getListTokensCirculating();
    assert.equal(tokens[0].owner, seller, 'Token is of seller');

    let tokenOwner = await contract.ownerOf(tokenId);
    assert.equal(tokenOwner, seller, 'Token owner should be the seller');

    await contract.allowBuy(tokenId, 10, buyer, { from: seller });
    await contract.buy(tokenId, {
      from: buyer,
      value: web3.utils.fromWei('100', 'wei')
    });

    tokenOwner = await contract.ownerOf(tokenId);
    assert.equal(tokenOwner, buyer, 'Token owner should be the buyer');
    metadata = await contract.getOwnership(buyer);
    assert.equal(metadata[0].tokenId, 1, 'Token 1 is of the buyer');
    tokens = await contract.getListTokensCirculating();
    assert.equal(tokens[0].owner, buyer, 'Token is of buyer');
  });

  it('should version is correct', async function() {
    const contract = await VolcanoToken.deployed();
	let version = await contract.VERSION();
	assert.equal(version, 1, 'Version should be 1');
  });

  it('should Symbol is correct', async function() {
    const contract = await VolcanoToken.deployed();
	let symbol = await contract.symbol();
	assert.equal(symbol, "VTCM", 'Symbol should be VTCM');
  });
});
