# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## Deps
```bash
yarn add -D hardhat
yarn add -D dotenv
yarn add -D hardhat-deploy
yarn add -D @nomiclabs/hardhat-ethers hardhat-deploy-ethers ethers
# Optional LSP
yarn add -D @nomicfoundation/solidity-language-server
```
