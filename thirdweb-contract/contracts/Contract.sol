// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTTicketSaleContract is VRFConsumerBase, IERC721Receiver {
    // Variables
    uint256 public startTime;
    uint256 public endTime;
    uint256 public priceOfTicket;
    address public winner;

    // NFT Deposit Event
    event NFTDeposit(address indexed deployer, address indexed nftAddress);

    // Ticket Purchase Event
    event TicketPurchase(address indexed participant, uint256 ticketAmount);

    // Winner Selection Event
    event WinnerSelected(address indexed winner);

    // Chainlink VRF Variables
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    address public deployer;

    // Mapping to track ticket purchases
    mapping(address => uint256) public ticketPurchases;

    // Constructor
    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _priceOfTicket
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        keyHash = _keyHash;
        fee = _fee;
        startTime = _startTime;
        endTime = _endTime;
        priceOfTicket = _priceOfTicket;
        deployer = msg.sender;
    }

    // Deposit NFT into the contract
 // Deposit NFT into the contract
function depositNFT(address _nftAddress, uint256 _nftId) external {
    // Perform necessary validation
    require(_nftAddress != address(0), "Invalid NFT address");

    // Transfer the NFT to this contract
    IERC721 nftContract = IERC721(_nftAddress);
    require(nftContract.ownerOf(_nftId) == msg.sender, "You are not the owner of the NFT");

    // Approve the contract to spend the NFT
    nftContract.approve(address(this), _nftId);

    // Transfer the NFT to this contract
    nftContract.transferFrom(msg.sender, address(this), _nftId);

    emit NFTDeposit(msg.sender, _nftAddress);
}

    // Internal function to check if the recipient address supports ERC721
    function _checkERC721Support(address _nftAddress, address _recipient) internal returns (bool) {
        (bool success, bytes memory returnData) = _nftAddress.call(
            abi.encodeWithSelector(0x150b7a02, _recipient, uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF))
        );
        return success && (returnData.length > 0);
    }

    // Purchase ticket for the NFT sale
    function purchaseTicket(uint256 _ticketAmount) external payable {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Ticket sale is not active");
        require(msg.value == _ticketAmount * priceOfTicket, "Incorrect ticket payment amount");

        // Perform necessary validations and update ticket purchase information
        ticketPurchases[msg.sender] += _ticketAmount;

        emit TicketPurchase(msg.sender, _ticketAmount);
    }

    // Select the winner using Chainlink VRF
    function selectWinner() external returns (bytes32 requestId) {
        require(msg.sender == deployer, "Only the deployer can select the winner");
        require(block.timestamp > endTime, "Ticket sale is still active");

        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK tokens in the contract");

        // Request random number from Chainlink VRF
        return requestRandomness(keyHash, fee);
    }

    // Callback function for Chainlink VRF
    function fulfillRandomness(bytes32 _requestId, uint256 _randomness) internal override {
        randomResult = _randomness;

        // Perform winner selection logic using the random result
        uint256 ticketCount = getTotalTicketCount();
        uint256 randomIndex = randomResult % ticketCount;
        address[] memory addresses = getAllParticipantAddresses();
        winner = addresses[randomIndex];

        emit WinnerSelected(winner);
    }

    // Get the total count of purchased tickets
    function getTotalTicketCount() public view returns (uint256) {
        uint256 totalCount = 0;
        address[] memory addresses = getAllParticipantAddresses();
        for (uint256 i = 0; i < addresses.length; i++) {
            totalCount += ticketPurchases[addresses[i]];
        }
        return totalCount;
    }

    // Get all participant addresses
    function getAllParticipantAddresses() public view returns (address[] memory) {
        uint256 participantCount = 0;
        address[] memory addresses = new address[](participantCount);
        for (uint256 i = 0; i < addresses.length; i++) {
            if (ticketPurchases[addresses[i]] > 0) {
                addresses[participantCount] = addresses[i];
                participantCount++;
            }
        }
        return addresses;
    }

    // Function to receive ERC721 tokens
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}