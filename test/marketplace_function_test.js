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
    const priceInWei = 5000000

    before(async function() {
        const tokenName = "Dragon Masters Token"
        const tokenSymbol = "DRAGON"
        const gen0Limit = 10

        // dragonToken = await DragonToken.deployed()
        dragonToken = await deployProxy(
            DragonToken,
            [tokenName, tokenSymbol, gen0Limit],
            {initializer: 'init_DragonToken', from: accounts[0]}
        )

        // Deploy upgradeable Marketplace 'logic'' contract (with a proxy) 
        marketplace = await deployProxy(
            Marketplace,
            [dragonToken.address],
            {initializer: 'init_Marketplace', from: accounts[0]}
        )

        //Create first two (gen0) dragons
        const DNA = Number(1011223345667789)
        await truffleAssert.passes(
            dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            "Owner was unable to create first Gen0 dragon"
        )
        await truffleAssert.passes(
            dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            "Owner was unable to create second Gen0 dragon"
        )

        // Assert 2 dragons exist
        let total
        await truffleAssert.passes(
            total = await dragonToken.totalSupply(),
            "Unable to get total of dragon tokens that exist"
        )
        assert.deepStrictEqual(
            Number(total),
            2,
            `There should total supply of 2 dragons, but there are ${Number(total)}!`
        )

        // Assert that no dragons are currently for sale
        let onSale
        await truffleAssert.passes(
            onSale = await marketplace.getAllTokenOnSale(),
            "Unable to get list of all dragon tokens on sale in the marketplace"
        )
        assert.deepStrictEqual(
            onSale,
            [],
            `There should no dragons on sale yet, but got onSale = ${onSale}`
        )
    })

      
    describe("Marketplace: 'Sales' Operator approval'", () => {

        it("(marketplace) should NOT accept a dragon 'for sale' offer if it doesn't have 'sales' operator approval", async () => {

            // Check marketplace doesn't have operator approval on all owners tokens
            let approvedForAll
            await truffleAssert.passes(
                approvedForAll = await dragonToken.isApprovedForAll(dragonOwner, marketplace.address, {from:dragonOwner}),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approvedForAll,
                false
            )

            // Check marketplace doesn't have operator approval individual token
            let approvedOperator
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved( 0 /*tokenId*/), {from:dragonOwner},
                "Unable to get approved operator for token "
            )
            assert.notStrictEqual(
                approvedOperator,
                marketplace.address, 
                "Marketplace shouldn't have tokenId 0 operator approval!"
            )

            // Attempt to offer dragon token 'for sale' in marketplace
            await truffleAssert.reverts(
                marketplace.setOffer(priceInWei,  0 /*tokenId*/, {from:dragonOwner}),
            )
        })

        it("(user) should be able to grant and revoke the marketplace 'sales' operator approval on all their tokens", async () => {

            await truffleAssert.passes(
                dragonToken.setApprovalForAll(marketplace.address, true, {from:dragonOwner}),
                "User unable to grant marketplace 'approval for all'"
            )

            // Assert that operator approval is now granted
            let approvedForAll
            await truffleAssert.passes(
                approvedForAll = await dragonToken.isApprovedForAll(dragonOwner, marketplace.address),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approvedForAll,
                true,
                "Marketplace should be an approved 'sales' operator, but isn't!"
            )

            // Ensure that user can withdraw marketplace's 'sales' operator approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(marketplace.address, false, {from:dragonOwner}),
                "Unable to revoke marketplace's operator approval for all users tokens"
            )
            await truffleAssert.passes(
                approvedForAll = await dragonToken.isApprovedForAll(dragonOwner, marketplace.address),
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
                dragonToken.approve(marketplace.address, 0 /*tokenId*/, {from:dragonOwner}),
                "Failed to grant marketplace 'sales' operatior approval on single token"
            )
            let approvedOperator
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved( 0 /*tokenId*/), {from:dragonOwner},
                "Unable to get approved operator address for the token "
            )
            assert.deepStrictEqual(
                approvedOperator,
                marketplace.address, 
                "Marketplace doesn't have 'sales' operator approval on the token (but it should)!"
            )

            // Withdraw marketplace's 'sales' operator approval (on the token)
            await truffleAssert.passes(
                dragonToken.approve(ZERO_ADDRESS, 0 /*tokenId*/, {from:dragonOwner}),
                "Failed to revoke marketplace's 'sales' operatior approval on token"
            )
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved( 0 /*tokenId*/), {from:dragonOwner},
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
                dragonToken.approve(marketplace.address, 0 /*tokenId*/, {from:accounts[1]})
            )

            // Owner grants marketplace 'sales' operator approval (on their token)
            await truffleAssert.passes(
                dragonToken.approve(marketplace.address, 0 /*tokenId*/, {from:dragonOwner}),
                "Owner failed to grant marketplace 'sales' operatior approval on their token"
            )
            // Non-owner attempts to revoke marketplace's 'sales' operator approval (on token)
            await truffleAssert.reverts(
                dragonToken.approve(ZERO_ADDRESS, 0 /*tokenId*/, {from:accounts[1]}),
            )
        })

        it("should allow an 'approved for all' operator account to grant and revoke marketplace's 'sales' operator approval", async () => {

            // Token-owner first grants 'approved for all' operator to another account
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(accounts[1], true, {from:dragonOwner}),
                "Unable to grant marketplace 'approval for all'"
            )
            let approved
            await truffleAssert.passes(
                approved = await dragonToken.isApprovedForAll(dragonOwner, accounts[1]),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approved,
                true,
                "Marketplace should be an approved for all 'sales' operator, but isn't!"
            )

            // 'Approved for all' account revokes marketplace's 'sales' operator approval (on token)
            await truffleAssert.passes(
                dragonToken.approve(ZERO_ADDRESS, 0 /*tokenId*/, {from:accounts[1]}),
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
                dragonToken.approve(marketplace.address, 0 /*tokenId*/, {from:accounts[1]}),
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

            // Non-owner first must register with the marketplace
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(marketplace.address, true, {from:accounts[1]}),
                "User unable to grant marketplace approval for all "
            )
            // Attempts to offer dragon for sale
            await truffleAssert.reverts(
                marketplace.setOffer(priceInWei, 0 /*tokenId*/, {from:accounts[1]})
            )
        })

        it("should NOT allow an approved operator to offer dragon 'for sale' in the marketplace", async () => {

            // Approve Operator, who then attempts to put dragon up 'for sale'
            await truffleAssert.passes(
                dragonToken.approve(accounts[1], 0 /*tokenId*/, {from:dragonOwner}),
            )
            await truffleAssert.reverts(
                marketplace.setOffer(priceInWei, 0 /*tokenId*/, {from:accounts[1]}),
            )
        })

        it("should allow a dragon's owner to offer it 'for sale' in the marketplace", async () => {

            // Grant marketplace 'sales' operator approval
            await truffleAssert.passes(
                dragonToken.setApprovalForAll(marketplace.address, true, {from:dragonOwner}),
                "User unable to grant marketplace approval for all "
            )

            await truffleAssert.passes(
                marketplace.setOffer(priceInWei, 0 /*tokenId*/, {from:dragonOwner}),
                "Unable to put dragon for sale in the marketplace"
            )

            // Check token is actual on offer 'for sale'
            let onSale
            await truffleAssert.passes(
                onSale = await marketplace.isTokenOnSale( 0 /*tokenId*/),
                "Failed to determine isTokenOnSale(0) in marketplace"
            )
            assert.deepStrictEqual(
                onSale,
                true,
                "Expected dragon token 0 to be 'for sale' in marketplace (but it isn't)"
            )
        })

        it("should allow only dragon's owner to withdraw the 'for sale' offer from the marketplace", async () => {

            // Non-owner/operator attempts to withdraw 'for sale' offer 
            await truffleAssert.reverts(
                marketplace.removeOffer( 0 /*tokenId*/, {from:accounts[2]})
            )

            // Approved operator attempts to withdraw 'for sale' offer 
            await truffleAssert.reverts(
                marketplace.removeOffer( 0 /*tokenId*/, {from:accounts[1]})
            )

            // Owner withdraws 'for sale' offer
            await truffleAssert.passes(
                marketplace.removeOffer( 0 /*tokenId*/, {from:dragonOwner}),
                "Failed to remove token 0's 'for sale' offer from marketplace"
            )
            let onSale
            await truffleAssert.passes(
                onSale = await marketplace.isTokenOnSale( 0 /*tokenId*/),
                "Failed to determine isTokenOnSale(0) in marketplace"
            )
            assert.deepStrictEqual(
                onSale,
                false,
                "Expected dragon token 0 NOT to be 'on sale' in marketplace (but it is)"

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
                dragonToken.breed(0, 1, {from: dragonOwner}),
                "Owner was unable to breed his dragons for second time (tokens 0 & 1)"
            )
    
            // Breed 1x generation 2 dragon
            await truffleAssert.passes(
                dragonToken.breed(2, 3, {from: dragonOwner}),
                "Owner was unable to breed his dragons for second time (tokens 0 & 1)"
            )
    
            // Assert that 5 dragons exist, all owned by 'dragonOwner'
            let total
            await truffleAssert.passes(
                total = await dragonToken.totalSupply(),
                "Unable to get total of dragon tokens that exist"
            )
            assert.deepStrictEqual(
                Number(total),
                5,
                `There should total supply of 5 dragons, but there are ${Number(total)}!`
            )
            let dragons
            await truffleAssert.passes(
                dragons = await dragonToken.getAllYourDragonIds({from: dragonOwner}),
                "Unable to get all dragons owned by 'dragonOwner'"
            )
            assert.deepStrictEqual(
                dragons.length,
                5,
                `'dragonOwner' should own 5 tokens, but actually owns ${dragons.length}`
            )
        })

        it("should know which dragons (token Ids) are for sale", async () => {

            // When no dragons are on sale
            let allTokensOnSale
            await truffleAssert.passes(
                allTokensOnSale = await marketplace.getAllTokenOnSale(),
                "Unable to get all tokens that are on offer 'for sale'"
            )
            assert.deepStrictEqual(
                allTokensOnSale,
                [],
                `Tokens for sale (${allTokensOnSale}) don't match expected tokens for sale ([])`
            )

            // When three dragons are on sale
            await truffleAssert.passes(
                marketplace.setOffer(priceInWei, 2 /*tokenId*/, {from:dragonOwner}),
                "Unable to offer dragon tokenId 2 for sale in the marketplace"
            )
            await truffleAssert.passes(
                marketplace.setOffer(priceInWei, 0 /*tokenId*/, {from:dragonOwner}),
                "Unable to offer dragon tokenId 0 for sale in the marketplace"
            )
            await truffleAssert.passes(
                marketplace.setOffer(priceInWei, 4 /*tokenId*/, {from:dragonOwner}),
                "Unable to offer dragon tokenId 4 for sale in the marketplace"
            )

            await truffleAssert.passes(
                allTokensOnSale = await marketplace.getAllTokenOnSale(),
                "Unable to get all tokens that are on offer 'for sale'"
            )
            assert.deepStrictEqual(
                Number(allTokensOnSale[0]),
                2,
                `First token id for sale (${Number(allTokensOnSale[0])}) doesn't match expected token id (2)`
            )
            assert.deepStrictEqual(
                Number(allTokensOnSale[1]),
                0,
                `Second token id for sale (${Number(allTokensOnSale[1])}) doesn't match expected token id (0)`
            ) 
            assert.deepStrictEqual(
                Number(allTokensOnSale[2]),
                4,
                `Third token id for sale (${Number(allTokensOnSale[2])}) doesn't match expected token id (4)`
            )            
        })

        it("should hold correct 'for sale' offer details", async () => {

            // Get tokenId 4's offer details
            let offer
            await truffleAssert.passes(
                offer = await marketplace.getOffer( 4 /*tokenId*/),
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
                2, // 3nd offer in marketplace (so index==2)
                "Marketplace offer doesn't have the correct index!"
            )
            assert.deepStrictEqual(
                Number(offer.tokenId),
                4, // tokenId
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
                marketplace.buyDragon( 4 /*tokenId*/, {from:dragonOwner, value: priceInWei})
            )
        })

        it("should only allow purchase of dragon token upon paying the full asking price", async () => {

            // Try to buy at below the asking price
            await truffleAssert.reverts(
                marketplace.buyDragon( 4 /*tokenId*/, {from:accounts[1], value: priceInWei-1}),
            )

            // Purchase dragon token (paying asking price)
            await truffleAssert.passes(
                marketplace.buyDragon( 4 /*tokenId*/, {from:accounts[1], value: priceInWei}),
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
                tokenId = await dragonToken.tokenOfOwnerByIndex(accounts[1], balance-1),
                "Unable to get first tokenId of accounts[1]"
            )
            assert.deepStrictEqual(
                Number(tokenId),
                4 /*tokenId*/,
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
                marketplace.buyDragon( 0 /*tokenId*/, {from:accounts[2], value: priceInWei}),
                "Unable to buy dragon (tokenId 2) in the marketplace"
            )

            let balanceSellerAfter = await web3.eth.getBalance(dragonOwner)
            let balanceBuyerAfter = await web3.eth.getBalance(accounts[2])
            
            assert.deepStrictEqual(
                Number(balanceSellerAfter),
                Number(balanceSellerBefore) + priceInWei,
                "Seller's balance is incorrect following sale"
            )
            // Buyer also pays gas cost
            assert.deepStrictEqual(
                Number(balanceBuyerAfter) <= Number(balanceBuyerBefore) - priceInWei,
                true,
                "Buyer's balance is incorrect following purchase"
            )
        })

        it("should remove bought token's 'approved operator' if set by previous owner", async () => {

            // Seller of token for sale grants approved operator status
            await truffleAssert.passes(
                dragonToken.approve(accounts[1], 2 /*tokenId*/, {from:dragonOwner}),
                "Token owner failed to grant operator approval on token"
            )

            // Dragon token purchased
            await truffleAssert.passes(
                marketplace.buyDragon( 2 /*tokenId*/, {from:accounts[2], value: priceInWei}),
                "Unable to buy dragon (tokenId 2) in the marketplace"
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


        it ("should prevent dragon being bought when marketplace is in 'paused' state", async () => {

            await truffleAssert.passes(
                marketplace.pause(),
                "Failed to put marketplace contract into 'paused' state!"
            )

            await truffleAssert.passes(
                marketplace.setOffer(priceInWei, 1 /*tokenId*/, {from:dragonOwner}),
                "Unable to offer dragon tokenId 1 for sale in the marketplace"
            )

            await truffleAssert.reverts(
                marketplace.buyDragon( 1 /*tokenId*/, {from:accounts[2], value: priceInWei}),
            )

            await truffleAssert.passes(
                marketplace.unpause(),
                "Failed to put marketplace contract into 'unpaused' state!"
            )
        })
    })
})