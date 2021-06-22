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

        // Contract deployment with linked library
        // (before refactoring to make upgradeable)
        /*
        const myLibrary = await Utilities.new();
        await KittyContract.detectNetwork();
        await KittyContract.link('Utilities', myLibrary.address);
        kittyContract = await KittyContract.new(tokenName, tokenSymbol);
        */

        // Deploys KittyContract 'logic'' contract (together with a Truffle proxy) - 
        // NB 'deployProxy' automatically calls the contract's initialize(...)
        // function with the given arguments. If function is not named
        // 'initialize(...)' it's actual name can be specified with the
        // optional {initializer: '<function name>'} parameter.
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
            assert.equal(owner, accounts[0])
        })

        it ("should have the expected token name", async () => {
            let name
            await truffleAssert.passes(
                name = await kittyContract.name(),
                "Unable to get token name!"
            )
            assert.equal(name, tokenName)
        })

        it ("should have the expected token symbol", async () => {
            let symbol
            await truffleAssert.passes(
                symbol = await kittyContract.symbol(),
                "Unable to get token symbol!"
            )
            assert.equal(symbol, tokenSymbol)
        })

        it ("should have an initial total supply of 0 tokens", async () => {
            let total
            await truffleAssert.passes(
                total = await kittyContract.totalSupply(),
                "Unable to get token's total supply"
            )
            assert.equal(
                Number(total),
                0,
                `There are ${total} tokens but expected 0!`
            )
        })
    })


    describe.skip("Generation 0 Kitties", () => {

        it("should only allow contract owner to create a Gen0 kitty", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        //  *** TODO ADD MORE TESTS HERE .....
    })


    describe.skip("Breed Kitties", () => {

        it("should be able to breed two kitties to create a newborn kitty", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        it("should be maintain kitty's details (eg. mum, dad, generation)", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        //  *** TODO ADD MORE TESTS HERE .....
    })


    describe.skip("Transfer Kitties ", () => {

        it("should be able to transfer ownership of a kitty to a new owner", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        it("should keep track of who owns each kitty", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        it("should keep track of how many kitties any particular address owns", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        //  *** TODO ADD MORE TESTS HERE .....
    })


    describe.skip("Owner grants 'Operator Approval'", () => {


        it("should be able to grant 'operator approval' on a single kitty", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        it("should be able to grant 'operator approval' on all of their kitties", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )            
        })


    })

    describe.skip("Approved Operator", () => {

        it("should be able to transfer the kitty to another owner", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

    })


    describe.skip("KittyContract has ERC165 supportsInterface()", () => {

        it("should indicate that an unimplemented interface standard is NOT supported", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        it("should indicate that contract is XXX interface standard compliant", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        it("should indicate that contract is YYY interface standard compliant", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

    })

/*  *** Follwing test don't work as 'deployProxy()' doesn't expose the
        proxy's admin functions.  Therefore it appears that this isn't
        testable here with Truffle test or in Truffle console!??  ****

    describe('\nProxy Contract Administrator', () => {

        it('should be the only one able to change the Administrator', async () => {

            await truffleAssert.reverts(
                admin = kittyContract.changeAdmin(accounts[1], {from: accounts[1]}),
                "Non-owner was able to change the Proxy administrator!"
            )

            // Change the administrator
            await truffleAssert.passes(
                admin = kittyContract.changeAdmin(accounts[1], {from: accounts[0]}),
            )
            let admin
            await truffleAssert.passes(
                admin = kittyContract.admin({from: accounts[1]})
            )
            assert.equal(
                admin,
                accounts[1]
            )

            // Change the administrator back again
            await truffleAssert.passes(
                admin = kittyContract.changeAdmin(accounts[0], {from: accounts[1]}),
            )
            await truffleAssert.passes(
                admin = kittyContract.admin({from: accounts[0]})
            )
            assert.equal(
                admin,
                accounts[0]
            )
        })

        it('should be the only one able to change the implementation (logic contract) address', async () => {

            await truffleAssert.reverts(
                kittyContract.upgradeTo("0x", {from: accounts[1]}),
                "Non-Admin updated the implementation (logic contract) address!"
            )

            // Change the implementation
            let originalImplementation
            await truffleAssert.passes(
                originalImplementation = kittyContract.implementation({from: accounts[0]}),
            )
            await truffleAssert.passes(
                kittyContract.upgradeTo("0x", {from: accounts[0]})
            )
            let newImplementation
            await truffleAssert.passes(
                newImplementation = kittyContract.implementation({from: accounts[0]}),
            )
            assert.equal(
                newImplementation,
                "0x"
            )

            // Change the implementation back again
            await truffleAssert.passes(
                kittyContract.upgradeTo(originalImplementation, {from: accounts[0]}),
            )
            await truffleAssert.passes(
                newImplementation = kittyContract.implementation({from: accounts[0]})
            )
            assert.equal(
                newImplementation,
                originalImplementation
            )
        })

    })
*/

    describe('Upgraded to KittyContract Version 2', () => {

        // let logicContractV1
        let ownerV1 
        let nameV1
        let symbolV1
        let totalSupplyV1
        let balanceAccount0V1
        let balanceAccount1V1

        let kittyContractV2

        before(async function() {
            // Get contract's state (before upgrade)
            // logicContractV1 = await kittyContract.implementation({from: accounts[0]})
            ownerV1 = await kittyContract.owner()
            nameV1 = await kittyContract.name()
            symbolV1 = await kittyContract.symbol()
            totalSupplyV1 = await kittyContract.totalSupply()
            balanceAccount0V1 = await kittyContract.balanceOf( accounts[0])
            balanceAccount1V1 = await kittyContract.balanceOf( accounts[1])

            // Upgrade to new version of KityyContract (V2)
            // Note: upgradeProxy returns the proxy
            kittyContractV2 = await upgradeProxy(kittyContract.address, KittyContractV2)
        })

        
        describe('Post-upgrade State Variables', () => {
/* *** See above - Following test doesn't work
            it('should have an updated logic contract address', async () => {

                const logicContractV2 = await kittyContractV2.implementation({from: accounts[0]})
                assert.deepEqual(
                    logicContractV2,
                    kittyContractV2.address,
                    "Logic contract addresses of V1 and V2 are the same!"
                )
                assert.deepNotEqual(
                    logicContractV2,
                    logicContractV1,
                    "Logic contract address has NOT changed!"
                )
            })
*** */

            it('should have the same contract owner', async () => {

                const ownerV2 = await kittyContractV2.owner()
                assert.deepEqual(
                    ownerV2,
                    ownerV1,
                    "Contract owner has changed!"
                )
            })

            it('should have the same token name', async () => {

                const nameV2 = await kittyContractV2.name()
                assert.deepEqual(
                    nameV2, 
                    nameV1, 
                    "Token name has changed!"
                )
            })

            it('should have the same token symbol', async () => {

                const symbolV2 = await kittyContractV2.symbol()
                assert.deepEqual(
                    symbolV2, 
                    symbolV1, 
                    "Token symbol has changed!"
                )
            })

            it('should have the same total supply', async () => {

                const totalSupplyV2 = await kittyContractV2.totalSupply()
                assert.deepEqual(
                    totalSupplyV2, 
                    totalSupplyV1, 
                    "Total supply has changed!"
                )
            })

            it('should have the same owner\'s token balance', async () => {

                const balanceAccount0V2 = await kittyContractV2.balanceOf(accounts[0])
                assert.deepEqual(
                    balanceAccount0V2, 
                    balanceAccount0V1, 
                    "Owner account[0] token balance has changed!"
                )

                const balanceAccount1V2 = await kittyContractV2.balanceOf(accounts[1])
                assert.deepEqual(
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
                assert.deepEqual(
                    Number(version), 
                    2, 
                    "KittyContract version is incorrect!"
                )
            })

            it('should NOT allow paused getVersion() function to be exectuted', async () => {

                await truffleAssert.passes(
                    kittyContractV2.pause(),
                    "Failed to pause contract!"
                )

                await truffleAssert.reverts(
                    kittyContractV2.getVersion()
                )
            })

            it('should allow unpaused getVersion() function to be exectuted', async () => {

                await truffleAssert.passes(
                    kittyContractV2.unpause(),
                    "Failed to unpause contract!"
                )

                await truffleAssert.passes(
                    kittyContractV2.getVersion(),
                    "Failed to execute unpaused getVersion() function!"
                )
            })
        })
    })
})
