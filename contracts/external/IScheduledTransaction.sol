pragma solidity ^0.4.19;

contract IScheduledTransaction {
    function canExecute(bytes _serializedTransaction)
        public view returns(bool);
}