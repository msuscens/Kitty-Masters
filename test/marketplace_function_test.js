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

      
    describe("Marketplace: Offers 'for sale'", () => {

        const priceInWei = 50000
        const tokenId = 0
        const dragonOwner = accounts[0]

        it("(marketplace) should NOT accept dragon 'for sale' offer without operator approval", async () => {

            // Assert that operator approval is NOT set for the marketplace
            let approvedForAll
            await truffleAssert.passes(
                approvedForAll = await dragonToken.isApprovedForAll(dragonOwner, marketplace.address, {from:dragonOwner}),
                "Unable to get approvedForAll status"
            )
            assert.deepStrictEqual(
                approvedForAll,
                false
            )
            let approvedOperator
            await truffleAssert.passes(
                approvedOperator = await dragonToken.getApproved(tokenId), {from:dragonOwner},
                "Unable to get approved operator for token "
            )
            assert.notStrictEqual(
                approvedOperator,
                marketplace.address, 
                "Marketplace shouldn't have operator approval!"
            )

            // Attempt to offer for sale in marketplace
            await truffleAssert.reverts(
                marketplace.setOffer(priceInWei, tokenId, {from:dragonOwner}),
            )
        })

        it("(user) should be able to grant marketplace operator approval (on all their tokens)", async () => {

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

        it("should allow token owner to offer their dragon 'for sale' in marketplace", async () => {

            await truffleAssert.passes(
                marketplace.setOffer(priceInWei, tokenId, {from:dragonOwner}),
                "Unable to put dragon for sale in the marketplace"
            )

        })

        it.skip("should allow an approved operator to put up the dragon 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it.skip("should NOT allow non-owner/non-operator to put up a dragon 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it.skip("should allow (only) owner/operator to withdraw a dragon from sale", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

    })


    describe.skip("Browsing the marketplace (to see whats for sale)", () => {

        it("should be able to get which dragons (token Ids) are for sale", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be able to get a dragon's 'for sale' price", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be able to get a 'for sale' dragon's personal details (dna, mum, dad, generation)", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

    })


    describe.skip("Buying a Dragon (from the marketplace) ", () => {

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

    })
})