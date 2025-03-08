// when we call `hardhat deploy`, it will call a function
// in this script. The scripts in deploy/ are executed in order
// of their filename

import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunc: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // destructure the functions, and variables from a parent interface/class
  // that we need to use them directly,
  // but we can always use `hre.getNamedAccounts()` though
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  // grab deployer account from getNamedAccounts()
  const { deployer } = await getNamedAccounts();
};

// export the function so `hardhat deploy` can call it
export default deployFunc;
