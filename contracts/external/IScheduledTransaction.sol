pragma solidity ^0.4.19;

import "./chronologic/Ownable.sol";

contract IScheduledTransaction is Ownable {
    function canExecute(bytes _serializedTransaction)
        public view returns(bool);
}