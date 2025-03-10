import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { assert } from "chai";
import { AggregatorV3Interface, MockV3Aggregator } from "../../typechain-types";

describe("FundMe", async () => {
  let fundMe: Contract;
  let mockV3Aggregator: Contract;
  let deployer: string;

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
    it("set the aggregator address correctly", async () => {
      // read the priceFeed variable's value from the FundMe contract
      // priceFeed was of type AggregatorV3Interface, but now that it's deployed
      // it's Contract
      const response: Contract = await fundMe.getFunction("priceFeed")();
      assert.equal(response.address, mockV3Aggregator.address);
    });
  });
});
