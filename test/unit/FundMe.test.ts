import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { assert, expect } from "chai";
import { AggregatorV3Interface, MockV3Aggregator } from "../../typechain-types";
import { Address } from "hardhat-deploy/dist/types";

describe("FundMe", async () => {
  let fundMe: Contract;
  let mockV3Aggregator: Contract;
  let deployer: Address;

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
    // parseEther auto converts the provided ethereum to wei
    const sendValue = ethers.parseEther("1"); // 1000000000000000000;

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
});
