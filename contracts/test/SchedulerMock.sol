pragma solidity ^0.4.19;

import "../external/IScheduler.sol";
import "./ScheduledTransactionMock.sol";
import "../external/chronos/EventEmitter.sol";

contract SchedulerMock is IScheduler {
    address public eventEmitter;

    constructor(
        address _eventEmitter
    ) public {
        eventEmitter = _eventEmitter;
    }

    function schedule(bytes _serializedTransaction)
        public payable returns (address scheduledTx)
    {

        scheduledTx = new ScheduledTransactionMock(msg.sender, true);

        EventEmitter(eventEmitter).logNewTransactionScheduled(scheduledTx, _serializedTransaction, msg.sender);
    }
}