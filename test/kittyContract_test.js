// Tests for upgrading the KittyContract contract.  
// Employing the deployProxy an upgradeProxy functions
// (from open zeppelin's truffle-upgrades library).
// See: https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades

const truffleAssert = require("truffle-assertions")
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')

//const Utilities = artifacts.require("ArrayUtils")
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
        // NB 'deployProxy' automatically calls initialize with given arguments
        kittyContract = await deployProxy(KittyContract, [tokenName, tokenSymbol])
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


    describe("\nGeneration 0 Kitties", () => {

        it("should only allow contract owner to create a Gen0 kitty", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

        //  *** TODO ADD MORE TESTS HERE .....
    })


    describe("\nBreed Kitties", () => {

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


    describe("\nTransfer Kitties ", () => {

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


    describe("\nOwner grants 'Operator Approval'", () => {


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

    describe("\nAn 'Approved Operator'", () => {

        it("should be able to transfer the kitty to another owner", async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })

    })


    describe("\nKittyContract has ERC165 supportsInterface()", () => {

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

    describe("\nProxy Admin", () => {

        it('should allow (only) contract owner to invoke proxy admin functions', async () => {

            // *** TODO ***
            assert.equal(
                false,
                true
            )
        })
    })


    // TODO: Enable (remove .skip) once we have a refactored contract for
    // upgradeability a KittyContractV2 contract required to test upgradability
    describe('\nUpgraded to V2 Wallet', () => {

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

            // Upgrade to new version of KityyContract (V2)
            // Note: upgradeProxy returns the proxy
            kittyContractV2 = await upgradeProxy(kittyContract.address, KittyContractV2)
            console.log("Upgrade to KittyContractV2 completed!")
        })

        describe('Keeps pre-updgrade state variables', () => {

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


        describe('Proxy Admin', () => {
        // Repeated from above - TODO: Cut & paste it here once developed
            it('should allow (only) contract owner to invoke proxy admin functions', async () => {

                // *** TODO ***
                assert.equal(
                    false,
                    true
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
                    "Owner was unable to initially set the wallet's version number"
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

            it('should NOT allow paused transfer() function to be exectuted', async () => {

                await truffleAssert.passes(
                    kittyContractV2.pause(),
                    "Failed to pause contract!"
                )

                //transfer(address to, uint256 tokenId)
                const tokenId = 1   // Ensure token is owned by account
                await truffleAssert.reverts(
                    kittyContractV2.transfer(account[0], tokenId)
                )

            })

            it('should allow unpaused transfer() function to be exectuted', async () => {

                await truffleAssert.passes(
                    kittyContractV2.unpause(),
                    "Failed to unpause contract!"
                )

                const tokenId = 1   // Ensure token is owned by account - REFACTOR (as repeated above)
                await truffleAssert.passes(
                    kittyContractV2.transfer(account[0], tokenId),
                    "Failed to execute unpaused 'whenNotPaused' function!"
                )

            })

        })

    })
})
