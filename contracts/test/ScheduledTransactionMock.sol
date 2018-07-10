pragma solidity ^0.4.19;

import "../external/chronologic/Ownable.sol";

contract ScheduledTransactionMock is Ownable {
    bool _canExecute;

    constructor (address _owner, bool _canExecuteParam) public {
        owner = _owner;
        _canExecute = _canExecuteParam;
    }

    function canExecute(bytes _serializedTransaction)
        public view returns(bool)
    {
        return _canExecute;
    }
}