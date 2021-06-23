// Tests for upgrading the KittyContract contract.  
// Employing the deployProxy an upgradeProxy functions
// (from open zeppelin's truffle-upgrades library).
// See: https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades

const truffleAssert = require("truffle-assertions")
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

const KittyContract = artifacts.require("KittyContract")
const KittyContractV2 = artifacts.require("KittyContractV2")

const tokenName = "Mark-Crypto-Kitty"
const tokenSymbol = "MCK"

contract("KittyContract", async accounts => {

    "use strict"

    let kittyContract
    before(async function() {

        // Deploys KittyContract 'logic'' contract (together with a proxy)
        // NB 'deployProxy' automatically calls the contract's initialize(...)
        // function with the given arguments. If function is not named
        // 'initialize' it's actual name can be specified with the optional
        // {initializer: '<function name>'} parameter.
        kittyContract = await deployProxy(
            KittyContract,
            [tokenName, tokenSymbol],
            {initializer: 'init_KittyContract', from: accounts[0]}
        )
    })

      
    describe("Initial State", () => {

        it ("should have the expected owner", async () => {
            let owner
            await truffleAssert.passes(
                owner = await kittyContract.owner(),
                "Unable to get owner!"
            )
            assert.deepStrictEqual(owner, accounts[0])
        })

        it ("should have the expected token name", async () => {
            let name
            await truffleAssert.passes(
                name = await kittyContract.name(),
                "Unable to get token name!"
            )
            assert.deepStrictEqual(name, tokenName)
        })

        it ("should have the expected token symbol", async () => {
            let symbol
            await truffleAssert.passes(
                symbol = await kittyContract.symbol(),
                "Unable to get token symbol!"
            )
            assert.deepStrictEqual(symbol, tokenSymbol)
        })

        it ("should have an initial total supply of 0 tokens", async () => {
            let total
            await truffleAssert.passes(
                total = await kittyContract.totalSupply(),
                "Unable to get token's total supply"
            )
            assert.deepStrictEqual(
                Number(total),
                0,
                `There are ${total} tokens but expected 0!`
            )
        })
    })


    describe.skip("Generation 0 Kitties", () => {

        it("should only allow contract owner to create a Gen0 kitty", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })


    describe.skip("Breed Kitties", () => {

        it("should be able to breed two kitties to create a newborn kitty", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be maintain kitty's details (eg. mum, dad, generation)", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })


    describe.skip("Transfer Kitties ", () => {

        it("should be able to transfer ownership of a kitty to a new owner", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should keep track of who owns each kitty", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should maintain number of kitties each address owns", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })


    describe.skip("Owner grants 'Operator Approval'", () => {

        it("should be able to grant 'operator approval' on a single kitty", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })

        it("should be able to grant 'operator approval' on all of their kitties", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )            
        })
    })


    describe.skip("Approved Operator", () => {

        it("should be able to transfer the kitty to another owner", async () => {

            // *** TODO ***
            assert.deepStrictEqual(
                false,
                true
            )
        })
    })


    describe.skip("KittyContract has ERC165 supportsInterface()", () => {

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


    describe('Upgraded to KittyContract Version 2', () => {

        let ownerV1 
        let nameV1
        let symbolV1
        let totalSupplyV1
        let balanceAccount0V1
        let balanceAccount1V1

        let kittyContractV2

        before(async function() {
            // Get contract's state (before upgrade)
            ownerV1 = await kittyContract.owner()
            nameV1 = await kittyContract.name()
            symbolV1 = await kittyContract.symbol()
            totalSupplyV1 = await kittyContract.totalSupply()
            balanceAccount0V1 = await kittyContract.balanceOf( accounts[0])
            balanceAccount1V1 = await kittyContract.balanceOf( accounts[1])

            // Upgrade to new version of KittyContract (V2)
            // [Note: upgradeProxy() returns the proxy contract]
            kittyContractV2 = await upgradeProxy(kittyContract.address, KittyContractV2)
        })


        describe('Unchanged State Variables: Post-upgrade', () => {

            it('should have the same contract owner', async () => {

                const ownerV2 = await kittyContractV2.owner()
                assert.deepStrictEqual(
                    ownerV2,
                    ownerV1,
                    "Contract owner has changed!"
                )
            })

            it('should have the same token name', async () => {

                const nameV2 = await kittyContractV2.name()
                assert.deepStrictEqual(
                    nameV2, 
                    nameV1, 
                    "Token name has changed!"
                )
            })

            it('should have the same token symbol', async () => {

                const symbolV2 = await kittyContractV2.symbol()
                assert.deepStrictEqual(
                    symbolV2, 
                    symbolV1, 
                    "Token symbol has changed!"
                )
            })

            it('should have the same total supply', async () => {

                const totalSupplyV2 = await kittyContractV2.totalSupply()
                assert.deepStrictEqual(
                    totalSupplyV2, 
                    totalSupplyV1, 
                    "Total supply has changed!"
                )
            })

            it('should have the same owner\'s token balance', async () => {

                const balanceAccount0V2 = await kittyContractV2.balanceOf(accounts[0])
                assert.deepStrictEqual(
                    balanceAccount0V2, 
                    balanceAccount0V1, 
                    "Owner account[0] token balance has changed!"
                )

                const balanceAccount1V2 = await kittyContractV2.balanceOf(accounts[1])
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
                    kittyContractV2.setVersion(2, {from: accounts[4]}),
                )

                await truffleAssert.passes(
                    kittyContractV2.setVersion(2),
                    "Owner was unable to set the wallet's version number"
                )
            })

            it('should be able to get the contract version number', async () => {

                let version = await kittyContractV2.getVersion()
                assert.deepStrictEqual(
                    Number(version), 
                    2, 
                    "KittyContract version is incorrect!"
                )
            })

            it('should NOT allow paused getVersion() function to be exectuted', async () => {

                // Put contract into paused state
                await truffleAssert.passes(
                    kittyContractV2.pause(),
                    "Failed to put contract into 'paused' state!"
                )
                let paused
                await truffleAssert.passes(
                    paused = kittyContractV2.paused(),
                    "Failed to get contract's paused state!"
                )
                assert.deepStrictEqual(
                    Boolean(paused), 
                    true, 
                    "kittyContractV2 is NOT in expected 'paused' state!"
                )

                // Check function modified with 'whenNotPaused' doesn't run
                await truffleAssert.reverts(
                    kittyContractV2.getVersion()
                )
            })

            it('should allow unpaused getVersion() function to be exectuted', async () => {

                await truffleAssert.passes(
                    kittyContractV2.unpause(),
                    "Failed to 'unpause' contract state!"
                )
                let paused = await kittyContractV2.paused()
                assert.deepStrictEqual(
                    Boolean(paused), 
                    false, 
                    "kittyContractV2 is NOT in expected 'unpaused' state!"
                )
                await truffleAssert.passes(
                    kittyContractV2.getVersion(),
                    "Failed to execute unpaused getVersion() function!"
                )
            })
        })
    })
})
