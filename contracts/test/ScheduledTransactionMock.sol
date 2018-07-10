pragma solidity ^0.4.19;

contract ScheduledTransactionMock {
    bool _canExecute;

    address owner;

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