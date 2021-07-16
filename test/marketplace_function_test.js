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

        // Create three (gen0) dragons
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
    })

      
    describe("Marketplace: 'Sales' Operator approval'", () => {

        it("should NOT take an offer 'for sale' without having operator approval", async () => {

            // Setup: check marketplace isn't an 'operator for all' on dragonOwner's account
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

            // Setup: check marketplace isn't the 'token operator'
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

            // Test: Unable to create a 'for sale' offer for the dragon token
            await truffleAssert.reverts(
                marketplace.setOffer(
                    priceInWei,
                    0, //tokenId
                    {from:dragonOwner}
                ),
            )
        })

        it("(token owner) should be able to grant/revoke marketplace as an 'operator for all'", async () => {

            // Test: Make marketplace 'operator for all' (on grantor's account)
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    true, 
                    {from:dragonOwner}
                ),
                "User unable to grant marketplace 'operator for all' approval"
            )

            // Check: marketplace has 'operator for all' privledge on dragonOwner's account
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

            // Test: dragonOwner can revoke marketplace's 'operator for all' approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    marketplace.address, 
                    false, 
                    {from:dragonOwner}
                ),
                "Unable to revoke marketplace's operator approval for all users tokens"
            )

            // Check: marketplace no longer has 'operator for all' privledge
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

        it("(token owner) should be able to grant/revoke marketplace as 'token operator'", async () => {

            // Test: Grant marketplace 'token operator' approval
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Failed to grant marketplace 'sales' operatior approval on single token"
            )
            // Check: marketplace now has 'token operator' approval
            let tokenOperator
            await truffleAssert.passes(
                tokenOperator = await dragonToken.getApproved( 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to get 'token operator' address "
            )
            assert.deepStrictEqual(
                tokenOperator,
                marketplace.address, 
                "Marketplace doesn't have 'token operator' approval (but it should)!"
            )

            // Test: Revoke marketplace's 'token operator' approval
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId 
                    {from:dragonOwner}
                ),
                "Failed to revoke marketplace's 'token operator' approval!"
            )
            // Check: marketplace no longer has 'token operator' approval
            await truffleAssert.passes(
                tokenOperator = await dragonToken.getApproved(
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Unable to get approved 'token operator' address!"
            )
            assert.notStrictEqual(
                tokenOperator,
                marketplace.address, 
                "Marketplace has 'token operator' approval (but it shouldn't)!"
            )
        })

        it("should NOT allow non-owner of token to grant/revoke marketplace as 'token operator'", async () => {

            // Test: Non-owner (of token) without 'approval for all' (from token owner)
            //      unable to grant marketplace 'token operator' approval
            await truffleAssert.reverts(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId
                    {from:accounts[1]}
                )
            )

            // Setup: Owner grants marketplace 'token operator' approval
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Owner failed to grant marketplace 'sales' operatior approval on their token"
            )

            // Test: Non-owner unable to revoke marketplace's 'token operator' approval
            await truffleAssert.reverts(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId 
                    {from:accounts[1]}
                ),
            )
        })

        it("should allow 'operator for all', to set/revoke marketplace as owner's 'token operator'", async () => {

            // Token-owner first grants 'approved for all' to accounts[1]
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    accounts[1], 
                    true, 
                    {from:dragonOwner}
                ),
                "Unable to grant marketplace 'approval for all'"
            )
            // Check 'now approved for all'
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
                "Marketplace should be an 'approved for all' operator, but isn't!"
            )

            // Test: 'Approved for all' account can revokes marketplace as the 'token operator'
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId
                    {from:accounts[1]}
                ),
                "'Approved for all' operator' failed to revoke marketplace's 'sales' operator approval on token"
            )

            // Check: marketplace's 'token operator' approval has been revoked 
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

            // Test: 'Approved for all' can grant marketplace 'token operator' approval
            await truffleAssert.passes(
                dragonToken.approve(
                    marketplace.address, 
                    0, //tokenId 
                    {from:accounts[1]}
                ),
                "'Approved for all' operator' unable to grant marketplace 'sales' operator approval on token"
            )

            // Check: marketplace now has 'token operator' approval
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


    describe("Marketplace: Creating an Offer to sell your Dragon", () => {

        beforeEach(async function() {

            // Revoke marketplace's 'operator for all' (on all accounts used)
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

            // Revoke other account's 'operator for all' approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(
                    accounts[1],
                    false,
                    {from:dragonOwner}
                ),
                "Owner unable to revoke another accounts 'operator approval for all'"
            )

            // Revoke 'token operator' approval (on tokenId==0, tokenId==1)
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    0, //tokenId
                    {from:dragonOwner}
                ),
                "Owner unable to revoke another account's token operator approval"
            )
            await truffleAssert.passes(
                dragonToken.approve(
                    ZERO_ADDRESS, 
                    1, //tokenId
                    {from:dragonOwner}
                ),
                "Owner unable to revoke another marketplace's 'token operator approval'"
            )
        })

        it("should NOT allow non-owner of a dragon to offer it 'for sale'", async () => {

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
        })

        it("should NOT allow 'token operator' to offer that dragon 'for sale'", async () => {

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
        })

        it("should NOT allow 'operator for all' to offer owner's dragon 'for sale''", async () => {

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
        })

        it("(marketplace with 'approval for all') should allow owner to create 'for sale' offer", async () => {

            // Setup: Grant marketplace 'sales' operator approval
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

            // Check: token is actual on offer 'for sale'
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
        })

        it("(marketplace as 'token operator') should allow owner to create 'for sale' offer", async () => {

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

            // Check: token is actual on offer 'for sale'
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
        })

        it("should only allow a dragon's owner to withdraw 'for sale' offer", async () => {

            // Test: Non-owner/operator unable to withdraw 'for sale' offer 
            await truffleAssert.reverts(
                marketplace.removeOffer( 0 /*tokenId*/, {from:accounts[2]} )
            )

            // Test: Approved operator unable to withdraw 'for sale' offer 
            await truffleAssert.reverts(
                marketplace.removeOffer( 0 /*tokenId*/, {from:accounts[1]} )
            )

            // Test: Owner able to withdraw their dragon 'for sale' offer
            await truffleAssert.passes(
                marketplace.removeOffer( 0 /*tokenId*/, {from:dragonOwner} ),
                "Failed to remove token's 'for sale' offer from marketplace"
            )

            // Check: No longer offered 'for sale' in marketplace
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

            // Tidy-up: dragonOwner removes remaining 'for sale' offer from marketplace
            await truffleAssert.passes(
                marketplace.removeOffer( 1 /*tokenId*/, {from:dragonOwner} ),
                "Failed to remove token 'for sale' offer from marketplace"
            )
        })
    })


    describe("Marketplace: Showing Dragons 'For Sale'", () => {

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

        it("should know which dragons (token Ids) are 'for sale'", async () => {

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
    })


    describe("Marketplace: Buying a Dragon", () => {

        it("should NOT allow current owner to buy their own dragon", async () => {

            await truffleAssert.reverts(
                marketplace.buyDragon(
                    4, //tokenId 
                    {from:dragonOwner, 
                    value: priceInWei}
                )
            )
        })

        it("should allow dragon purchase upon paying the full asking price", async () => {

            // Test: Unable to buy dragon at below the asking price
            await truffleAssert.reverts(
                marketplace.buyDragon(
                    4, //tokenId
                    {from:accounts[1],
                    value: priceInWei-1}
                ),
            )

            // Test: Can buy dragon token (paying asking price)
            await truffleAssert.passes(
                marketplace.buyDragon(
                    4, //tokenId
                    {from:accounts[1],
                    value: priceInWei}
                ),
                "Unable to buy dragon token (at asking price) in the marketplace"
            )
        })

        it("should transfer the bought dragon to the buyer", async () => {

            // Check: buyer has balance == 1 (following previous purchase)
            let balance
            await truffleAssert.passes(
                balance = await dragonToken.balanceOf(accounts[1]),
                "Unable to get balance of accounts[1]'s dragon tokens"
            )
            assert.deepStrictEqual(
                Number(balance),
                1
            )

            // Check: dragon (tokenId 4) is now owned by purchaser
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

        it("should remove bought dragon from the marketplace", async () => {

            // Check: bought token is no longer 'on sale' in marketplace
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

        it("should transfer the purchase price of the dragon to the seller", async () => {

            // Setup: 
            let balanceSellerBefore = await web3.eth.getBalance(dragonOwner)
            let balanceBuyerBefore = await web3.eth.getBalance(accounts[2])

            // Test: Purchase dragon token 
            await truffleAssert.passes(
                marketplace.buyDragon(
                    0, //tokenId
                    {from:accounts[2],
                    value: priceInWei}
                ),
                "Unable to buy dragon in the marketplace"
            )

            // Check: new balances
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

        it("should remove bought dragon's 'approved operator' (set by previous owner)", async () => {

            // Setup: Seller grants 'token operator'' approval on dragon before it is sold
            await truffleAssert.passes(
                dragonToken.approve(
                    accounts[1],
                    2, //tokenId
                    {from:dragonOwner}
                ),
                "Token owner failed to grant operator approval on token"
            )

            // Test: Dragon token purchased
            await truffleAssert.passes(
                marketplace.buyDragon(
                    2, //tokenId
                    {from:accounts[2], value: priceInWei}
                ),
                "Unable to buy dragon in the marketplace"
            )

            // Check: token's previous 'token operator' has been removed
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


        it ("should NOT allow buying of dragon when marketplace is 'paused'", async () => {

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

        it ("should allow buying of dragon when marketplace is 'unpaused'", async () => {

            // Setup: Return to unpaused state
            await truffleAssert.passes(
                marketplace.unpause(),
                "Failed to put marketplace contract into 'unpaused' state!"
            )

            // Test: can now buy dragon in marketplace
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