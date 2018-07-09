const ChronosValidator = artifacts.require('./ChronosValidator.sol');
const ethUtil = require('ethereumjs-util');

const TEST_PRIVATE_KEY = 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

contract('ChronosValidator', function(accounts) {
  it('should assert true', async function(done) {
    const chronosValidator = await ChronosValidator.deployed();

    const orderHashWithEthSignPrefixHex = 'ETH_SIGN{xyz:w}';
    const orderHashWithEthSignPrefixBuffer = ethUtil.toBuffer(orderHashWithEthSignPrefixHex);
    const signerAddress = accounts[0];
    console.log('sa', signerAddress);
    const signerPrivateKey = TEST_PRIVATE_KEY;
    const scheduledTransactionAddress = '0x752d48691533324f4e69c2ad94fde68f7104ca28';
    const EMPTY_SIGNATURE = '0x';

    const ecSignature = ethUtil.ecsign(orderHashWithEthSignPrefixBuffer, signerPrivateKey);
    // Create 0x signature from EthSign signature
    const signature = Buffer.concat([
        ethUtil.toBuffer(ecSignature.v),
        ecSignature.r,
        ecSignature.s,
        scheduledTransactionAddress
    ]);

    const isValidFirst = chronosValidator.isValidSignature(hash, signerAddress, signature);

    assert.isFalse(isValidFirst);

    done();
  });
});
