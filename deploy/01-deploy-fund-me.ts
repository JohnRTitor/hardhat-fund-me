// when we call `hardhat deploy`, it will call a function
// in this script. The scripts in deploy/ are executed in order
// of their filename

import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, run, network } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";

// destructure the functions, and variables from a parent interface/class
// that we need to use them directly,
export default async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  // but we can always use `deployments.deploy()` though
  const { deploy, log } = deployments;

  // grab deployer account from getNamedAccounts()
  const { deployer } = await getNamedAccounts();

  let ethUSDPriceFeedAddress: string;
  // we are deploying on a development chain
  if (developmentChains.includes(network.name)) {
    // we get the MockV3Aggregator contract from previous mock deployment
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUSDPriceFeedAddress = ethUsdAggregator.address;
  }
  // deploying on a testnet or mainnet
  else {
    ethUSDPriceFeedAddress = networkConfig[network.name]["ethUsdPriceFeed"]!;
  }

  const fundMe = await deploy("FundMe", {
    // list of overrides we can apply to the constructor
    from: deployer,
    // pass price feed address as an argument
    args: [ethUSDPriceFeedAddress],
    log: true,
  });
};
