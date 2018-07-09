pragma solidity ^0.4.19;

contract ScheduledTransactionMock {
    bool _canExecute;

    constructor (bool _canExecuteParam) public {
        _canExecute = _canExecuteParam;
    }

    function canExecute(bytes _serializedTransaction)
        public view returns(bool)
    {
        return _canExecute;
    }
}