// Enter your contract name FundMe along with the deployed address
// to call the withdraw function on it
// this allows you to empty the contract's balance

import { Contract, TransactionResponse } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const fundMe: Contract = await ethers.getContractAt(
    "FundMe",
    "0x1b4c3c288a82160653f22529c6eb9ebdfbe56e11"
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
