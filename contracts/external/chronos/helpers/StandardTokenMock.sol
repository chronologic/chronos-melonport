pragma solidity ^0.4.21;

import "../../chronologic/StandardToken.sol";

contract StandardTokenMock is StandardToken {
    function StandardTokenMock() {
        balances[msg.sender] = 1000000;
        totalSupply = balances[msg.sender];
    }
}