// Truffle tests for Marketplace contract's functionality.  

const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const Marketplace = artifacts.require("Marketplace")


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

        it("(marketplace) should NOT accept a dragon 'for sale' offer if it doesn't have operator approval", async () => {

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

        it("(user) should be able to set operator approval for all their tokens", async () => {

            await truffleAssert.passes(
                dragonToken.setApprovalForAll(marketplace.address, true, {from:dragonOwner}),
                "User unable to grant marketplace approval for all "
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
                "Marketplace should be an approved operator, but isn't!"
            )
        })

        it("should NOT allow an non-owner/non-operator of a dragon token to grant operator approval on it", async () => {

            await truffleAssert.reverts(
                dragonToken.approve(accounts[1], 0 /*tokenId*/, {from:accounts[1]}),
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

        it("should allow a dragon token's owner to offer it 'for sale' in the marketplace", async () => {

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

        it("should allow only dragon token's owner to withdraw the 'for sale' offer", async () => {

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

        it("should immediately remove any sold dragon from the marketplace", async () => {

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