pragma solidity ^0.4.22;

import "./external/LibBytes.sol";
import "./external/IValidator.sol";
import "./external/IScheduledTransaction.sol";
import "./external/chronologic/Ownable.sol";

contract ChronosValidator {
    function decodeSignature(
        bytes signature
    ) internal pure returns (
        address scheduledTxAddress,
        bytes memory serializedTransaction,
        bytes memory signed
    ) {
        scheduledTxAddress = LibBytes.readAddress(signature, 0x00);

        uint256 serializedTransactionLength = LibBytes.readUint256(signature, 0x14);

        serializedTransaction = LibBytes.slice(signature, 0x34, 0x34 + serializedTransactionLength);

        signed = LibBytes.slice(signature, 0x34 + serializedTransactionLength, signature.length);
    }

    function recoverAddress(
        bytes signature,
        address scheduledTxAddress,
        bytes32 orderHash
    ) internal pure returns (address recovered) {
        uint8 v = uint8(signature[0]);
        bytes32 r = LibBytes.readBytes32(signature, 1);
        bytes32 s = LibBytes.readBytes32(signature, 33);

        recovered = ecrecover(
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n52",
                    scheduledTxAddress,
                    orderHash
                )
            ),
            v,
            r,
            s
        );
    }

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
            bytes memory signed,
            address recovered,
            address scheduledTxOwner
        )
    {
        (scheduledTxAddress, serializedTransaction, signed) = decodeSignature(signature);

        recovered = recoverAddress(signed, scheduledTxAddress, hash);

        IScheduledTransaction scheduledTx = IScheduledTransaction(scheduledTxAddress);

        scheduledTxOwner = Ownable(scheduledTx.owner()).owner();
        isValid = (scheduledTxOwner == recovered) && (scheduledTxOwner == signerAddress);

        if (isValid) {
            isValid = scheduledTx.canExecute(serializedTransaction);
        }
    }
}