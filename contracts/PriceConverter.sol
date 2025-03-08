// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            // Address: ETH-USD https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        // (uint80 roundId, int price, uint startedAt, uint timeStamp, uint80 answeredInRound) = priceFeed.latestRoundData();
        // we only need the price
        (, int price, , , ) = priceFeed.latestRoundData();

        // Price is ETH in terms of USD
        // we know eth is like 2000

        // price is in 8 decimels
        // so normalize it to make it have 18 decimels
        return uint256(price * 1e10);
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return priceFeed.version();
    }

    function getConversionRate(
        uint256 ethAmount
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice();

        // to calculate eth amount in usd, as in 2$ worth of ETH
        // we can just multiply the price per eth and the amount
        // however ethPrice and ethAmount have 18 decimels both
        // so divide the result by 10^18, to get the correct result
        // in Solidity we always want to perform division after multiplication
        // addition, etc. Always at the end
        // In solidity we don't work with decimel much, as we can lose precision
        // so all of this is needed :)
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
