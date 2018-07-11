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

    function schedule(bytes _serializedTransaction)// = 0x0 | 0x1
        public payable returns (address scheduledTx)
    {
        bool MOCK_CAN_EXECUTE = true;

        assembly {
            MOCK_CAN_EXECUTE := mload(add(_serializedTransaction, 32))
        }

        scheduledTx = new ScheduledTransactionMock(msg.sender, MOCK_CAN_EXECUTE);

        EventEmitter(eventEmitter).logNewTransactionScheduled(scheduledTx, _serializedTransaction, msg.sender);
    }
}