// Truffle tests for Marketplace contract's initial state (following deployment)

const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const Marketplace = artifacts.require("Marketplace")

contract("Marketplace: Deployment", async accounts => {

    "use strict"

    let dragonToken
    let marketplace

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
})