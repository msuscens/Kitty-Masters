// Truffle tests for DragonToken contract's functionality.  

const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")

const tokenName = "Dragon Masters Token"
const tokenSymbol = "DRAGON"
const gen0Limit = 10

contract("DragonToken: Functionality", async accounts => {

    "use strict"

    let dragonToken
    before(async function() {

        dragonToken = await deployProxy(
            DragonToken,
            [tokenName, tokenSymbol, gen0Limit],
            {initializer: 'init_DragonToken', from: accounts[0]}
        )
    })

    describe("Generation 0 Dragons", () => {

        const DNA = Number(11223344567789)

        it("should only allow contract owner to create a Gen0 dragon", async () => {

            // Non-owner account
            await truffleAssert.reverts(
                dragonToken.createDragonGen0(DNA, {from: accounts[1]})
            )

            // Contract owner - Create a dragon
            await truffleAssert.passes(
                dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
                "Owner was unable to create a Gen0 dragon"
            )
        })

        let dragon1
        it("should have a birth time, expected genes, generation, and with no mother & father)", async () => {

            await truffleAssert.passes(
                dragon1 = await dragonToken.getDragon(0),
                "Unable to get details for first dragon (tokenId 0)"
            )

            const genes = Number(dragon1.genes)
            assert.deepStrictEqual(
                genes,
                DNA,
                `Dragon's genes don't match pre-hatch supplied dna, expected ${DNA} but got ${genes}!`
            )

            const birthTime = Number(dragon1.birthTime)
            assert.deepStrictEqual(
                (birthTime > 0),
                true,
                `Dragon has an unexpected birthtime == ${birthTime}!`
            )

            assert.deepStrictEqual(
                Number(dragon1.mumId),
                0,
                `Dragon shouldn't have a mother, but has mumId == ${dragon1.mumId}!`
            )
            assert.deepStrictEqual(
                Number(dragon1.dadId),
                0,
                `Dragon shouldn't have a father, but has dadId == ${dragon1.dadId}!`
            )

            assert.deepStrictEqual(
                Number(dragon1.generation),
                0,
                `Dragon should be generation 0, but is generation ${dragon1.generation}!`
            )
        })

        let dragon2
        it("should have birthtime no earlier than previous hatched dragon before them", async () => {

            // Create another (2nd) dragon
            await truffleAssert.passes(
                dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
                "Owner was unable to create a second Gen0 dragon"
            )
            await truffleAssert.passes(
                dragon2 = await dragonToken.getDragon(1),
                "Unable to get details for 2nd dragon (tokenId 1)"
            )

            assert.deepStrictEqual(
                dragon2.birthTime >= dragon1.birthTime,
                true,
                `Second Dragon's birthtime (${dragon2.birthTime}) is not after the first hatched dragon's birthtime (${dragon1.birthTime})!`
            )
        })

        it("should once hatched be added to the total supply", async () => {

            let totalDragons
            await truffleAssert.passes(
                totalDragons = await dragonToken.totalSupply(),
                "Unable to get dragon token's total supply"
            )
            assert.deepStrictEqual(
                Number(totalDragons),
                2,
                `There are ${totalDragons} Dragon tokens but expected 2!`
            )
        })
    })


    describe.skip("Breed Dragons", () => {

        it("should allow owner to breed two of their dragons (to create a newborn dragon)", async () => {

            // function breed(uint256 mumId, uint256 dadId) 

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be maintain dragon's details (eg. mum, dad, generation)", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })


    describe.skip("Transfer Dragons ", () => {

        it("should be able to transfer ownership of a dragon to a new owner", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should keep track of who owns each dragon", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should maintain number of dragons each address owns", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })


    describe.skip("Owner grants 'Operator Approval'", () => {

        it("should be able to grant 'operator approval' on a single dragon", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be able to grant 'operator approval' on all of their dragons", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )            
        })
    })


    describe.skip("Approved Operator", () => {

        it("should be able to transfer the dragon to another owner", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })


    describe.skip("DragonToken has ERC165 supportsInterface()", () => {

        it("should indicate that an unimplemented interface standard is NOT supported", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should indicate that contract is XXX interface standard compliant", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should indicate that contract is YYY interface standard compliant", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })
})
