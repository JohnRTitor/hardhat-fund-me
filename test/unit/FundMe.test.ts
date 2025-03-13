import {
  BaseContract,
  Contract,
  Signer,
  TransactionReceipt,
  TransactionResponse,
} from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { assert, expect } from "chai";
import { Address } from "hardhat-deploy/dist/types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name)
  ? describe("FundMe", async () => {
      let fundMe: BaseContract;
      let mockV3Aggregator: Contract;
      let accounts: SignerWithAddress[];
      let deployer: SignerWithAddress;
      // parseEther auto converts the provided ethereum to wei
      const sendValue: bigint = ethers.parseEther("1"); // 1000000000000000000;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        // get the deployer account, usually the first account in the list
        deployer = accounts[0];
        // run all deploy scripts tagged with "all"
        await deployments.fixture(["all"]);

        // Get our deployed contracts
        fundMe = await ethers.getContractAt(
          "FundMe", // grab the ABI
          // grab the address of the deployed contract
          (
            await deployments.get("FundMe")
          ).address
        );
        mockV3Aggregator = await ethers.getContractAt(
          "MockV3Aggregator",
          (
            await deployments.get("MockV3Aggregator")
          ).address
        );
      });

      describe("constructor", async () => {
        it("Set the aggregator address correctly", async () => {
          // read the priceFeed variable's value from the FundMe contract
          // priceFeed was of type AggregatorV3Interface, but now that it's deployed
          // it's Contract
          const priceFeedAggregatorAddress: Contract = await fundMe.getFunction(
            "getPriceFeed"
          )();
          assert.equal(
            priceFeedAggregatorAddress.address,
            mockV3Aggregator.address
          );
        });
      });

      // Helper function to test funding logic
      async function testFundFunctionality() {
        // get the amount funded by the deployer
        const amountFunded = await fundMe.getFunction(
          "getAddressToAmountFunded"
        )(deployer.address);
        assert.equal(amountFunded.toString(), sendValue.toString());

        const funder: Address = await fundMe.getFunction("getFunder")(0);
        assert.equal(funder, deployer.address);
      }

      describe("fund", async () => {
        it("Fails if we don't send enough ETH", async () => {
          await expect(fundMe.getFunction("fund")()).to.be.revertedWith(
            "Didn't send enough"
          );
        });

        it("Updates the addressToAmountFunded mapping and adds to funders array", async () => {
          await fundMe.getFunction("fund")({ value: sendValue });
          await testFundFunctionality(); // Reuse test logic
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          // fund our contract with some ETH
          await fundMe.getFunction("fund")({ value: sendValue });
        });

        it("Withdraw ETH from a single funder", async () => {
          const startingFundMeBalance: bigint =
            await ethers.provider.getBalance(fundMe.getAddress());
          const startingDeployerBalance: bigint =
            await ethers.provider.getBalance(deployer.address);

          // withdraw all money from FundMe
          const tx: TransactionResponse = await fundMe.getFunction(
            "withdraw"
          )();
          const txReceipt = (await tx.wait(1)) as TransactionReceipt;

          const gasCost: bigint = txReceipt.gasUsed * txReceipt.gasPrice;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance.toString(), "0");
          // Math is like this:
          // Suppose deployer had initially 100 ETH
          // it funds 1 ETH to the contract
          // 1 + 98.95 // not exactly 99, as some gas was used when funding the contract
          // equals 99.90 + 0.05 // as some gas was used when withdrawing the funds
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );
        });

        it("Withdraw with multiple funders", async () => {
          for (let i = 1; i < 6; i++) {
            // connect with different accounts, as by default connected with deployer
            const fundMeConnectedContract: BaseContract = await fundMe.connect(
              accounts[i]
            );
            await fundMeConnectedContract.getFunction("fund")({
              value: sendValue,
            });
          }

          const startingFundMeBalance: bigint =
            await ethers.provider.getBalance(fundMe.getAddress());
          const startingDeployerBalance: bigint =
            await ethers.provider.getBalance(deployer.address);

          // withdraw all funds as the owner
          const tx: TransactionResponse = await fundMe.getFunction(
            "withdraw"
          )();
          const txReceipt = (await tx.wait(1)) as TransactionReceipt;
          const gasCost: bigint = txReceipt.gasUsed * txReceipt.gasPrice;

          const endingFundMeBalance: bigint = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const endingDeployerBalance: bigint =
            await ethers.provider.getBalance(deployer.address);

          assert.equal(endingFundMeBalance, 0n);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );

          // make sure funders array is reset
          await expect(fundMe.getFunction("getFunder")(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            // make sure addressToAmountFunded has all values to 0
            assert.equal(
              await fundMe.getFunction("getAddressToAmountFunded")(
                accounts[i].address
              ),
              0n
            );
          }
        });

        it("Only allows owner to withdraw", async () => {
          // use an account other than the owner/deployer to withdraw
          const scammer: SignerWithAddress = accounts[1];
          const scammerConnectedContract: BaseContract = await fundMe.connect(
            scammer
          );

          await expect(scammerConnectedContract.getFunction("withdraw")()).to.be
            .reverted;
        });

        it("cheapWithdraw testing...", async () => {
          for (let i = 1; i < 6; i++) {
            // connect with different accounts, as by default connected with deployer
            const fundMeConnectedContract: BaseContract = await fundMe.connect(
              accounts[i]
            );
            await fundMeConnectedContract.getFunction("fund")({
              value: sendValue,
            });
          }

          const startingFundMeBalance: bigint =
            await ethers.provider.getBalance(fundMe.getAddress());
          const startingDeployerBalance: bigint =
            await ethers.provider.getBalance(deployer.address);

          // withdraw all funds as the owner
          const tx: TransactionResponse = await fundMe.getFunction(
            "cheaperWithdraw"
          )();
          const txReceipt = (await tx.wait(1)) as TransactionReceipt;
          const gasCost: bigint = txReceipt.gasUsed * txReceipt.gasPrice;

          const endingFundMeBalance: bigint = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const endingDeployerBalance: bigint =
            await ethers.provider.getBalance(deployer.address);

          assert.equal(endingFundMeBalance, 0n);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );

          // make sure funders array is reset
          await expect(fundMe.getFunction("getFunder")(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            // make sure addressToAmountFunded has all values to 0
            assert.equal(
              await fundMe.getFunction("getAddressToAmountFunded")(
                accounts[i].address
              ),
              0n
            );
          }
        });
      });

      describe("receive and fallback triggers fund function", async () => {
        it("Sent without any data (receive)", async () => {
          const tx = await deployer.sendTransaction({
            to: fundMe.getAddress(),
            value: sendValue,
            data: "0x", // sending with no data
          });
          // should trigger receive function, which runs the fund function
          await testFundFunctionality();
        });

        it("Sent with invalid data (fallback)", async () => {
          const tx = await deployer.sendTransaction({
            to: fundMe.getAddress(),
            value: sendValue,
            data: "0x1234", // sending with invalid data
          });
          // should trigger fallback function, which runs the fund function
          await testFundFunctionality();
        });
      });
    })
  : describe.skip;
