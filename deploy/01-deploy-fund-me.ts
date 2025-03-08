// when we call `hardhat deploy`, it will call a function
// in this script. The scripts in deploy/ are executed in order
// of their filename

import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunc: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  console.log("Sample deployment completed");
};

export default deployFunc;
