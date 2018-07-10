pragma solidity ^0.4.22;

import "./external/LibBytes.sol";
import "./external/IValidator.sol";
import "./external/IScheduledTransaction.sol";

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
        returns (
            bool isValid,
            address scheduledTxAddress,
            bytes memory serializedTransaction,
            uint256 serializedTransactionLength,
            bytes memory signed,
            address recovered
        )
    {
        scheduledTxAddress = LibBytes.readAddress(signature, 0x00);

        IScheduledTransaction scheduledTx = IScheduledTransaction(scheduledTxAddress);
        serializedTransactionLength = LibBytes.readUint256(signature, 0x14);

        serializedTransaction = LibBytes.slice(signature, 0x34, 0x34 + serializedTransactionLength);
        bool canExecute = scheduledTx.canExecute(serializedTransaction);

        signed = LibBytes.slice(signature, 0x34 + serializedTransactionLength, signature.length);

        isValid = canExecute;

        if (isValid) {
            uint8 v = uint8(signed[0]);
            bytes32 r = LibBytes.readBytes32(signed, 1);
            bytes32 s = LibBytes.readBytes32(signed, 33);

            recovered = ecrecover(
                keccak256(abi.encodePacked(
                    "\x19Ethereum Signed Message:\n20",
                    scheduledTxAddress
                )),
                v,
                r,
                s
            );

            // Ownable(scheduledTx.owner) is ProxyWallet
            // address secondOwner;
            // (secondOwner) = Ownable(scheduledTx.owner()).owner();
            // isValid = secondOwner == recovered;
        }
    }
}