// Truffle tests for DragonToken contract's functionality.  

const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")

const tokenName = "Dragon Masters Token"
const tokenSymbol = "DRAGON"
const gen0Limit = 10

const DNA = Number(1011223345667789)


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


    let dragon1
    let dragon2 
     
    describe("Create Generation 0: Newborn Dragons", () => {

        it("should allow contract owner only to create generation 0 dragons", async () => {

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

        it("should have a birth time, genes, generation, but have no mother or father)", async () => {

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

        it("should have birthtime no earlier than dragon born just before them", async () => {

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

        it("should update the total supply when a dragon is born", async () => {

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

        it("should NOT be able to create generation 0 dragons when contract is in 'paused' state", async () => {

            // Put contract into paused state
            await truffleAssert.passes(
                dragonToken.pause(),
                "Failed to put dragonToken contract into 'paused' state!"
            )

            await truffleAssert.reverts(
                dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            )

            // Put contract back into unpaused state
            await truffleAssert.passes(
                dragonToken.unpause(),
                "Failed to put dragonToken contract into 'unpaused' state!"
            )
        })

        it("should NOT be able to create generation 0 dragons beyond the maximum limit", async () => {

            for(let num = 2; num < gen0Limit; num++){
                await truffleAssert.passes(
                    dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
                    `Owner was unable to create Gen0 dragon number ${num} (tokenId: ${num-1})`
                )
            }

            let totalDragons
            await truffleAssert.passes(
                totalDragons = await dragonToken.totalSupply(),
                "Unable to get dragon token's total supply"
            )
            assert.deepStrictEqual(
                Number(totalDragons),
                gen0Limit,
                `There are ${totalDragons} Dragon tokens but expected ${gen0Limit}!`
            )

            //Check that we can't create gen0 dragons beyond limit
            await truffleAssert.reverts(
                dragonToken.createDragonGen0(DNA, {from: accounts[0]}),
            )
            
        })
    })


    describe("Breed Dragons: Newborn Dragons", () => {

        let babyDragon    // offspring of dragon1 and dragon2

        it("should allow an owner to breed two of their dragons", async () => {

            await truffleAssert.passes(
                dragonToken.breed(0, 1, {from: accounts[0]}),
                "Dragon owner was unable to breed their two dragons"
            )
            await truffleAssert.passes(
                babyDragon = await dragonToken.getDragon(gen0Limit),
                "Unable to get baby dragon details (tokenId 2)"
            )
        })

        it("should know who are it's parents", async () => {

            assert.deepStrictEqual(
                Number(babyDragon.mumId),
                0,
                `Dragon should have a mumId == 0, but has mumId == ${babyDragon.mumId}!`
            )
            assert.deepStrictEqual(
                Number(babyDragon.dadId),
                1,
                `Dragon should have a dadId == 1, but has dadId == ${babyDragon.dadId}!`
            )
        })

        it("should be of the next generation to it's parents", async () => {

            assert.deepStrictEqual(
                Number(babyDragon.generation),
                1,
                `Dragon should be generation 1, but is generation ${babyDragon.generation}!`
            )
        })

        it("should inherit from it's parent's dna", async () => {

            const genesBaby = Number(babyDragon.genes)

            // Compare all but the last gene/digit (as both parent's dna
            // was the same, and only last gene will be randomised)
            assert.deepStrictEqual(
                Math.floor(genesBaby/10),
                Math.floor(DNA/10),
                `Baby dragon's genes don't match parent's dna, expected ${Math.floor(DNA/10)} but got ${Math.floor(genesBaby/10)}!`
            )
        })

        it("should NOT be born before it's parents", async () => {

            const babyBirthTime = Number(babyDragon.birthTime)
            const mumsBirthTime = Number(dragon1.birthTime)
            const dadsBirthTime = Number(dragon2.birthTime)
            assert.deepStrictEqual(
                (babyBirthTime >= mumsBirthTime) && (babyBirthTime >= dadsBirthTime),
                true,
                `Baby dragon has a birthtime (${babyBirthTime}) before its parent's birthtime (${mumsBirthTime} and ${dadsBirthTime})!`
            )
        })

        it("should NOT allow dragon's to bread when contract is in 'paused' state", async () => {

            await truffleAssert.passes(
                dragonToken.pause(),
                "Failed to put dragonToken contract into 'paused' state!"
            )

            await truffleAssert.reverts(
                dragonToken.breed(0, 1, {from: accounts[0]})
            )

            await truffleAssert.passes(
                dragonToken.unpause(),
                "Failed to put dragonToken contract into 'unpaused' state!"
            )
        })
    })
})