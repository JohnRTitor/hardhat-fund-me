// To quickly fund a contract
// Run with hardhat run scripts/fund.ts --network sepolia
import { Contract, TransactionResponse } from "ethers";
import { ethers, deployments } from "hardhat";

async function main() {
  const fundMe: Contract = await ethers.getContractAt(
    "FundMe", // grab the ABI
    // grab the address of the deployed contract
    (
      await deployments.get("FundMe")
    ).address
  );

  const balance: bigint = await ethers.provider.getBalance(fundMe.getAddress());
  console.log("Balance: ", balance.toString());
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
