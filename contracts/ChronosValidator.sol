pragma solidity ^0.4.22;

import "./external/IValidator.sol";
import "./external/chronos/ScheduledTransaction.sol";
import "./external/zeroex/2.0.0/utils/LibBytes/LibBytes.sol";

contract ChronosValidator is IValidator {

    /// @dev Verifies that a signature is valid.
    /// @param hash Message hash that is signed.
    /// @param signerAddress Address that should have signed the given hash.
    /// @param signature Proof of signing.
    /// @return Validity of order signature.
    function isValidSignature (
        bytes32 hash,
        address signerAddress,
        bytes signature
    ) public {
        address scheduledTxAddress = signature.popLast20Bytes();

        ScheduledTransaction scheduledTx = ScheduledTransaction(scheduledTxAddress);

        bool canExecute = scheduledTx.canExecute();

        bool isValid = canExecute;

        if (isValid) {
            uint8 v = uint8(signature[0]);
            bytes32 r = signature.readBytes32(1);
            bytes32 s = signature.readBytes32(33);

            address recovered = ecrecover(
                keccak256(abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    scheduledTxAddress
                )),
                v,
                r,
                s
            );

            // Ownable(scheduledTx.owner) is ProxyWallet
            isValid = Ownable(scheduledTx.owner).owner == recovered;
        }

        return isValid;
    }
}