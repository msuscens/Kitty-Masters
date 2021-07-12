// Tests for upgrading the KittyMarketplace contract.  
// Employing the deployProxy an upgradeProxy functions
// (from open zeppelin's truffle-upgrades library).
// See: https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades

const truffleAssert = require("truffle-assertions")
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const DragonTokenV2 = artifacts.require("DragonTokenV2")

const KittyMarketplace = artifacts.require("KittyMarketplace")
const KittyMarketplaceV2 = artifacts.require("KittyMarketplaceV2")


contract("KittyMarketplace", async accounts => {

    "use strict"

    let dragonToken
    let kittyMarketplace

    before(async function() {

        dragonToken = await DragonToken.deployed()

        // Deploy upgradeable kittyMarketplace 'logic'' contract (with a proxy) 
        kittyMarketplace = await deployProxy(
            KittyMarketplace,
            [dragonToken.address],
            {initializer: 'init_KittyMarketplace', from: accounts[0]}
        )
    })

      
    describe("Initial State", () => {

        it ("should have the expected owner", async () => {
            let owner
            await truffleAssert.passes(
                owner = await kittyMarketplace.owner(),
                "Unable to get owner!"
            )
            assert.deepStrictEqual(owner, accounts[0])
        })

        it("should be associated with correct DragonToken", async () => {

            let linkedDragonToken
            await truffleAssert.passes(
                linkedDragonToken = await kittyMarketplace.getDragonToken(),
                "Unable to get DragonToken's address!"
            )
            assert.deepStrictEqual(
                linkedDragonToken,
                dragonToken.address
            )
        })

    })


    describe.skip("Marketplace 'for sale' offers", () => {

        it("should allow token owner to offer their kitty 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should allow an approved operator to put up the kitty 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should NOT allow non-owner/non-operator to put up a kitty 'for sale'", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should allow (only) owner/operator to withdraw a kitty from sale", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

    })


    describe.skip("Browsing the marketplace (to see whats for sale)", () => {

        it("should be able to get which kitties (token Ids) are for sale", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be able to get a kitty's 'for sale' price", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be able to get a 'for sale' kitty's personal details (dna, mum, dad, generation)", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

    })


    describe.skip("Buying a Kitty (from the marketplace) ", () => {

        it("should not be possible to buy your own kitty", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should allow kitty to be bought providing that the buyer pays for it", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should immediately remove any sold kitty from the marketplace", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

    })


    describe('Upgraded to KittyMarketplace Version 2', () => {

        let ownerV1 
        let linkedDragonTokenV1
        let kittiesForSaleV1

        let kittyMarketplaceV2

        before(async function() {
            // Get contract's state (before upgrade)
            ownerV1 = await kittyMarketplace.owner()
            linkedDragonTokenV1 = await kittyMarketplace.getDragonToken()
            kittiesForSaleV1 = await kittyMarketplace.getAllTokenOnSale()

            // Upgrade to new version of KittyMarketplace (V2)
            kittyMarketplaceV2 = await upgradeProxy(kittyMarketplace.address, KittyMarketplaceV2)
        })


        describe('Post-upgrade State Variables', () => {

            it('should have the same contract owner', async () => {

                const ownerV2 = await kittyMarketplaceV2.owner()
                assert.deepStrictEqual(
                    ownerV2,
                    ownerV1,
                    "KittyMarketplace contract's owner has changed!"
                )
            })

            it('should have the same DragonToken address', async () => {

                const linkedDragonTokenV2 = await kittyMarketplaceV2.getDragonToken()
                assert.deepStrictEqual(
                    linkedDragonTokenV2, 
                    linkedDragonTokenV1, 
                    "Associated DragonToken has changed!"
                )
            })

            it('should have the same Kitty\'s for sale', async () => {

                const kittiesForSaleV2 = await kittyMarketplace.getAllTokenOnSale()
                assert.deepStrictEqual(
                    kittiesForSaleV2, 
                    kittiesForSaleV1, 
                    "Kitty tokens that are 'for sale' have changed!"
                )
            })

        })


        describe('Added Functionality', () => {

            it('should allow (only) the owner to set the contract version number', async () => {
                
                await truffleAssert.reverts(
                    kittyMarketplaceV2.setVersion(2, {from: accounts[4]}),
                )

                await truffleAssert.passes(
                    kittyMarketplaceV2.setVersion(2),
                    "Owner was unable to set the wallet's version number"
                )
            })

            it('should be able to get the contract version number', async () => {

                let version = await kittyMarketplaceV2.getVersion()
                assert.deepStrictEqual(
                    Number(version), 
                    2, 
                    "KittyMarketplace version is incorrect!"
                )
            })

            it('should NOT allow paused getVersion() function to be exectuted', async () => {

                await truffleAssert.passes(
                    kittyMarketplaceV2.pause(),
                    "Failed to put contract into 'paused' state!"
                )
                let paused = await kittyMarketplaceV2.paused()
                assert.deepStrictEqual(
                    Boolean(paused), 
                    true, 
                    "kittyMarketplaceV2 is NOT in expected 'paused' state!"
                )
                await truffleAssert.reverts(
                    kittyMarketplaceV2.getVersion()
                )
            })

            it('should allow unpaused getVersion() function to be exectuted', async () => {

                await truffleAssert.passes(
                    kittyMarketplaceV2.unpause(),
                    "Failed to put contract into 'unpaused' state!"
                )
                let paused = await kittyMarketplaceV2.paused()
                assert.deepStrictEqual(
                    Boolean(paused), 
                    false, 
                    "kittyMarketplaceV2 is NOT in expected 'unpaused' state!"
                )
                await truffleAssert.passes(
                    kittyMarketplaceV2.getVersion(),
                    "Failed to execute unpaused getVersion() function!"
                )
            })
        })

    })


    describe("Upgraded DragonToken (used by KittyMarketplace)", () => {

        it("(the KittyMarketplace) continues to reference correct DragonToken (when it is upgraded)", async () => {

            // Get KittyMarketplace's current DragonToken (proxy) address
            let proxyDragonToken
            await truffleAssert.passes(
                proxyDragonToken = await kittyMarketplace.getDragonToken(),
                "Failed to get KittyMarketplace's current DragonToken address"
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