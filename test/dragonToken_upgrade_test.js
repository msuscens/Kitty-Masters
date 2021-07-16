// Truffle tests for upgrading the DragonToken contract  

const truffleAssert = require("truffle-assertions")
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const DragonTokenV2 = artifacts.require("DragonTokenV2")

const tokenName = "Dragon Masters Token"
const tokenSymbol = "DRAGON"
const gen0Limit = 10

contract("DragonToken - Upgraded to DragonTokenV2", async accounts => {

    "use strict"

    let dragonToken
    let ownerV1 
    let nameV1
    let symbolV1
    let totalSupplyV1
    let balanceAccount0V1
    let balanceAccount1V1

    let dragonTokenV2

    before(async function() {

        // Deploy DragonToken proxy (and 'logic' contract) 
        dragonToken = await deployProxy(
            DragonToken,
            [tokenName, tokenSymbol, gen0Limit],
            {initializer: 'init_DragonToken', from: accounts[0]}
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

        // Get contract's state (before upgrade)
        ownerV1 = await dragonToken.owner()
        nameV1 = await dragonToken.name()
        symbolV1 = await dragonToken.symbol()
        totalSupplyV1 = await dragonToken.totalSupply()
        balanceAccount0V1 = await dragonToken.balanceOf( accounts[0])
        balanceAccount1V1 = await dragonToken.balanceOf( accounts[1])

        // Upgrade DragonToken logic to new version (DragonTokenV2)
        dragonTokenV2 = await upgradeProxy(dragonToken.address, DragonTokenV2)
    })

    describe('Unchanged State Variables: Post-upgrade', () => {

        it('should have the same contract owner', async () => {

            const ownerV2 = await dragonTokenV2.owner()
            assert.deepStrictEqual(
                ownerV2,
                ownerV1,
                "Contract owner has changed!"
            )
        })

        it('should have the same token name', async () => {

            const nameV2 = await dragonTokenV2.name()
            assert.deepStrictEqual(
                nameV2, 
                nameV1, 
                "Token name has changed!"
            )
        })

        it('should have the same token symbol', async () => {

            const symbolV2 = await dragonTokenV2.symbol()
            assert.deepStrictEqual(
                symbolV2, 
                symbolV1, 
                "Token symbol has changed!"
            )
        })

        it('should have the same total supply', async () => {

            const totalSupplyV2 = await dragonTokenV2.totalSupply()
            assert.deepStrictEqual(
                totalSupplyV2, 
                totalSupplyV1, 
                "Total supply has changed!"
            )
        })

        it('should have the same owner\'s token balance', async () => {

            const balanceAccount0V2 = await dragonTokenV2.balanceOf(accounts[0])
            assert.deepStrictEqual(
                balanceAccount0V2, 
                balanceAccount0V1, 
                "Owner account[0] token balance has changed!"
            )

            const balanceAccount1V2 = await dragonTokenV2.balanceOf(accounts[1])
            assert.deepStrictEqual(
                balanceAccount1V2, 
                balanceAccount1V1, 
                "Owner account[1] token balance has changed!"
            )
        })
    })


    describe('Added Functionality Available', () => {

        it('should allow only the owner to set the contract version number', async () => {
            
            await truffleAssert.reverts(
                dragonTokenV2.setVersion(2, {from: accounts[4]}),
            )

            await truffleAssert.passes(
                dragonTokenV2.setVersion(2),
                "Owner was unable to set the wallet's version number"
            )
        })

        it('should be able to get the contract version number', async () => {

            let version = await dragonTokenV2.getVersion()
            assert.deepStrictEqual(
                Number(version), 
                2, 
                "dragonTokenV2 version is incorrect!"
            )
        })

        it('should NOT allow paused getVersion() function to be exectuted', async () => {

            // Put contract into paused state
            await truffleAssert.passes(
                dragonTokenV2.pause(),
                "Failed to put contract into 'paused' state!"
            )
            let paused
            await truffleAssert.passes(
                paused = dragonTokenV2.paused(),
                "Failed to get contract's paused state!"
            )
            assert.deepStrictEqual(
                Boolean(paused), 
                true, 
                "dragonTokenV2 is NOT in expected 'paused' state!"
            )

            // Check function modified with 'whenNotPaused' doesn't run
            await truffleAssert.reverts(
                dragonTokenV2.getVersion()
            )
        })

        it('should allow unpaused getVersion() function to be exectuted', async () => {

            await truffleAssert.passes(
                dragonTokenV2.unpause(),
                "Failed to 'unpause' contract state!"
            )
            let paused = await dragonTokenV2.paused()
            assert.deepStrictEqual(
                Boolean(paused), 
                false, 
                "dragonTokenV2 is NOT in expected 'unpaused' state!"
            )
            await truffleAssert.passes(
                dragonTokenV2.getVersion(),
                "Failed to execute unpaused getVersion() function!"
            )
        })
    })
})