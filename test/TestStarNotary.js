const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star T1!', tokenId, {from: accounts[0]})
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star.name, 'Awesome Star T1!');
});



it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });


it('can Lookup a Star', async() => {
    let starId = 6;
    let instance = await StarNotary.deployed();
    await instance.createStar('Test My Awesome Star T6!', starId, {from: accounts[0]})
   assert.equal(await instance.lookUptokenIdToStarInfo(starId), 'Test My Awesome Star T6!')

});

it('can exchange stars', async() => {
    //create star 7
    let starId7 = 7;
    let instance = await StarNotary.deployed();
    await instance.createStar('Test My Awesome Star T7!', starId7, {from: accounts[1]});
    assert.equal(await instance.lookUptokenIdToStarInfo(starId7), 'Test My Awesome Star T7!');

    // create star 8
   let starId8 = 8;
   await instance.createStar('Test My Awesome Star T8!', starId8, {from: accounts[2]});
   assert.equal(await instance.lookUptokenIdToStarInfo(starId8), 'Test My Awesome Star T8!');

  //exchange stars
  await instance.exchangeStars(starId7, starId8, {from: accounts[1]});
  assert.equal(await instance.lookUptokenIdToStarInfo(starId7), 'Test My Awesome Star T8!');
  assert.equal(await instance.lookUptokenIdToStarInfo(starId8), 'Test My Awesome Star T7!');
});

it('can transfer star', async() => {
    let instance = await StarNotary.deployed();
    let starId = 9;
    //create a star as account 1 and assert the owner is account 1 for starId 9
    await instance.createStar('awesome star', starId, {from: accounts[1]});
    assert.equal(await instance.ownerOf(starId), accounts[1]);

    //transfer the star to account 2 and assert the owner is account 2 for starId 9
    await instance.transferStar(accounts[2], starId, {from: accounts[1]});
    assert.equal(await instance.ownerOf(starId), accounts[2]);
});
