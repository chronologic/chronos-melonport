pragma solidity ^0.4.19;

contract IScheduler {
    function schedule(bytes _serializedTransaction) public payable returns (address scheduledTx);
}