// Enter your contract name FundMe along with the deployed address
// to call the withdraw function on it
// this allows you to empty the contract's balance
// Run with hardhat run scripts/get-back-eth.ts --network sepolia

import { Contract, TransactionResponse } from "ethers";
import { ethers, deployments } from "hardhat";

async function main() {
  const fundMe: Contract = await ethers.getContractAt(
    "FundMe",
    // grab the address of the deployed contract
    (
      await deployments.get("FundMe")
    ).address
  );

  const tx: TransactionResponse = await fundMe.getFunction("withdraw")();
  tx.wait(2);
  console.log("Withdrawal successful");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
