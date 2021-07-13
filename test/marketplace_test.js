// Tests for upgrading the Marketplace contract.  
// Employing the deployProxy an upgradeProxy functions
// (from open zeppelin's truffle-upgrades library).
// See: https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades

const truffleAssert = require("truffle-assertions")
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const DragonTokenV2 = artifacts.require("DragonTokenV2")

const Marketplace = artifacts.require("Marketplace")
const MarketplaceV2 = artifacts.require("MarketplaceV2")


contract("Marketplace", async accounts => {

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

      
    describe("Initial State", () => {

        it ("should have the expected owner", async () => {
            let owner
            await truffleAssert.passes(
                owner = await marketplace.owner(),
                "Unable to get owner!"
            )
            assert.deepStrictEqual(owner, accounts[0])
        })

        it("should be associated with correct DragonToken", async () => {

            let linkedDragonToken
            await truffleAssert.passes(
                linkedDragonToken = await marketplace.getDragonToken(),
                "Unable to get DragonToken's address!"
            )
            assert.deepStrictEqual(
                linkedDragonToken,
                dragonToken.address
            )
        })

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


    describe('Upgraded to Marketplace Version 2', () => {

        let ownerV1 
        let linkedDragonTokenV1
        let dragonsForSaleV1

        let marketplaceV2

        before(async function() {
            // Get contract's state (before upgrade)
            ownerV1 = await marketplace.owner()
            linkedDragonTokenV1 = await marketplace.getDragonToken()
            dragonsForSaleV1 = await marketplace.getAllTokenOnSale()

            // Upgrade to new version of Marketplace (V2)
            marketplaceV2 = await upgradeProxy(marketplace.address, MarketplaceV2)
        })


        describe('Post-upgrade State Variables', () => {

            it('should have the same contract owner', async () => {

                const ownerV2 = await marketplaceV2.owner()
                assert.deepStrictEqual(
                    ownerV2,
                    ownerV1,
                    "Marketplace contract's owner has changed!"
                )
            })

            it('should have the same DragonToken address', async () => {

                const linkedDragonTokenV2 = await marketplaceV2.getDragonToken()
                assert.deepStrictEqual(
                    linkedDragonTokenV2, 
                    linkedDragonTokenV1, 
                    "Associated DragonToken has changed!"
                )
            })

            it('should have the same dragon\'s for sale', async () => {

                const dragonsForSaleV2 = await marketplace.getAllTokenOnSale()
                assert.deepStrictEqual(
                    dragonsForSaleV2, 
                    dragonsForSaleV1, 
                    "Dragon tokens that are 'for sale' have changed!"
                )
            })

        })


        describe('Added Functionality', () => {

            it('should allow (only) the owner to set the contract version number', async () => {
                
                await truffleAssert.reverts(
                    marketplaceV2.setVersion(2, {from: accounts[4]}),
                )

                await truffleAssert.passes(
                    marketplaceV2.setVersion(2),
                    "Owner was unable to set the wallet's version number"
                )
            })

            it('should be able to get the contract version number', async () => {

                let version = await marketplaceV2.getVersion()
                assert.deepStrictEqual(
                    Number(version), 
                    2, 
                    "Marketplace version is incorrect!"
                )
            })

            it('should NOT allow paused getVersion() function to be exectuted', async () => {

                await truffleAssert.passes(
                    marketplaceV2.pause(),
                    "Failed to put contract into 'paused' state!"
                )
                let paused = await marketplaceV2.paused()
                assert.deepStrictEqual(
                    Boolean(paused), 
                    true, 
                    "marketplaceV2 is NOT in expected 'paused' state!"
                )
                await truffleAssert.reverts(
                    marketplaceV2.getVersion()
                )
            })

            it('should allow unpaused getVersion() function to be exectuted', async () => {

                await truffleAssert.passes(
                    marketplaceV2.unpause(),
                    "Failed to put contract into 'unpaused' state!"
                )
                let paused = await marketplaceV2.paused()
                assert.deepStrictEqual(
                    Boolean(paused), 
                    false, 
                    "marketplaceV2 is NOT in expected 'unpaused' state!"
                )
                await truffleAssert.passes(
                    marketplaceV2.getVersion(),
                    "Failed to execute unpaused getVersion() function!"
                )
            })
        })

    })


    describe("Upgraded DragonToken (used by Marketplace)", () => {

        it("(the Marketplace) continues to reference correct DragonToken (when it is upgraded)", async () => {

            // Get Marketplace's current DragonToken (proxy) address
            let proxyDragonToken
            await truffleAssert.passes(
                proxyDragonToken = await marketplace.getDragonToken(),
                "Failed to get marketplace's current DragonToken contract address"
            )

            // Upgraded (proxy) to use new DragonToken logic contract (DragonTokenV2)
            let dragonTokenV2 = await upgradeProxy(dragonToken.address, DragonTokenV2)

            // Check updgraded DragonToken (proxy) is at the same address
            assert.deepStrictEqual(
                proxyDragonToken, 
                dragonTokenV2.address, 
                "DragonToken and DragonTokenV2 have different proxy addresses!"
            )
        })
    })
})