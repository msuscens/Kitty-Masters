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

    before(async function() {

        dragonToken = await DragonToken.deployed()

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

      
    describe("Marketplace: Dragon Offers", () => {

        const dragonOwner = accounts[0]
        const priceInWei = 5000000

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


    describe.skip("Buying a Dragon (from the marketplace) ", () => {

        it("should be able to get which dragons (token Ids) are for sale", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("(marketplace) should hold correct 'for sale' offer details", async () => {

            let offer
            await truffleAssert.passes(
                offer = await marketplace.getOffer( 0 /*tokenId*/),
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
                0, // first offer, so index should be 0
                "Marketplace offer doesn't have the correct index!"
            )
            assert.deepStrictEqual(
                Number(offer.tokenId),
                0, // tokenId
                "Marketplace offer doesn't have the correct tokenId!"
            )
            assert.deepStrictEqual(
                offer.active,
                true,
                "Marketplace offer should be active (but isn't)!"
            )
        })

        it("should not be possible to buy your own dragon", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should allow dragon to be bought providing that the buyer pays for it", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should automtically remove any bought dragon from the marketplace", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("(bought dragon) should automtically remove any of previous owners' approved operators", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })


        it("should prevent dragon being bought when contract is in 'paused' state", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })


    })
})