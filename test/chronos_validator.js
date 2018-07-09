const ChronosValidator = artifacts.require('./ChronosValidator.sol');
const ScheduledTransactionMock = artifacts.require('./Test/ScheduledTransactionMock.sol');
const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const TEST_PRIVATE_KEY = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

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

web3.utils = web3._extend.utils;

contract('ChronosValidator', function(accounts) {
  it('should return false when ScheduledTransaction canExecute returns false', async function() {
    const chronosValidator = await ChronosValidator.deployed();

    const SCHEDULED_TRANSACTION_CAN_EXECUTE = false;

    const scheduledTransaction = await ScheduledTransactionMock.new(SCHEDULED_TRANSACTION_CAN_EXECUTE);

    const [isValid, returnedScheduledTxAddress] = await chronosValidator.isValidSignature.call(1, accounts[0], scheduledTransaction.address);

    assert.isFalse(isValid);
    assert.strictEqual(returnedScheduledTxAddress, scheduledTransaction.address);
  });

  it('should return true when ScheduledTransaction canExecute returns true and transaction is in execution window', async function() {
    const chronosValidator = await ChronosValidator.deployed();

    const SCHEDULED_TRANSACTION_CAN_EXECUTE = true;

    const scheduledTransaction = await ScheduledTransactionMock.new(SCHEDULED_TRANSACTION_CAN_EXECUTE);

    const scheduledTransactionAddress = scheduledTransaction.address;

    const expectedOrderHash = '0x434c6b41e2fb6dfcfe1b45c4492fb03700798e9c1afc6f801ba6203f948c1fa7';

    const orderHashWithEthSignPrefixHex = expectedOrderHash;//'ETH_SIGN{xyz:w}';
    let orderHashWithEthSignPrefixBuffer = ethUtil.toBuffer(orderHashWithEthSignPrefixHex);
    const signerAddress = accounts[0];

    const signerPrivateKey = ethUtil.toBuffer(TEST_PRIVATE_KEY);

    const ecSignature = ethUtil.ecsign(orderHashWithEthSignPrefixBuffer, signerPrivateKey);

    // Create 0x signature from EthSign signature
    let signature = Buffer.concat([
        ethUtil.toBuffer(ecSignature.v),
        ecSignature.r,
        ecSignature.s
    ]);

    signature = ethUtil.bufferToHex(signature);

    const scheduledTransactionAddressWithoutHexPrefix = scheduledTransactionAddress.slice(2, scheduledTransactionAddress.length);

    signature = signature + scheduledTransactionAddressWithoutHexPrefix;

    orderHashWithEthSignPrefixBuffer = orderHashWithEthSignPrefixBuffer.toString();

    console.log({
      orderHashWithEthSignPrefixBuffer,
      signerAddress,
      signature
    });

    const [isValid, returnedScheduledTxAddress] = await chronosValidator.isValidSignature.call(1, signerAddress, signature);

    assert.isTrue(isValid);
    assert.strictEqual(returnedScheduledTxAddress, scheduledTransactionAddress);
  });
});
