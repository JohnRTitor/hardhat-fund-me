// define an interface for network configuration items
export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}
// define an interface for network configuration info using our interface
export interface networkConfigInfo {
  // keys are strings, meaning network names, and value is the
  // networkConfigItem interface, containing ethUsdPriceFeed and blockConfirmations
  [network: string]: networkConfigItem;
}

// let's actually define our network configuration info
export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
  // Default one is ETH/USD contract on Sepolia
  sepolia: {
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    blockConfirmations: 6,
  },
};

export const developmentChains: string[] = ["hardhat", "localhost"];
// DECIMALS is 8 on the MockV3Aggregator
export const DECIMALS: number = 8;
// 2000 USD with 8 decimals
export const INITIAL_ANSWER: number = 200000000000;
