pragma solidity ^0.4.19;

import "./external/IScheduler.sol";
import "./external/chronologic/Ownable.sol";

contract ProxyWallet is Ownable {
    mapping(address => bool) whitelist;
    IScheduler scheduler;

    constructor(address _chronosScheduler) public {
        whitelist[msg.sender] = true;
        scheduler = IScheduler(_chronosScheduler);
    }

    modifier isWhitelisted(address _test) {
        require(whitelist[_test]);
        _;
    }

    function proxy(
        address _target,
        bytes _callData
    ) isWhitelisted(msg.sender) public payable {
        _target.call.value(msg.value)(_callData);
    }

    function schedule(bytes _serializedTransaction)
        public
        payable
        isWhitelisted(msg.sender)
    {
        address scheduledTransaction = scheduler.schedule.value(msg.value)(_serializedTransaction);

        //sanity
        require(scheduledTransaction != 0x0);
        whitelist[scheduledTransaction] = true;
    }
}