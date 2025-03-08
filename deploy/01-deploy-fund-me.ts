// when we call `hardhat deploy`, it will call a function
// in this script. The scripts in deploy/ are executed in order
// of their filename

import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, run, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";

const deployFunc: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // destructure the functions, and variables from a parent interface/class
  // that we need to use them directly,
  // but we can always use `hre.getNamedAccounts()` though
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;

  // grab deployer account from getNamedAccounts()
  const { deployer } = await getNamedAccounts();

  const ethUSDPriceFeedAddress = networkConfig[network.name]["ethUsdPriceFeed"];
  // when going for localhost or hardhat network, we want to use a mock
  // of the price feed of ETH-USD https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
  const fundMe = await deploy("FundMe", {
    // list of overrides we can apply to the constructor
    from: deployer,
    // pass price feed address as an argument
    args: [ethUSDPriceFeedAddress],
    log: true,
  });
};

// export the function so `hardhat deploy` can call it
export default deployFunc;
