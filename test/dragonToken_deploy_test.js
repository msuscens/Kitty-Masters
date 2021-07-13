// Truffle tests for DragonToken contract's initial state (following deployment)

const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")

const tokenName = "Dragon Masters Token"
const tokenSymbol = "DRAGON"
const gen0Limit = 10

contract("DragonToken: Deployment", async accounts => {

    "use strict"

    let dragonToken
    before(async function() {

        dragonToken = await deployProxy(
            DragonToken,
            [tokenName, tokenSymbol, gen0Limit],
            {initializer: 'init_DragonToken', from: accounts[0]}
        )
    })

      
    describe("Initial State", () => {

        it ("should have the expected owner", async () => {
            let owner
            await truffleAssert.passes(
                owner = await dragonToken.owner(),
                "Unable to get owner!"
            )
            assert.deepStrictEqual(owner, accounts[0])
        })

        it ("should have the expected token name", async () => {
            let name
            await truffleAssert.passes(
                name = await dragonToken.name(),
                "Unable to get token name!"
            )
            assert.deepStrictEqual(name, tokenName)
        })

        it ("should have the expected token symbol", async () => {
            let symbol
            await truffleAssert.passes(
                symbol = await dragonToken.symbol(),
                "Unable to get token symbol!"
            )
            assert.deepStrictEqual(symbol, tokenSymbol)
        })

        it ("should have an initial total supply of 0 tokens", async () => {
            let total
            await truffleAssert.passes(
                total = await dragonToken.totalSupply(),
                "Unable to get token's total supply"
            )
            assert.deepStrictEqual(
                Number(total),
                0,
                `There are ${total} tokens but expected 0!`
            )
        })
    })
})