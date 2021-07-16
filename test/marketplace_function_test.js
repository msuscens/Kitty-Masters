// Truffle tests for Marketplace contract's functionality.  

const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const Marketplace = artifacts.require("Marketplace")

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


contract("Marketplace: Functionality", async accounts => {

    "use strict"

    let dragonToken
    let marketplace

    const dragonOwner = accounts[0]
    const priceInWei = 50000000

    before(async function() {

        // Deploy DragonToken proxy (and 'logic' contract) 
        const tokenName = "Dragon Masters Token"
        const tokenSymbol = "DRAGON"
        const gen0Limit = 10

        dragonToken = await deployProxy(
            DragonToken,
            [tokenName, tokenSymbol, gen0Limit],
            {initializer: 'init_DragonToken', from: accounts[0]}
        )

        // Deploy Marketplace proxy (and'logic' contract) 
        marketplace = await deployProxy(
            Marketplace,
            [dragonToken.address],
            {initializer: 'init_Marketplace', from: accounts[0]}
        )

        //Create three (gen0) dragons
        const DNA = Number(1011223345667789)
        await truffleAssert.passes(
            dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            "Owner was unable to create first Gen0 dragon"
        )
        await truffleAssert.passes(
            dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            "Owner was unable to create second Gen0 dragon"
        )
        await truffleAssert.passes(
            dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            "Owner was unable to create third Gen0 dragon"
        )

        // Assert 3 dragons exist
        let total
        await truffleAssert.passes(
            total = await dragonToken.totalSupply(),
            "Unable to get total of dragon tokens that exist"
        )
        assert.deepStrictEqual(
            Number(total),
            3,
            `There should total supply of 3 dragons, but there are ${Number(total)}!`
        )

        // Assert that no dragons are currently for sale
        // let onSale
        // await truffleAssert.passes(
        //     onSale = await marketplace.getAllTokenOnSale(),
        //     "Unable to get list of all dragon tokens on sale in the marketplace"
        // )
        // assert.deepStrictEqual(
        //     onSale,
        //     [],
        //     `There should no dragons on sale yet, but got onSale = ${onSale}`
        // )
    })

      
    describe("Marketplace: 'Sales' Operator approval'", () => {

        it("(marketplace) should NOT accept a dragon 'for sale' offer if it doesn't have 'sales' operator approval", async () => {

            // Check marketplace doesn't have operator approval on all owners tokens
            let approvedForAll
            await truffleAssert.passes(
                approvedForAll = await dragonToken.isApprovedForAll(
                    dragonOwner, 
                    marketplace.address, 
                    {from:dragonOwner}
                ),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approvedForAll,
                false
            )

            // Check marketplace doesn't have token specific operator approval
            let approvedOperator
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved(
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to get approved operator for token "
            )
            assert.notStrictEqual(
                approvedOperator,
                marketplace.address, 
                "Marketplace shouldn't have tokenId 0 operator approval!"
            )

            // Attempt to offer dragon token 'for sale' in marketplace
            await truffleAssert.reverts(
                marketplace.setOffer(
                    priceInWei,
                    0, //tokenId
                    {from:dragonOwner}
                ),
            )
        })

        it("(user) should be able to grant and revoke the marketplace 'sales' operator approval on all their tokens", async () => {

            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    true, 
                    {from:dragonOwner}
                ),
                "User unable to grant marketplace 'approval for all'"
            )

            // Assert that operator approval is now granted
            let approvedForAll
            await truffleAssert.passes(
                approvedForAll = await dragonToken.isApprovedForAll(
                    dragonOwner, 
                    marketplace.address
                ),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approvedForAll,
                true,
                "Marketplace should be an approved 'sales' operator, but isn't!"
            )

            // Ensure that user can withdraw marketplace's 'sales' operator approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    false, 
                    {from:dragonOwner}
                ),
                "Unable to revoke marketplace's operator approval for all users tokens"
            )
            await truffleAssert.passes(
                approvedForAll = await dragonToken.isApprovedForAll(
                    dragonOwner, 
                    marketplace.address
                ),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approvedForAll,
                false,
                "Marketplace should no longer be an approved 'sales' operator, but it is!"
            )
        })

        it("(token owner) should be able to grant and revoke 'sales' operator approval on that specific token", async () => {

            // Grant marketplace 'sales' operator approval (on the token)
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Failed to grant marketplace 'sales' operatior approval on single token"
            )
            let approvedOperator
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved( 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to get approved operator address for the token "
            )
            assert.deepStrictEqual(
                approvedOperator,
                marketplace.address, 
                "Marketplace doesn't have 'sales' operator approval on the token (but it should)!"
            )

            // Withdraw marketplace's 'sales' operator approval (on the token)
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId 
                    {from:dragonOwner}
                ),
                "Failed to revoke marketplace's 'sales' operatior approval on token"
            )
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved(
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to get approved operator address for the token "
            )
            assert.notStrictEqual(
                approvedOperator,
                marketplace.address, 
                "Marketplace has 'sales' operator approval on the token (but it shouldn't)!"
            )
        })

        it("should NOT allow non-owner of token to grant or revoke marketplace's 'sales' operator approval on it", async () => {

            // Non-owner (of token) without 'approval for all' from token owner
            // Attempts to grant marketplace 'sales' operator approval on token
            await truffleAssert.reverts(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId
                    {from:accounts[1]}
                )
            )

            // Owner grants marketplace 'sales' operator approval (on their token)
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Owner failed to grant marketplace 'sales' operatior approval on their token"
            )
            // Non-owner attempts to revoke marketplace's 'sales' operator approval (on token)
            await truffleAssert.reverts(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId 
                    {from:accounts[1]}
                ),
            )
        })

        it("should allow an 'approved for all' operator account to grant and revoke marketplace's 'sales' operator approval", async () => {

            // Token-owner first grants 'approved for all' operator to another account
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    accounts[1], 
                    true, 
                    {from:dragonOwner}
                ),
                "Unable to grant marketplace 'approval for all'"
            )
            let approved
            await truffleAssert.passes(
                approved = await dragonToken.isApprovedForAll(
                    dragonOwner, 
                    accounts[1]
                ),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approved,
                true,
                "Marketplace should be an approved for all 'sales' operator, but isn't!"
            )

            // 'Approved for all' account revokes marketplace's 'sales' operator approval (on token)
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId
                    {from:accounts[1]}
                ),
                "'Approved for all' operator' failed to revoke marketplace's 'sales' operator approval on token"
            )
            // Check that marketplace's 'sales operator' for token has actually been removed
            let approvedOperator
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved(0 /*tokenId*/),
                "Failed to get approved operator for token 0"
            )
            assert.deepStrictEqual(
                approvedOperator,
                ZERO_ADDRESS, 
                "Unexpectidly a non-zero address has 'sales' operator approval on the token (but it shouldn't)!"
            )

            // 'Approved for all' account grants marketplace 'sales' operator approval (on token)
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId 
                    {from:accounts[1]}
                ),
                "'Approved for all' operator' unable to grant marketplace 'sales' operator approval on token"
            )
            // Check that marketplace is actually set as 'sales operator' for token
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved(0 /*tokenId*/),
                "Failed to get approved operator for token 0"
            )
            assert.deepStrictEqual(
                approvedOperator,
                marketplace.address, 
                "marketplace address doesn't have 'sales' operator approval on the token (but it should)!"
            )
        })
    })


    describe("Marketplace: Offering Kitties 'for sale'", () => {

        it("should NOT allow an non-owner of a dragon to offer it 'for sale' in marketplace", async () => {

            // SetUp: Both accounts grant marketplace 'sales operator' approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    true, 
                    {from:dragonOwner}
                ),
                "User unable to grant marketplace approval for all "
            )
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    true, 
                    {from:accounts[1]}
                ),
                "User unable to grant marketplace approval for all "
            )

            // Test : Attempt to offer dragon for sale (that they don't own)
            await truffleAssert.reverts(
                marketplace.setOffer(
                    priceInWei,
                    0, //tokenId
                    {from:accounts[1]}
                )
            )

            // Tidy-Up: Both accounts revoke marketplace's sales operator approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    false, 
                    {from:dragonOwner}
                ),
                "Unable to revoke marketplace's 'approval for all' "
            )
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    false, 
                    {from:accounts[1]}
                ),
                "Unable to revoke marketplace's 'approval for all' "
            )
        })

        it("should NOT allow a 'token approved operator' to offer that dragon token 'for sale'", async () => {

            // Setup: Approve 'token operator'
            await truffleAssert.passes(
                dragonToken.approve(
                    accounts[1], 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Owner unable to grant token operator approval to another account"
            )

            // Test: Token operator attempts to offer dragon 'for sale'
            await truffleAssert.reverts(
                marketplace.setOffer(
                    priceInWei,
                    0, //tokenId
                    {from:accounts[1]}
                )
            )

            // Tidy-up: Revoke token operator approval
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Owner unable to revoke another account's token operator approval"
            )
        })

        it("should NOT allow an 'approved operator for all' to offer dragon for sale'", async () => {

            // Setup: Owner grants another account operator 'approval for all'
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    accounts[1],
                    true,
                    {from:dragonOwner}
                ),
                "Owner unable to grant another account operator approval for all"
            )
            // Setup: Owners grants marketplace operator 'approval for all'
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    true, 
                    {from:accounts[1]}
                ),
                "Unable to grant marketplace's 'approval for all' "
            )

            // Test
            await truffleAssert.reverts(
                marketplace.setOffer(
                    priceInWei,
                    0, //tokenId
                    {from:accounts[1]}
                )
            )

            // Tidy-up: Revoke other account's operator 'approval for all'
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    accounts[1],
                    false,
                    {from:dragonOwner}
                ),
                "Owner unable to revoke another accounts 'operator approval for all'"
            )
            // Tidy-up: Owner revokes marketplace's operator 'approval for all'
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    false, 
                    {from:dragonOwner}
                ),
                "Unable to revoke marketplace's operator 'approval for all' "
            )
        })

        it("should allow dragon owner (marketplace having 'approval for all') to create 'for sale' offer ", async () => {

            // Grant marketplace 'sales' operator approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address,
                    true,
                    {from:dragonOwner}
                ),
                "User unable to grant marketplace approval for all "
            )

            // Test
            await truffleAssert.passes(
                marketplace.setOffer(
                    priceInWei,
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to put dragon for sale in the marketplace"
            )

            // Check token is actual on offer 'for sale'
            let onSale
            await truffleAssert.passes(
                onSale = await marketplace.isTokenOnSale( 0 /*tokenId*/),
                "Failed to determine isTokenOnSale in marketplace"
            )
            assert.deepStrictEqual(
                onSale,
                true,
                "Expected dragon token to be 'for sale' in marketplace (but it isn't)"
            )

            // Tidy-Up: Revoke marketplace's 'operator approval for all'
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    false, 
                    {from:dragonOwner}
                ),
                "Owner unable to revoke marketplace's 'approval for all' "
            )
        })

        it("should allow dragon owner (marketplace having 'token operator' approval) to create'for sale' offer ", async () => {

            // Setup: Owner grants marketplace 'sales' operator approval (on their token)
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    1, //tokenId 
                    {from:dragonOwner}
                ),
                "Owner failed to grant marketplace 'sales' operatior approval on their token"
            )
            // Setup: Ensure marketplace doesn't have 'approval for all'
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    false, 
                    {from:dragonOwner}
                ),
                "Unable to revoke marketplace's operator 'approval for all'"
            )

            // Test
            await truffleAssert.passes(
                marketplace.setOffer(
                    priceInWei,
                    1, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to put dragon for sale in the marketplace"
            )

            // Check token is actual on offer 'for sale'
            let onSale
            await truffleAssert.passes(
                onSale = await marketplace.isTokenOnSale( 1 /*tokenId*/),
                "Failed to determine isTokenOnSale in marketplace"
            )
            assert.deepStrictEqual(
                onSale,
                true,
                "Expected dragon token to be 'for sale' in marketplace (but it isn't)"
            )

            // Tidy-up: Revoke 'token operator' approval
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    1, //tokenId
                    {from:dragonOwner}
                ),
                "Owner unable to revoke another marketplace's 'token operator approval'"
            )
        })

        it("should allow only a dragon's owner to withdraw the 'for sale' offer from the marketplace", async () => {

            // Non-owner/operator attempts to withdraw 'for sale' offer 
            await truffleAssert.reverts(
                marketplace.removeOffer( 0 /*tokenId*/, {from:accounts[2]} )
            )

            // Approved operator attempts to withdraw 'for sale' offer 
            await truffleAssert.reverts(
                marketplace.removeOffer( 0 /*tokenId*/, {from:accounts[1]} )
            )

            // Owner withdraws (both) 'for sale' offers
            await truffleAssert.passes(
                marketplace.removeOffer( 0 /*tokenId*/, {from:dragonOwner} ),
                "Failed to remove token's 'for sale' offer from marketplace"
            )
            let onSale
            await truffleAssert.passes(
                onSale = await marketplace.isTokenOnSale( 0 /*tokenId*/),
                "Failed to determine isTokenOnSale in marketplace"
            )
            assert.deepStrictEqual(
                onSale,
                false,
                "Expected dragon token NOT to be 'on sale' in marketplace (but it is)"
            )
            await truffleAssert.passes(
                marketplace.removeOffer( 1 /*tokenId*/, {from:dragonOwner} ),
                "Failed to remove token 'for sale' offer from marketplace"
            )
        })
    })


    describe("Marketplace: Selling a Dragon", () => {

        before(async function() {

            // Breed 2x generation 1 dragons
            await truffleAssert.passes(
                dragonToken.breed(0, 1, {from: dragonOwner}),
                "Owner was unable to breed his dragons (tokens 0 & 1)"
            )
            await truffleAssert.passes(
                dragonToken.breed(0, 2, {from: dragonOwner}),
                "Owner was unable to breed his dragons (tokens 0 & 2)"
            )
    
            // Breed 1x generation 2 dragon
            await truffleAssert.passes(
                dragonToken.breed(3, 4, {from: dragonOwner}),
                "Owner was unable to breed his dragons (tokens 3 & 4)"
            )
    
            // Assert that 6 dragons exist, all owned by 'dragonOwner'
            let total
            await truffleAssert.passes(
                total = await dragonToken.totalSupply(),
                "Unable to get total of dragon tokens that exist"
            )
            assert.deepStrictEqual(
                Number(total),
                6,
                `There should total supply of 6 dragons, but there are ${Number(total)}!`
            )
            let dragons
            await truffleAssert.passes(
                dragons = await dragonToken.getAllYourDragonIds({from: dragonOwner}),
                "Unable to get all dragons owned by 'dragonOwner'"
            )
            assert.deepStrictEqual(
                dragons.length,
                6,
                `'dragonOwner' should own 6 tokens, but actually owns ${dragons.length}`
            )
        })

        it("should know which dragons (token Ids) are for sale", async () => {

            // Test: When no dragons are on sale
            let allTokensOnSale
            await truffleAssert.passes(
                allTokensOnSale = await marketplace.getAllTokenOnSale(),
                "Unable to get all tokens that are on offer 'for sale'"
            )
            assert.deepStrictEqual(
                allTokensOnSale,
                [],
                `Tokens for sale (${allTokensOnSale}) but expected none 'for sale'`
            )

            // Setup: Put three dragons on sale
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    true, 
                    {from:dragonOwner}
                ),
                "Unable to revoke marketplace's operator 'approval for all'"
            )
            await truffleAssert.passes(
                marketplace.setOffer(
                    priceInWei,
                    2, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to offer dragon tokenId 2 for sale in the marketplace"
            )
            await truffleAssert.passes(
                marketplace.setOffer(
                    priceInWei, 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to offer dragon tokenId 0 for sale in the marketplace"
            )
            await truffleAssert.passes(
                marketplace.setOffer(
                    priceInWei, 
                    4, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to offer dragon tokenId 4 for sale in the marketplace"
            )

            // Test: 3 dragons
            await truffleAssert.passes(
                allTokensOnSale = await marketplace.getAllTokenOnSale(),
                "Unable to get all tokens that are on offer 'for sale'"
            )
            assert.deepStrictEqual(
                allTokensOnSale.length,
                3,
                `Expected 3 dargons on sale, but there are (${allTokensOnSale.length}) tokens on sale`
            )
            assert.deepStrictEqual(
                Number(allTokensOnSale[0]),
                2,
                `First token id for sale (${Number(allTokensOnSale[0])}) but expected tokenId==2`
            )
            assert.deepStrictEqual(
                Number(allTokensOnSale[1]),
                0,
                `Second token id for sale (${Number(allTokensOnSale[1])}) but expected tokenId==0`
            ) 
            assert.deepStrictEqual(
                Number(allTokensOnSale[2]),
                4,
                `Third token id for sale (${Number(allTokensOnSale[2])}) but expected tokenId==4`
            )            
        })

        it("should hold correct 'for sale' offer details", async () => {

            // Get tokenId 4's offer details
            let offer
            await truffleAssert.passes(
                offer = await marketplace.getOffer( 4 /*tokenId*/ ),
                "Unable to getOffer for the dragon token in the marketplace"
            )

            // Check offer details are as expected
            assert.deepStrictEqual(
                offer.seller,
                dragonOwner,
                "Marketplace offer doesn't have the correct seller!"
            )
            assert.deepStrictEqual(
                Number(offer.price),
                priceInWei,
                "Marketplace offer doesn't have the correct price!"
            )
            assert.deepStrictEqual(
                Number(offer.index),
                2, // 3rd offer in marketplace (index==2)
                "Marketplace offer doesn't have the correct index!"
            )
            assert.deepStrictEqual(
                Number(offer.tokenId),
                4, //tokenId
                "Marketplace offer doesn't have the correct tokenId!"
            )
            assert.deepStrictEqual(
                offer.active,
                true,
                "Marketplace offer should be active (but isn't)!"
            )
        })

        it("should NOT allow current owner to buy own token", async () => {

            await truffleAssert.reverts(
                marketplace.buyDragon(
                    4, //tokenId 
                    {from:dragonOwner, 
                    value: priceInWei}
                )
            )
        })

        it("should allow purchase of dragon token only upon paying the full asking price", async () => {

            // Try to buy at below the asking price
            await truffleAssert.reverts(
                marketplace.buyDragon(
                    4, //tokenId
                    {from:accounts[1],
                    value: priceInWei-1}
                ),
            )

            // Purchase dragon token (paying asking price)
            await truffleAssert.passes(
                marketplace.buyDragon(
                    4, //tokenId
                    {from:accounts[1],
                    value: priceInWei}
                ),
                "Unable to buy dragon 0 in the marketplace"
            )
        })

        it("should transfer the bought token to the buyer's account upon a successful purchase", async () => {

            // Check now has a balance of 1 token (following previous purchase)
            let balance
            await truffleAssert.passes(
                balance = await dragonToken.balanceOf(accounts[1]),
                "Unable to get balance of accounts[1]'s dragon tokens"
            )
            assert.deepStrictEqual(
                Number(balance),
                1
            )

            // Check the expected tokenId 4 is now owned by purchaser
            let tokenId
            await truffleAssert.passes(
                tokenId = await dragonToken.tokenOfOwnerByIndex(
                    accounts[1],
                    balance-1
                ),
                "Unable to get first tokenId owned by an account"
            )
            assert.deepStrictEqual(
                Number(tokenId),
                4, //tokenId
                "Token bought doesn't match the tokenId of the token now owned"
            )
        })

        it("should remove bought token from the marketplace", async () => {

            // Check the bought token is no longer on sale
            let onSale
            await truffleAssert.passes(
                onSale = await marketplace.isTokenOnSale(4 /*tokenId*/),
                "Failed to determine if token is on sale"
            )
            assert.deepStrictEqual(
                onSale,
                false,
                "Dragon token is still on sale (it shouldn't be)"
            )
        })

        it("should transfer the purchase price of the sold dragon to the seller", async () => {

            let balanceSellerBefore = await web3.eth.getBalance(dragonOwner)
            let balanceBuyerBefore = await web3.eth.getBalance(accounts[2])

            // Purchase  dragon token 
            await truffleAssert.passes(
                marketplace.buyDragon(
                    0, //tokenId
                    {from:accounts[2],
                    value: priceInWei}
                ),
                "Unable to buy dragon in the marketplace"
            )

            let balanceSellerAfter = await web3.eth.getBalance(dragonOwner)
            let balanceBuyerAfter = await web3.eth.getBalance(accounts[2])
            
            // Account for rounding errors and buyer also pays gas cost
            const allowRound = Math.floor(priceInWei/100)
            assert.deepStrictEqual(
                Number(balanceSellerAfter)
                    >= Number(balanceSellerBefore) + priceInWei - allowRound,
                true,
                "Seller's balance is incorrect following sale"
            )
            assert.deepStrictEqual(
                Number(balanceBuyerAfter)
                    <= Number(balanceBuyerBefore) - priceInWei,
                true,
                "Buyer's balance is incorrect following purchase"
            )
        })

        it("should remove bought token's 'approved operator' if set by previous owner", async () => {

            // Seller of token for sale grants approved operator status
            await truffleAssert.passes(
                dragonToken.approve(
                    accounts[1],
                    2, //tokenId
                    {from:dragonOwner}
                ),
                "Token owner failed to grant operator approval on token"
            )

            // Dragon token purchased
            await truffleAssert.passes(
                marketplace.buyDragon(
                    2, //tokenId
                    {from:accounts[2], value: priceInWei}
                ),
                "Unable to buy dragon in the marketplace"
            )

            // Check that token's previous approved operator has been removed
            let approvedOperator
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved(2 /*tokenId*/),
                "Failed to get approved operator for token"
            )
            assert.deepStrictEqual(
                approvedOperator,
                ZERO_ADDRESS, 
                "An operator is approved for tokenId (but it shouldn't be)!"
            )
        })


        it ("should NOT allow dragon to be bought when marketplace is in 'paused' state", async () => {

            // Setup: Put into paused state
            await truffleAssert.passes(
                marketplace.pause(),
                "Failed to put marketplace contract into 'paused' state!"
            )

            // Setup: Owner places dragon for sale in marketplace
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    4, //tokenId 
                    {from:accounts[1]}
                ),
                "Owner failed to grant marketplace 'sales' operatior approval on their token"
            )
            await truffleAssert.passes(
                marketplace.setOffer(
                    priceInWei,
                    4, //tokenId
                    {from:accounts[1]}
                ),
                "Unable to offer dragon tokenId 1 for sale in the marketplace"
            )

            // Test: Attempt to buy dragon is blocked
            await truffleAssert.reverts(
                marketplace.buyDragon(
                    4, //tokenId
                    {from:accounts[2],
                    value: priceInWei}
                )
            )
        })

        it ("should allow dragon to be bought after switching from 'paused' to 'unpaused' state", async () => {

            // Return to unpaused state
            await truffleAssert.passes(
                marketplace.unpause(),
                "Failed to put marketplace contract into 'unpaused' state!"
            )

            // Check - can now buy dragon in marketplace
            await truffleAssert.passes(
                marketplace.buyDragon(
                    4, //tokenId
                    {from:accounts[2],
                    value: priceInWei}
                )
            )
        })
    })
})