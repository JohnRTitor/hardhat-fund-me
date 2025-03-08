// SPDX-License-Identifier: MIT
// Style guide:
// Pragma
pragma solidity ^0.8.8;

// Imports
import "./PriceConverter.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Error codes
error FundMe__NotOwner();
error WithdrawFailed();

// Interfaces, Libraries, Contracts

/**
 * @title A contract for crowd funding
 * @author Masum Reza, originally by Patrick Collins
 * @notice This contract is to demo a sample funding contract
 * @dev Implements price feeds as our library
 */
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public immutable i_owner;
    AggregatorV3Interface public priceFeed;

    // Events, Errors, Modifiers

    // custom modifiers are executed first if added to a function declaration
    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // do the rest of the code
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeedAddress) {
        // Constructor gets immediately called after deploying a contract
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        // if someone sends us money without calling the fund() operation
        // we still want to redirect them to the fund() operation
        // so we can add them to funders array
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function is used to fund the contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didn't send enough"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // reset the array
        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) {
            revert WithdrawFailed();
        }
    }
}
