const ChronosValidator = artifacts.require('./ChronosValidator.sol');
const ScheduledTransactionMock = artifacts.require('./Test/ScheduledTransactionMock.sol');
const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const stripHexPrefix = require('strip-hex-prefix');
const abi = require('ethereumjs-abi');

const TEST_PRIVATE_KEY = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

// Convert a hex string to a byte array
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
  bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] >>> 4).toString(16));
      hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join("");
}


// console.log(web3, web3.utils);
    // const EMPTY_SIGNATURE = '0x';
    // const fakeExchangeContractAddress = '0x1dc4c1cefef38a777b15aa20260a54e584b16c48';
    // const order = {
    //     makerAddress: constants.NULL_ADDRESS,
    //     takerAddress: constants.NULL_ADDRESS,
    //     senderAddress: constants.NULL_ADDRESS,
    //     feeRecipientAddress: constants.NULL_ADDRESS,
    //     makerAssetData: constants.NULL_ADDRESS,
    //     takerAssetData: constants.NULL_ADDRESS,
    //     exchangeAddress: fakeExchangeContractAddress,
    //     salt: new BigNumber(0),
    //     makerFee: new BigNumber(0),
    //     takerFee: new BigNumber(0),
    //     makerAssetAmount: new BigNumber(0),
    //     takerAssetAmount: new BigNumber(0),
    //     expirationTimeSeconds: new BigNumber(0),
    // };

const UINT256_0  = '0000000000000000000000000000000000000000000000000000000000000000';

const SERIALIZED_TX_DATA = '600034603b57602f80600f833981f36000368180378080368173bebebebebebebebebebebebebebebebebebebebe5af415602c573d81803e3d81f35b80fd';

function getBytesLengthFromHexString(hexString) {
  // one hex encodes half of byte
  return stripHexPrefix(hexString).length / 2;
}

contract('ChronosValidator', function(accounts) {
  it('should return false when ScheduledTransaction canExecute returns false', async function() {
    const chronosValidator = await ChronosValidator.deployed();

    const SCHEDULED_TRANSACTION_CAN_EXECUTE = false;

    const scheduledTransaction = await ScheduledTransactionMock.new(SCHEDULED_TRANSACTION_CAN_EXECUTE);

    const signature = scheduledTransaction.address + UINT256_0;

    const [isValid, returnedScheduledTxAddress] = await chronosValidator.isValidSignature.call(1, accounts[0], signature);

    assert.isFalse(isValid);
    assert.strictEqual(returnedScheduledTxAddress, scheduledTransaction.address);
  });

  it('should return true when ScheduledTransaction canExecute returns true and transaction is in execution window', async function() {
    const chronosValidator = await ChronosValidator.deployed();

    const SCHEDULED_TRANSACTION_CAN_EXECUTE = true;

    const scheduledTransaction = await ScheduledTransactionMock.new(SCHEDULED_TRANSACTION_CAN_EXECUTE);

    // const expectedOrderHash = '0x434c6b41e2fb6dfcfe1b45c4492fb03700798e9c1afc6f801ba6203f948c1fa7';

    // const orderHashWithEthSignPrefixHex = expectedOrderHash;//'ETH_SIGN{xyz:w}';
    // let orderHashWithEthSignPrefixBuffer = ethUtil.toBuffer(orderHashWithEthSignPrefixHex);
    const signerAddress = accounts[0];

    const signerPrivateKey = ethUtil.toBuffer(TEST_PRIVATE_KEY);

    const ecSignature = ethUtil.ecsign(ethUtil.sha3(scheduledTransaction.address), signerPrivateKey);

    // Create 0x signature from EthSign signature
    let signedScheduledTxAddress = ethUtil.bufferToHex(Buffer.concat([
        ethUtil.toBuffer(ecSignature.v),
        ecSignature.r,
        ecSignature.s
    ]));

    console.log('signed', signedScheduledTxAddress);

    // orderHashWithEthSignPrefixBuffer = orderHashWithEthSignPrefixBuffer.toString();

    const serializedScheduledTxDataByteLength = getBytesLengthFromHexString(SERIALIZED_TX_DATA);

    const serializedLength = stripHexPrefix(ethUtil.bufferToHex(abi.rawEncode([ 'uint256' ], [ serializedScheduledTxDataByteLength ])));

    const signature = scheduledTransaction.address + serializedLength + SERIALIZED_TX_DATA;

    console.log({
      // orderHashWithEthSignPrefixBuffer,
      signerAddress,
      signature
    });

    const [isValid, returnedScheduledTxAddress, returnedSerializedScheduledTxData] = await chronosValidator.isValidSignature.call(1, signerAddress, signature);

    console.log('data ss', returnedSerializedScheduledTxData);

    assert.isTrue(isValid);
    assert.strictEqual(returnedScheduledTxAddress, scheduledTransaction.address);
    assert.strictEqual(stripHexPrefix(returnedSerializedScheduledTxData), SERIALIZED_TX_DATA);
  });
});
