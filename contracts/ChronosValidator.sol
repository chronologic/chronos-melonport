pragma solidity ^0.4.22;

import "./external/zeroex/2.0.0/utils/LibBytes/LibBytes.sol";
import "./external/IValidator.sol";
import "./external/chronos/ScheduledTransaction.sol";

contract ChronosValidator {

    /// @dev Verifies that a signature is valid.
    /// @param hash Message hash that is signed.
    /// @param signerAddress Address that should have signed the given hash.
    /// @param signature Proof of signing.
    /// @return Validity of order signature.
    function isValidSignature(
        bytes32 hash,
        address signerAddress,
        bytes signature
    )
        external
        view
        returns (bool isValid, address scheduledTxAddress, bytes memory serializedTransaction)
    {

        scheduledTxAddress = LibBytes.readAddress(signature, 0x00);

        ScheduledTransaction scheduledTx = ScheduledTransaction(scheduledTxAddress);

        serializedTransaction = LibBytes.readBytesWithLength(signature, 0x14);
        bool canExecute = scheduledTx.canExecute(serializedTransaction);

        isValid = canExecute;

        // if (isValid) {
        //     uint8 v = uint8(signature[0]);
        //     bytes32 r = LibBytes.readBytes32(signature, 1);
        //     bytes32 s = LibBytes.readBytes32(signature, 33);

        //     address recovered = ecrecover(
        //         keccak256(abi.encodePacked(
        //             "\x19Ethereum Signed Message:\n32",
        //             scheduledTxAddress
        //         )),
        //         v,
        //         r,
        //         s
        //     );

        //     // Ownable(scheduledTx.owner) is ProxyWallet
        //     address secondOwner;
        //     (secondOwner) = Ownable(scheduledTx.owner()).owner();
        //     isValid = secondOwner == recovered;
        // }

        // return isValid;
    }
}