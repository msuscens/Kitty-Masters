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
    })

      
    describe.skip("Marketplace 'for sale' offers", () => {

        it("should allow token owner to offer their dragon 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should allow an approved operator to put up the dragon 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should NOT allow non-owner/non-operator to put up a dragon 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should allow (only) owner/operator to withdraw a dragon from sale", async () => {

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