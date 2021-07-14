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
})