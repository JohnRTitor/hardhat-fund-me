// These integration tests are run on testnets
import { getNamedAccounts, ethers, network, deployments } from "hardhat";
import { Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { developmentChains } from "../../helper-hardhat-config";
import { assert } from "chai";

// only run on real testnets
if (developmentChains.includes(network.name)) {
  describe.skip;
}

describe("FundMe", async () => {
  let fundMe: Contract;
  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];
  // low ETH value since we are on a testnet and don't want to spend too much
  const sendValue = ethers.parseEther("0.030");

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    // get the deployer account, usually the first account in the list
    deployer = accounts[0];

    // Get our deployed contracts
    fundMe = await ethers.getContractAt(
      "FundMe", // grab the ABI
      // grab the address of the deployed contract
      (
        await deployments.get("FundMe")
      ).address
    );
  });

  it("allows people to fund and withdraw", async () => {
    await fundMe.fund({ value: sendValue });
    await fundMe.getFunction("withdraw")();

    const endingBalance = await ethers.provider.getBalance(fundMe.getAddress());

    assert.equal(endingBalance, 0n);
  });
});
