// Tests for upgrading the Marketplace contract.  

const truffleAssert = require("truffle-assertions")
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const DragonTokenV2 = artifacts.require("DragonTokenV2")

const Marketplace = artifacts.require("Marketplace")
const MarketplaceV2 = artifacts.require("MarketplaceV2")


contract("Marketplace - Upgraded to MarketplaceV2", async accounts => {

    "use strict"

    let dragonToken
    let marketplace

    let ownerV1 
    let linkedDragonTokenV1
    let dragonsForSaleV1

    let marketplaceV2

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

        // Deploy Marketplace proxy (and 'logic'' contract) 
        marketplace = await deployProxy(
            Marketplace,
            [dragonToken.address],
            {initializer: 'init_Marketplace', from: accounts[0]}
        )

        // Create two dragons
        const DNA = Number(1011223345667789)
        await truffleAssert.passes(
            dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            "Owner was unable to create a Gen0 dragon"
        )
        await truffleAssert.passes(
            dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            "Owner was unable to create a Gen0 dragon"
        )

        // Place one dragon into marketplace (for sale)
        await truffleAssert.passes(
            dragonToken.setApprovalForAll(marketplace.address, true, {from:accounts[0]}),
            "User unable to grant marketplace approval for all "
        )
        await truffleAssert.passes(
            marketplace.setOffer( 1000000 /*price*/, 0 /*tokenId*/, {from:accounts[0]}),
            "Unable to put dragon for sale in the marketplace"
        )

        // Get contract's state (before upgrade)
        ownerV1 = await marketplace.owner()
        linkedDragonTokenV1 = await marketplace.getDragonToken()
        dragonsForSaleV1 = await marketplace.getAllTokenOnSale()

        // Upgrade to new version of Marketplace (V2)
        marketplaceV2 = await upgradeProxy(marketplace.address, MarketplaceV2)
    })

      
    describe('State Variables', () => {

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

        it('should allow only the owner to set the contract version number', async () => {
            
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


    describe("Upgraded DragonToken (used by Marketplace)", () => {

        it("(marketplace) should reference latest DragonToken (when DragonToken is upgraded)", async () => {

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