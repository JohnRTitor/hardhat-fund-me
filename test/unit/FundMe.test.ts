import { Contract, TransactionReceipt, TransactionResponse } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { assert, expect } from "chai";
import { AggregatorV3Interface, MockV3Aggregator } from "../../typechain-types";
import { Address } from "hardhat-deploy/dist/types";

describe("FundMe", async () => {
  let fundMe: Contract;
  let mockV3Aggregator: Contract;
  let deployer: Address;
  // parseEther auto converts the provided ethereum to wei
  const sendValue: bigint = ethers.parseEther("1"); // 1000000000000000000;

  beforeEach(async () => {
    // get the deployer account
    deployer = (await getNamedAccounts()).deployer;
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
        "priceFeed"
      )();
      assert.equal(
        priceFeedAggregatorAddress.address,
        mockV3Aggregator.address
      );
    });
  });

  describe("fund", async () => {
    it("Fails if we don't send enough ETH", async () => {
      await expect(fundMe.getFunction("fund")()).to.be.revertedWith(
        "Didn't send enough"
      );
    });

    it("Updates the addressToAmountFunded mapping", async () => {
      await fundMe.getFunction("fund")({ value: sendValue });
      // get the amount funded by the deployer
      const amountFunded = await fundMe.getFunction("addressToAmountFunded")(
        deployer
      );
      assert.equal(amountFunded.toString(), sendValue.toString());
    });

    it("Adds funder to array of funders", async () => {
      await fundMe.getFunction("fund")({ value: sendValue });
      // get our funder address
      const funder: Address = await fundMe.getFunction("funders")(0);
      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", async () => {
    beforeEach(async () => {
      // fund our contract with some ETH
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw ETH from a single funder", async () => {
      const startingFundMeBalance: bigint = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const startingDeployerBalance: bigint = await ethers.provider.getBalance(
        deployer
      );

      // withdraw all money from FundMe
      const tx: TransactionResponse = await fundMe.getFunction("withdraw")();
      const txReceipt = (await tx.wait(1)) as TransactionReceipt;

      const gasCost: bigint = txReceipt.gasUsed * txReceipt.gasPrice;

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

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
  });
});
