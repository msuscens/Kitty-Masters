// Tests for upgrading the DragonToken contract.  
// Employing the deployProxy an upgradeProxy functions
// (from open zeppelin's truffle-upgrades library).
// See: https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades

const truffleAssert = require("truffle-assertions")
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const DragonToken = artifacts.require("DragonToken")
const DragonTokenV2 = artifacts.require("DragonTokenV2")

const tokenName = "Dragon Masters Token"
const tokenSymbol = "DRAGON"
const gen0Limit = 10

contract("DragonToken", async accounts => {

    "use strict"

    let dragonToken
    before(async function() {

        // Deploys DragonToken 'logic'' contract (together with a proxy)
        // NB 'deployProxy' automatically calls the contract's initialize(...)
        // function with the given arguments. If function is not named
        // 'initialize' it's actual name can be specified with the optional
        // {initializer: '<function name>'} parameter.
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


    describe('Upgraded to DragonToken Version 2', () => {

        let ownerV1 
        let nameV1
        let symbolV1
        let totalSupplyV1
        let balanceAccount0V1
        let balanceAccount1V1

        let dragonTokenV2

        before(async function() {
            // Get contract's state (before upgrade)
            ownerV1 = await dragonToken.owner()
            nameV1 = await dragonToken.name()
            symbolV1 = await dragonToken.symbol()
            totalSupplyV1 = await dragonToken.totalSupply()
            balanceAccount0V1 = await dragonToken.balanceOf( accounts[0])
            balanceAccount1V1 = await dragonToken.balanceOf( accounts[1])

            // Upgrade to new version of DragonToken (V2)
            // [Note: upgradeProxy() returns the proxy contract]
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


        describe('Added Functionality', () => {

            it('should allow (only) the owner to set the contract version number', async () => {
                
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
})
