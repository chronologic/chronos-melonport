const ChronosValidator = artifacts.require('./ChronosValidator.sol');
const SchedulerMock = artifacts.require('./Test/SchedulerMock.sol');
const EventEmitter = artifacts.require('./external/chronos/EventEmitter.sol');
const ProxyWallet = artifacts.require('./ProxyWallet.sol');
const ScheduledTransactionMock = artifacts.require('./Test/ScheduledTransactionMock.sol');
const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const stripHexPrefix = require('strip-hex-prefix');
const abi = require('ethereumjs-abi');

const TEST_PRIVATE_KEY = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';
const TEST_ACCOUNT_ADDRESS = '0x627306090abab3a6e1400e9345bc60c78a8bef57';

const Constants = {
  NEWREQUESTLOG: '0x94c6f2d01cc82df9dceeabfd7786c57a01cd9796e7cab146d2d0cf5c8380310d'
};

const getTxRequestFromReceipt = (receipt) => {
  const log = receipt.logs.find(log => log.topics[0] === Constants.NEWREQUESTLOG)
  return "0x".concat(log.data.slice(26, 66));
}

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

    const scheduledTransaction = await ScheduledTransactionMock.new(TEST_ACCOUNT_ADDRESS, SCHEDULED_TRANSACTION_CAN_EXECUTE);

    const signature = scheduledTransaction.address + UINT256_0;

    const [isValid, returnedScheduledTxAddress] = await chronosValidator.isValidSignature.call(1, TEST_ACCOUNT_ADDRESS, signature);

    assert.isFalse(isValid);
    assert.strictEqual(returnedScheduledTxAddress, scheduledTransaction.address);
  });

  it('should return true when ScheduledTransaction canExecute returns true and transaction is in execution window', async function() {
    const chronosValidator = await ChronosValidator.deployed();

    const signerAddress = TEST_ACCOUNT_ADDRESS;

    const eventEmitter = await EventEmitter.new();
    const scheduler = await SchedulerMock.new(eventEmitter.address);

    const proxyWallet = await ProxyWallet.new(scheduler.address);

    const scheduleTransactionTx = await proxyWallet.schedule('0x1');
    const scheduledTransactionAddress = getTxRequestFromReceipt(scheduleTransactionTx.receipt)

    const signerPrivateKey = ethUtil.toBuffer(TEST_PRIVATE_KEY);

    const ecSignature = ethUtil.ecsign(
      ethUtil.hashPersonalMessage(ethUtil.toBuffer(scheduledTransactionAddress)),
      signerPrivateKey
    );

    // Create 0x signature from EthSign signature
    let signedScheduledTxAddress = stripHexPrefix(ethUtil.bufferToHex(Buffer.concat([
        ethUtil.toBuffer(ecSignature.v),
        ecSignature.r,
        ecSignature.s
    ])));

    console.log('signed', signedScheduledTxAddress);

    const serializedScheduledTxDataByteLength = getBytesLengthFromHexString(SERIALIZED_TX_DATA);

    const serializedLength = stripHexPrefix(ethUtil.bufferToHex(abi.rawEncode([ 'uint256' ], [ serializedScheduledTxDataByteLength ])));

    const signature = scheduledTransactionAddress + serializedLength + SERIALIZED_TX_DATA
      + signedScheduledTxAddress;

    console.log({
      signerAddress,
      signature
    });

    const [
      isValid,
      returnedScheduledTxAddress,
      returnedSerializedScheduledTxData,
      signed,
      recovered,
      secondOwner
    ] = await chronosValidator.isValidSignature.call(1, signerAddress, signature);

    assert.isTrue(isValid);
    assert.strictEqual(returnedScheduledTxAddress, scheduledTransactionAddress);
    assert.strictEqual(stripHexPrefix(returnedSerializedScheduledTxData), SERIALIZED_TX_DATA);
    assert.strictEqual(stripHexPrefix(signed), signedScheduledTxAddress);
    assert.strictEqual(recovered, signerAddress);
    assert.strictEqual(secondOwner, signerAddress);
  });
});
