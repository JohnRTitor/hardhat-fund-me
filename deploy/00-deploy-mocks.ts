/* PURPOSE:
  Basically, when we need to deploy a contract that uses real world data from an Oracle
  it works only on Testnets like Sepolia. But when using the contract locally, on hardhat
  network or localhost network, it doesn't work, as no Oracle is monitoring our local network.
  So we can actually get a mock, from @chainlink/contracts repo/package, that acts as an Oracle
  for our test net. The data will not obviously come from the real world and not necessarily
  accurate, but it will be sufficient for testing purposes.
  This script runs before the main deployment script, hence 00 as the order.
  This makes sure that we have some sort of fallback in case the contract requires an Oracle.
*/
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} from "../helper-hardhat-config";

// anonymous function notation, since we are just using it once anyway
const deployMocks = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId!;

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks....");
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      // See constructor args from "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol"
      args: [DECIMALS, INITIAL_ANSWER],
    });

    log("Mocks deployed!");
    log("-----------------------------------------------");
  }
};

export default deployMocks;
// we add a tag such that it can be run independently
// `hardhat deploy --tags mocks`
deployMocks.tags = ["all", "mocks"];
